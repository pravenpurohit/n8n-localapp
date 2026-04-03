/**
 * Create simple LLM test workflows for each provider with credentials assigned.
 * These workflows have no Data Tables — just trigger → LLM chain → output.
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
	if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${await res.text()}`);
	return res.json();
}

interface Provider {
	name: string;
	nodeType: string;
	credType: string;
	modelParam: Record<string, unknown>;
}

const providers: Provider[] = [
	{ name: 'OpenAI', nodeType: '@n8n/n8n-nodes-langchain.lmChatOpenAi', credType: 'openAiApi', modelParam: { model: 'gpt-4o-mini', options: {} } },
	{ name: 'Groq', nodeType: '@n8n/n8n-nodes-langchain.lmChatGroq', credType: 'groqApi', modelParam: { model: 'llama-3.1-8b-instant', options: {} } },
	{ name: 'Anthropic', nodeType: '@n8n/n8n-nodes-langchain.lmChatAnthropic', credType: 'anthropicApi', modelParam: { model: 'claude-3-5-haiku-20241022', options: {} } },
	{ name: 'Gemini', nodeType: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini', credType: 'googlePalmApi', modelParam: { modelName: 'models/gemini-2.0-flash', options: {} } },
];

async function main() {
	// Get credentials
	const creds = await api('GET', '/credentials') as any;
	const credMap = new Map<string, { id: string; name: string }>();
	for (const c of creds.data) {
		credMap.set(c.type, { id: c.id, name: c.name });
	}
	console.log('Credentials:', [...credMap.entries()].map(([k, v]) => `${k}=${v.id}`).join(', '));

	// Clean up existing test workflows
	const existing = await api('GET', '/workflows') as any;
	for (const w of existing.data) {
		if (w.name.startsWith('LLM_Test_')) {
			await api('DELETE', `/workflows/${w.id}`);
			console.log(`Deleted old: ${w.name}`);
		}
	}

	const created: Array<{ name: string; id: string; provider: string }> = [];

	for (const p of providers) {
		const cred = credMap.get(p.credType);
		if (!cred) {
			console.log(`⚠ No credential for ${p.credType}, skipping ${p.name}`);
			continue;
		}

		const wf = {
			name: `LLM_Test_${p.name}`,
			nodes: [
				{
					parameters: {},
					id: `trigger-${p.name.toLowerCase()}`,
					name: 'Manual Trigger',
					type: 'n8n-nodes-base.manualTrigger',
					typeVersion: 1,
					position: [0, 0],
				},
				{
					parameters: {
						promptType: 'define',
						text: "Respond with exactly this JSON and nothing else: {\"status\":\"ok\",\"provider\":\"" + p.name + "\",\"message\":\"hello world\"}",
						hasOutputParser: false,
						options: {},
					},
					id: `chain-${p.name.toLowerCase()}`,
					name: 'LLM Chain',
					type: '@n8n/n8n-nodes-langchain.chainLlm',
					typeVersion: 1.4,
					position: [400, 0],
				},
				{
					parameters: { ...p.modelParam },
					id: `model-${p.name.toLowerCase()}`,
					name: `${p.name} Model`,
					type: p.nodeType,
					typeVersion: 1,
					position: [200, -200],
					credentials: {
						[p.credType]: { id: cred.id, name: cred.name },
					},
				},
			],
			connections: {
				'Manual Trigger': { main: [[{ node: 'LLM Chain', type: 'main', index: 0 }]] },
				[`${p.name} Model`]: { ai_languageModel: [[{ node: 'LLM Chain', type: 'ai_languageModel', index: 0 }]] },
			},
			settings: { executionOrder: 'v1' },
		};

		try {
			const result = await api('POST', '/workflows', wf) as any;
			console.log(`✓ Created: ${result.name} (${result.id})`);
			created.push({ name: result.name, id: result.id, provider: p.name });

			// Also save as test-data file
			writeFileSync(
				`test-data/workflows/LLM_Test_${p.name}.json`,
				JSON.stringify({ ...wf, id: result.id }, null, 2) + '\n'
			);
		} catch (e: any) {
			console.log(`✗ Failed ${p.name}: ${e.message.slice(0, 200)}`);
		}
	}

	console.log(`\nCreated ${created.length} test workflows:`);
	for (const w of created) {
		console.log(`  ${w.id}: ${w.name}`);
	}

	// Save manifest for tests
	writeFileSync('test-data/fixtures/llm-test-workflows.json', JSON.stringify(created, null, 2));
	console.log('\nSaved manifest to test-data/fixtures/llm-test-workflows.json');
}

main().catch(console.error);
