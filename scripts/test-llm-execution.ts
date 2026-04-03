/**
 * Test LLM execution for each provider by creating minimal webhook workflows
 * that just call the LLM and return the response. No Data Tables needed.
 */
import { config } from 'dotenv';
import { writeFileSync } from 'fs';
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

interface LlmProvider {
	name: string;
	nodeType: string;
	modelParam: Record<string, unknown>;
	credType: string;
	webhookPath: string;
}

const providers: LlmProvider[] = [
	{
		name: 'OpenAI',
		nodeType: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
		modelParam: { model: 'gpt-4o-mini', options: {} },
		credType: 'openAiApi',
		webhookPath: 'test-openai',
	},
	{
		name: 'Groq',
		nodeType: '@n8n/n8n-nodes-langchain.lmChatGroq',
		modelParam: { model: 'llama-3.1-8b-instant', options: {} },
		credType: 'groqApi',
		webhookPath: 'test-groq',
	},
	{
		name: 'Anthropic',
		nodeType: '@n8n/n8n-nodes-langchain.lmChatAnthropic',
		modelParam: { model: 'claude-3-5-haiku-20241022', options: {} },
		credType: 'anthropicApi',
		webhookPath: 'test-anthropic',
	},
	{
		name: 'Gemini',
		nodeType: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
		modelParam: { modelName: 'models/gemini-2.0-flash', options: {} },
		credType: 'googlePalmApi',
		webhookPath: 'test-gemini',
	},
];

function buildTestWorkflow(provider: LlmProvider, credId: string) {
	return {
		name: `LLM Test - ${provider.name}`,
		nodes: [
			{
				parameters: { httpMethod: 'POST', path: provider.webhookPath, responseMode: 'lastNode', options: {} },
				id: 'webhook',
				name: 'Webhook',
				type: 'n8n-nodes-base.webhook',
				typeVersion: 2,
				position: [0, 0],
				webhookId: provider.webhookPath,
			},
			{
				parameters: {
					promptType: 'define',
					text: '={{ $json.body.prompt }}',
					hasOutputParser: false,
					options: {},
				},
				id: 'chain',
				name: 'LLM Chain',
				type: '@n8n/n8n-nodes-langchain.chainLlm',
				typeVersion: 1.4,
				position: [300, 0],
			},
			{
				parameters: { ...provider.modelParam },
				id: 'model',
				name: `${provider.name} Model`,
				type: provider.nodeType,
				typeVersion: 1,
				position: [150, -200],
				credentials: {
					[provider.credType]: { id: credId, name: provider.name },
				},
			},
		],
		connections: {
			'Webhook': { main: [[{ node: 'LLM Chain', type: 'main', index: 0 }]] },
			[`${provider.name} Model`]: { ai_languageModel: [[{ node: 'LLM Chain', type: 'ai_languageModel', index: 0 }]] },
		},
		settings: { executionOrder: 'v1' },
	};
}

async function main() {
	console.log('=== LLM Execution Test ===\n');

	const results: Array<{ provider: string; status: string; response?: string; error?: string }> = [];

	// Get existing credentials
	const creds = await api('GET', '/credentials');
	const credMap = new Map<string, string>();
	for (const c of creds.data) {
		credMap.set(c.type, c.id);
	}
	console.log(`Found ${credMap.size} credentials: ${[...credMap.keys()].join(', ')}\n`);

	for (const provider of providers) {
		console.log(`--- ${provider.name} ---`);

		if (!credMap.has(provider.credType)) {
			console.log(`  ⚠ No ${provider.credType} credential, skipping`);
			results.push({ provider: provider.name, status: 'skipped', error: 'no credential' });
			continue;
		}

		// Create workflow
		const wf = buildTestWorkflow(provider);
		let workflowId: string;
		try {
			const created = await api('POST', '/workflows', wf);
			workflowId = created.id;
			console.log(`  Created workflow: ${workflowId}`);
		} catch (e: any) {
			console.log(`  ✗ Create failed: ${e.message.slice(0, 200)}`);
			results.push({ provider: provider.name, status: 'error', error: e.message });
			continue;
		}

		// Activate
		try {
			await api('POST', `/workflows/${workflowId}/activate`, {});
			console.log(`  Activated`);
		} catch (e: any) {
			console.log(`  ✗ Activate failed: ${e.message.slice(0, 200)}`);
			results.push({ provider: provider.name, status: 'error', error: e.message });
			await api('DELETE', `/workflows/${workflowId}`).catch(() => {});
			continue;
		}

		await new Promise(r => setTimeout(r, 1000));

		// Call webhook
		try {
			console.log(`  Calling webhook...`);
			const res = await fetch(`${BASE}/webhook/${provider.webhookPath}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt: "Say 'hello' and nothing else." }),
			});
			const text = await res.text();
			console.log(`  Response: ${res.status}`);
			console.log(`  Body: ${text.slice(0, 300)}`);
			results.push({
				provider: provider.name,
				status: res.ok ? 'success' : 'error',
				response: text.slice(0, 500),
				error: res.ok ? undefined : `HTTP ${res.status}`,
			});
		} catch (e: any) {
			console.log(`  ✗ Webhook failed: ${e.message}`);
			results.push({ provider: provider.name, status: 'error', error: e.message });
		}

		// Deactivate and clean up
		await api('POST', `/workflows/${workflowId}/deactivate`, {}).catch(() => {});
		await api('DELETE', `/workflows/${workflowId}`).catch(() => {});
		console.log(`  Cleaned up\n`);
	}

	// Summary
	console.log('\n=== Results ===');
	for (const r of results) {
		const icon = r.status === 'success' ? '✓' : r.status === 'skipped' ? '⚠' : '✗';
		console.log(`  ${icon} ${r.provider}: ${r.status}${r.error ? ` (${r.error})` : ''}`);
		if (r.response) console.log(`    Response: ${r.response.slice(0, 100)}`);
	}

	// Save results
	writeFileSync('test-results/llm-execution-results.json', JSON.stringify(results, null, 2));
	console.log('\nResults saved to test-results/llm-execution-results.json');
}

main().catch(console.error);
