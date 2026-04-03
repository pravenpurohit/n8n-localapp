/**
 * Test workflow execution via n8n internal REST API with session auth.
 * Logs in, imports workflows, executes them, and reports results.
 */
import { config } from 'dotenv';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
config();

const BASE = process.env.N8N_BASE_URL || 'http://localhost:5678';
const API_KEY = process.env.N8N_API_KEY || '';
const EMAIL = process.env.N8N_EMAIL || '';
const PASSWORD = process.env.N8N_PASSWORD || '';

let sessionCookie = '';

async function publicApi(method: string, path: string, body?: unknown) {
	const res = await fetch(`${BASE}/api/v1${path}`, {
		method,
		headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' },
		body: body ? JSON.stringify(body) : undefined,
	});
	if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${await res.text()}`);
	return res.json();
}

async function internalApi(method: string, path: string, body?: unknown) {
	const res = await fetch(`${BASE}${path}`, {
		method,
		headers: {
			'Content-Type': 'application/json',
			'Cookie': sessionCookie,
		},
		body: body ? JSON.stringify(body) : undefined,
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`${method} ${path}: ${res.status} ${text.slice(0, 300)}`);
	}
	return res.json();
}

async function login() {
	const res = await fetch(`${BASE}/rest/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ emailOrLdapLoginId: EMAIL, password: PASSWORD }),
	});
	const cookies = res.headers.getSetCookie?.() || [];
	const authCookie = cookies.find(c => c.startsWith('n8n-auth='));
	if (authCookie) {
		sessionCookie = authCookie.split(';')[0];
	}
	const data = await res.json() as any;
	if (!data.data?.id) throw new Error(`Login failed: ${data.message || 'unknown'}`);
	return data.data.id;
}

async function importWorkflow(filename: string) {
	const filepath = join(process.cwd(), 'test-data', 'workflows', filename);
	const wf = JSON.parse(readFileSync(filepath, 'utf-8'));
	delete wf.id;
	delete wf.meta;
	return publicApi('POST', '/workflows', wf) as Promise<any>;
}

async function executeWorkflow(workflowId: string) {
	// Get full workflow data
	const wf = await publicApi('GET', `/workflows/${workflowId}`) as any;

	// Find the trigger node
	const triggerNode = wf.nodes.find((n: any) =>
		n.type.includes('manualTrigger') ||
		n.type.includes('webhook') ||
		n.type.includes('executeWorkflowTrigger')
	);

	// Execute via internal API using triggerToStartFrom (matches n8n UI behavior)
	const payload: any = {
		workflowData: wf,
	};

	if (triggerNode) {
		payload.triggerToStartFrom = { name: triggerNode.name, data: [[{ json: {} }]] };
	} else {
		payload.startNodes = [];
		payload.runData = {};
	}

	const result = await internalApi('POST', `/rest/workflows/${workflowId}/run`, payload);
	return result;
}

async function getExecution(execId: string) {
	return publicApi('GET', `/executions/${execId}`);
}

async function waitForExecution(execId: string, timeoutMs = 120000) {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		try {
			const exec = await getExecution(execId) as any;
			if (['success', 'error', 'canceled'].includes(exec.status)) return exec;
		} catch { /* execution may not be queryable yet */ }
		await new Promise(r => setTimeout(r, 2000));
	}
	throw new Error(`Timeout waiting for execution ${execId}`);
}

interface TestResult {
	workflow: string;
	status: 'pass' | 'fail' | 'skip';
	executionId?: string;
	executionStatus?: string;
	nodeResults?: Record<string, string>;
	error?: string;
	durationMs?: number;
}

async function main() {
	console.log('=== Workflow Execution Tests ===\n');
	mkdirSync('test-results', { recursive: true });

	// Login
	console.log('Logging in...');
	try {
		const userId = await login();
		console.log(`  ✓ Logged in as ${EMAIL} (${userId})\n`);
	} catch (e: any) {
		console.log(`  ✗ Login failed: ${e.message}`);
		return;
	}

	// Import a simple test workflow (W0 — no LLM, no data tables)
	console.log('Importing W0 (orchestrator, no LLM)...');
	let w0: any;
	try {
		w0 = await importWorkflow('W0_Compile_Then_Run.json');
		console.log(`  ✓ Imported: ${w0.id}\n`);
	} catch (e: any) {
		console.log(`  ✗ Import failed: ${e.message}\n`);
		return;
	}

	const results: TestResult[] = [];

	// Test 1: Execute W0
	console.log('Test 1: Execute W0_Compile_Then_Run...');
	const start = Date.now();
	try {
		const execResult = await executeWorkflow(w0.id) as any;
		console.log(`  Execution started: ${JSON.stringify(execResult).slice(0, 200)}`);

		// The internal API returns the execution data directly
		if (execResult.data?.resultData) {
			const runData = execResult.data.resultData.runData || {};
			const nodeNames = Object.keys(runData);
			const nodeStatuses: Record<string, string> = {};
			for (const [name, results] of Object.entries(runData) as any) {
				const last = results[results.length - 1];
				nodeStatuses[name] = last.error ? 'error' : 'success';
			}
			console.log(`  Nodes executed: ${nodeNames.length}`);
			for (const [name, status] of Object.entries(nodeStatuses)) {
				console.log(`    ${status === 'success' ? '✓' : '✗'} ${name}: ${status}`);
			}
			results.push({
				workflow: 'W0_Compile_Then_Run',
				status: Object.values(nodeStatuses).every(s => s === 'success') ? 'pass' : 'fail',
				nodeResults: nodeStatuses,
				durationMs: Date.now() - start,
			});
		} else {
			// Might return an execution ID to poll
			const execId = execResult.executionId || execResult.data?.executionId;
			if (execId) {
				console.log(`  Polling execution ${execId}...`);
				const exec = await waitForExecution(execId, 30000) as any;
				console.log(`  Status: ${exec.status}`);
				results.push({
					workflow: 'W0_Compile_Then_Run',
					status: exec.status === 'success' ? 'pass' : 'fail',
					executionId: execId,
					executionStatus: exec.status,
					durationMs: Date.now() - start,
				});
			} else {
				console.log(`  Unexpected response: ${JSON.stringify(execResult).slice(0, 300)}`);
				results.push({
					workflow: 'W0_Compile_Then_Run',
					status: 'fail',
					error: 'Unexpected execution response',
					durationMs: Date.now() - start,
				});
			}
		}
	} catch (e: any) {
		console.log(`  ✗ Execution failed: ${e.message.slice(0, 300)}`);
		results.push({
			workflow: 'W0_Compile_Then_Run',
			status: 'fail',
			error: e.message,
			durationMs: Date.now() - start,
		});
	}

	// Clean up
	await publicApi('DELETE', `/workflows/${w0.id}`).catch(() => {});

	// Summary
	console.log('\n=== Results ===');
	for (const r of results) {
		const icon = r.status === 'pass' ? '✓' : r.status === 'skip' ? '⚠' : '✗';
		console.log(`  ${icon} ${r.workflow}: ${r.status} (${r.durationMs}ms)`);
		if (r.error) console.log(`    Error: ${r.error.slice(0, 200)}`);
		if (r.nodeResults) {
			for (const [name, status] of Object.entries(r.nodeResults)) {
				console.log(`    ${status === 'success' ? '✓' : '✗'} ${name}`);
			}
		}
	}

	writeFileSync('test-results/execution-results.json', JSON.stringify(results, null, 2));
	console.log('\nSaved to test-results/execution-results.json');
}

main().catch(console.error);
