/**
 * Debug: execute each LLM workflow and print the actual error message.
 */
import { config } from 'dotenv';
config();

const BASE = process.env.N8N_BASE_URL || 'http://localhost:5678';
const API_KEY = process.env.N8N_API_KEY || '';
const EMAIL = process.env.N8N_EMAIL || '';
const PASSWORD = process.env.N8N_PASSWORD || '';

let cookie = '';

async function login() {
	const res = await fetch(`${BASE}/rest/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ emailOrLdapLoginId: EMAIL, password: PASSWORD }),
	});
	const cookies = res.headers.getSetCookie?.() || [];
	cookie = (cookies.find(c => c.startsWith('n8n-auth=')) || '').split(';')[0];
	const data = await res.json() as any;
	if (!data.data?.id) throw new Error(`Login failed: ${data.message}`);
}

async function pubApi(method: string, path: string, body?: unknown) {
	const res = await fetch(`${BASE}/api/v1${path}`, {
		method,
		headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' },
		body: body ? JSON.stringify(body) : undefined,
	});
	return res.json();
}

async function intApi(method: string, path: string, body?: unknown) {
	const res = await fetch(`${BASE}${path}`, {
		method,
		headers: { 'Content-Type': 'application/json', Cookie: cookie },
		body: body ? JSON.stringify(body) : undefined,
	});
	return res.json();
}

async function main() {
	await login();
	console.log('Logged in.\n');

	const wfs = (await pubApi('GET', '/workflows') as any).data;
	const llmWfs = wfs.filter((w: any) => w.name.startsWith('LLM_Test_'));

	for (const wfSummary of llmWfs) {
		console.log(`=== ${wfSummary.name} ===`);
		const wf = await pubApi('GET', `/workflows/${wfSummary.id}`) as any;

		const trigger = wf.nodes.find((n: any) => n.type.includes('manualTrigger'));
		if (!trigger) { console.log('  No trigger found\n'); continue; }

		try {
			const result = await intApi('POST', `/rest/workflows/${wfSummary.id}/run`, {
				workflowData: wf,
				triggerToStartFrom: { name: trigger.name, data: [[{ json: {} }]] },
			}) as any;

			const execId = result.data?.executionId;
			if (!execId) { console.log(`  No execution ID: ${JSON.stringify(result).slice(0, 200)}\n`); continue; }

			console.log(`  Execution: ${execId}`);
			await new Promise(r => setTimeout(r, 10000)); // Wait for LLM

			// Get execution with data
			const exec = await intApi('GET', `/rest/executions/${execId}?includeData=true`) as any;
			const status = exec.data?.status;
			console.log(`  Status: ${status}`);

			if (status === 'error') {
				// Parse flatted data to find error
				const dataStr = exec.data?.data;
				if (typeof dataStr === 'string') {
					try {
						const flatted = JSON.parse(dataStr);
						// Search for error messages in the flatted array
						for (const item of flatted) {
							if (typeof item === 'string' && item.length > 20 && item.length < 1000) {
								if (item.includes('401') || item.includes('403') || item.includes('error') ||
									item.includes('invalid') || item.includes('Incorrect') ||
									item.includes('key') || item.includes('auth') || item.includes('credential')) {
									console.log(`  ERROR: ${item.slice(0, 300)}`);
								}
							}
						}
					} catch {}
				}
			} else if (status === 'success') {
				console.log('  ✓ SUCCESS');
			}
		} catch (e: any) {
			console.log(`  Execute failed: ${e.message.slice(0, 200)}`);
		}
		console.log();
	}
}

main().catch(console.error);
