/**
 * Integration test runner: imports workflows, creates credentials,
 * executes workflows with different LLM providers, and reports results.
 *
 * Usage: npx tsx scripts/run-integration-tests.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

config();

const N8N_BASE = process.env.N8N_BASE_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY || '';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const GEMINI_KEY = process.env.GOOGLE_AI_API_KEY || '';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const GROQ_KEY = process.env.GROQ_API_KEY || '';

async function api(method: string, path: string, body?: unknown) {
	const res = await fetch(`${N8N_BASE}/api/v1${path}`, {
		method,
		headers: { 'X-N8N-API-KEY': N8N_API_KEY, 'Content-Type': 'application/json' },
		body: body ? JSON.stringify(body) : undefined,
	});
	const text = await res.text();
	if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${text}`);
	return JSON.parse(text);
}

async function createCredential(name: string, type: string, data: Record<string, unknown>) {
	try {
		const result = await api('POST', '/credentials', { name, type, data });
		console.log(`  ✓ Created credential: ${name} (${type}) → id=${result.id}`);
		return result.id as string;
	} catch (e: any) {
		console.log(`  ✗ Failed to create credential ${name}: ${e.message}`);
		return null;
	}
}

async function importWorkflow(filename: string): Promise<{ id: string; name: string } | null> {
	try {
		const filepath = join(process.cwd(), 'test-data', 'workflows', filename);
		const wf = JSON.parse(readFileSync(filepath, 'utf-8'));
		delete wf.id;
		delete wf.meta;
		const result = await api('POST', '/workflows', wf);
		console.log(`  ✓ Imported: ${result.name} → id=${result.id}`);
		return { id: result.id, name: result.name };
	} catch (e: any) {
		console.log(`  ✗ Failed to import ${filename}: ${e.message}`);
		return null;
	}
}

async function executeWorkflow(id: string, inputData?: Record<string, unknown>): Promise<any> {
	try {
		const result = await api('POST', `/workflows/${id}/run`, inputData || {});
		return result;
	} catch (e: any) {
		// Try the test webhook approach for manual trigger workflows
		console.log(`    (run API failed: ${e.message.slice(0, 100)}, trying test execution...)`);
		return null;
	}
}

async function getExecution(id: string) {
	return api('GET', `/executions/${id}`);
}

async function waitForExecution(execId: string, timeoutMs = 120000): Promise<any> {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		const exec = await getExecution(execId);
		if (['success', 'error', 'canceled'].includes(exec.status)) {
			return exec;
		}
		await new Promise(r => setTimeout(r, 2000));
	}
	throw new Error(`Execution ${execId} timed out after ${timeoutMs}ms`);
}

async function main() {
	console.log('=== n8n Integration Test Runner ===\n');

	// Step 1: Create credentials
	console.log('Step 1: Creating LLM credentials...');
	const credIds: Record<string, string | null> = {};

	if (OPENAI_KEY) {
		credIds.openai = await createCredential('OpenAI', 'openAiApi', {
			apiKey: OPENAI_KEY,
			url: 'https://api.openai.com',
			header: false,
		});
	} else {
		console.log('  ⚠ OPENAI_API_KEY not set, skipping');
	}

	if (GEMINI_KEY) {
		credIds.gemini = await createCredential('Google Gemini', 'googlePalmApi', {
			host: 'https://generativelanguage.googleapis.com',
			apiKey: GEMINI_KEY,
		});
	} else {
		console.log('  ⚠ GOOGLE_AI_API_KEY not set, skipping');
	}

	if (ANTHROPIC_KEY) {
		credIds.anthropic = await createCredential('Anthropic', 'anthropicApi', {
			apiKey: ANTHROPIC_KEY,
			url: 'https://api.anthropic.com',
			header: false,
		});
	} else {
		console.log('  ⚠ ANTHROPIC_API_KEY not set, skipping');
	}

	if (GROQ_KEY) {
		credIds.groq = await createCredential('Groq', 'groqApi', { apiKey: GROQ_KEY });
	} else {
		console.log('  ⚠ GROQ_API_KEY not set, skipping');
	}

	// Step 2: Import workflows
	console.log('\nStep 2: Importing workflows...');
	const workflows: Record<string, { id: string; name: string } | null> = {};

	const files = [
		'W0_Compile_Then_Run.json',
		'W1_Compile_Source_Prompt.json',
		'W1_Compile_Source_Prompt_Gemini.json',
		'W1_Compile_Source_Prompt_Claude.json',
		'W1_Compile_Source_Prompt_Groq.json',
		'W2_Execute_Step.json',
		'W2_Execute_Step_Gemini.json',
		'W2_Execute_Step_Claude.json',
		'W2_Execute_Step_Groq.json',
		'W3_Run_Compiled_Graph.json',
	];

	for (const f of files) {
		workflows[f] = await importWorkflow(f);
	}

	// Step 3: Test simple workflow execution (W1 with minimal prompt)
	console.log('\nStep 3: Testing workflow execution...');

	// Test each W1 variant with the minimal "echo test" prompt
	const w1Variants = [
		{ file: 'W1_Compile_Source_Prompt.json', provider: 'OpenAI', credKey: 'openai' },
		{ file: 'W1_Compile_Source_Prompt_Gemini.json', provider: 'Gemini', credKey: 'gemini' },
		{ file: 'W1_Compile_Source_Prompt_Claude.json', provider: 'Claude', credKey: 'anthropic' },
		{ file: 'W1_Compile_Source_Prompt_Groq.json', provider: 'Groq', credKey: 'groq' },
	];

	for (const variant of w1Variants) {
		const wf = workflows[variant.file];
		if (!wf) {
			console.log(`  ⚠ ${variant.provider}: workflow not imported, skipping`);
			continue;
		}
		if (!credIds[variant.credKey]) {
			console.log(`  ⚠ ${variant.provider}: no credential, skipping execution`);
			continue;
		}

		console.log(`\n  Testing ${variant.provider} (${wf.name})...`);
		const result = await executeWorkflow(wf.id);
		if (result?.data?.id) {
			console.log(`    Execution started: ${result.data.id}`);
			try {
				const exec = await waitForExecution(result.data.id, 60000);
				console.log(`    Status: ${exec.status}`);
				if (exec.status === 'error' && exec.data?.resultData?.error) {
					console.log(`    Error: ${exec.data.resultData.error.message}`);
				}
			} catch (e: any) {
				console.log(`    ${e.message}`);
			}
		} else {
			console.log(`    Could not start execution (manual trigger workflows need UI interaction)`);
		}
	}

	// Step 4: Summary
	console.log('\n=== Summary ===');
	console.log(`Credentials created: ${Object.values(credIds).filter(Boolean).length}/4`);
	console.log(`Workflows imported: ${Object.values(workflows).filter(Boolean).length}/${files.length}`);

	// List all workflows with their IDs for reference
	console.log('\nWorkflow IDs (for manual testing in the app):');
	for (const [file, wf] of Object.entries(workflows)) {
		if (wf) console.log(`  ${wf.id}: ${wf.name}`);
	}

	console.log('\nCredential IDs:');
	for (const [name, id] of Object.entries(credIds)) {
		if (id) console.log(`  ${id}: ${name}`);
	}

	console.log('\nDone. Open http://localhost:1420 to see the workflows in the app.');
}

main().catch(console.error);
