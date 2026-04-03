/**
 * Execute W1 Groq workflow with the echo test prompt.
 * Modifies the workflow to use a Webhook trigger, activates it, calls it, and reports results.
 */
import { config } from 'dotenv';
config();

const BASE = process.env.N8N_BASE_URL || 'http://localhost:5678';
const API_KEY = process.env.N8N_API_KEY || '';

async function api(method: string, path: string, body?: unknown) {
	const res = await fetch(`${BASE}/api/v1${path}`, {
		method,
		headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' },
		body: body ? JSON.stringify(body) : undefined,
	});
	const text = await res.text();
	if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${text}`);
	return JSON.parse(text);
}

async function main() {
	// Find the Groq W1 workflow
	const workflows = await api('GET', '/workflows');
	const groqW1 = workflows.data.find((w: any) => w.name === 'W1_Compile_Source_Prompt_Groq');
	if (!groqW1) { console.log('W1 Groq not found'); return; }
	console.log(`Found: ${groqW1.name} (${groqW1.id})`);

	// Get full workflow
	const wf = await api('GET', `/workflows/${groqW1.id}`);

	// Replace Manual Trigger with Webhook
	for (let i = 0; i < wf.nodes.length; i++) {
		if (wf.nodes[i].type === 'n8n-nodes-base.manualTrigger') {
			wf.nodes[i] = {
				parameters: { httpMethod: 'POST', path: 'w1-groq', responseMode: 'lastNode', options: {} },
				id: wf.nodes[i].id,
				name: 'Webhook',
				type: 'n8n-nodes-base.webhook',
				typeVersion: 2,
				position: wf.nodes[i].position,
				webhookId: 'w1-groq-test',
			};
		}
		// Set default input data
		if (wf.nodes[i].name === 'Input') {
			wf.nodes[i].parameters.assignments.assignments = [
				{ id: 'a1', name: 'graphName', value: 'Echo Test', type: 'string' },
				{ id: 'a2', name: 'sourcePrompt', value: "Return the text 'hello world' in a JSON object with key 'message'.", type: 'string' },
			];
		}
	}

	// Fix connections
	if (wf.connections['Manual Trigger']) {
		wf.connections['Webhook'] = wf.connections['Manual Trigger'];
		delete wf.connections['Manual Trigger'];
	}

	// Update workflow
	try {
		await api('PUT', `/workflows/${groqW1.id}`, {
			name: wf.name,
			nodes: wf.nodes,
			connections: wf.connections,
			settings: wf.settings,
		});
		console.log('Updated workflow with Webhook trigger');
	} catch (e: any) {
		console.log(`Update failed: ${e.message}`);
		return;
	}

	// Activate
	try {
		await api('POST', `/workflows/${groqW1.id}/activate`, {});
		console.log('Activated workflow');
	} catch (e: any) {
		console.log(`Activate failed: ${e.message}`);
		return;
	}

	// Wait a moment for webhook to register
	await new Promise(r => setTimeout(r, 2000));

	// Call the webhook
	console.log('Calling webhook...');
	try {
		const res = await fetch(`${BASE}/webhook/w1-groq`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				graphName: 'Echo Test',
				sourcePrompt: "Return the text 'hello world' in a JSON object with key 'message'.",
			}),
		});
		const text = await res.text();
		console.log(`Webhook response: ${res.status}`);
		console.log(`Body (first 500 chars): ${text.slice(0, 500)}`);

		// Check executions
		const execs = await api('GET', `/executions?workflowId=${groqW1.id}&limit=1`);
		if (execs.data.length > 0) {
			const exec = execs.data[0];
			console.log(`\nExecution: ${exec.id} status=${exec.status}`);
			if (exec.status === 'error') {
				const fullExec = await api('GET', `/executions/${exec.id}`);
				console.log(`Error: ${JSON.stringify(fullExec.data?.resultData?.error || 'unknown')}`);
			}
		}
	} catch (e: any) {
		console.log(`Webhook call failed: ${e.message}`);
	}

	// Deactivate
	await api('POST', `/workflows/${groqW1.id}/deactivate`, {}).catch(() => {});
	console.log('\nDone.');
}

main().catch(console.error);
