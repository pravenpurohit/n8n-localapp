/**
 * Test Setup: Runs FIRST. Cleans up stale data, imports workflows, creates credentials.
 * Outputs persist after all tests complete so results can be inspected.
 */

import { test } from '@playwright/test';
import { cleanupTestWorkflows, importWorkflow, n8nApi } from './helpers';

test.describe('Setup', () => {
	test('clean up stale test data from previous runs', async () => {
		await cleanupTestWorkflows();
		console.log('Cleaned up stale workflows');
	});

	test('import all test workflow variants', async () => {
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
			try {
				const w = await importWorkflow(f);
				console.log(`  ✓ ${w.name} (${w.id})`);
			} catch (e: any) {
				console.log(`  ✗ ${f}: ${e.message.slice(0, 100)}`);
			}
		}
	});

	test('create LLM test workflows with credentials', async () => {
		// Create fresh LLM test workflows via the creation script's API logic
		// This ensures credentials are properly linked
		const { config: loadEnv } = await import('dotenv');
		loadEnv();
		const BASE = process.env.N8N_BASE_URL || 'http://localhost:5678';
		const API_KEY = process.env.N8N_API_KEY || '';

		async function api(method: string, path: string, body?: unknown) {
			const res = await fetch(`${BASE}/api/v1${path}`, {
				method,
				headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' },
				body: body ? JSON.stringify(body) : undefined,
			});
			if (!res.ok) throw new Error(`${method} ${path}: ${res.status}`);
			return res.json();
		}

		const creds = await api('GET', '/credentials') as any;
		const credMap = new Map<string, { id: string; name: string }>();
		for (const c of creds.data) credMap.set(c.type, { id: c.id, name: c.name });

		const providers = [
			{ name: 'OpenAI', nodeType: '@n8n/n8n-nodes-langchain.lmChatOpenAi', credType: 'openAiApi', modelParam: { model: 'gpt-4.1', options: { maxTokens: 4096 } } },
			{ name: 'Groq', nodeType: '@n8n/n8n-nodes-langchain.lmChatGroq', credType: 'groqApi', modelParam: { model: 'llama-3.3-70b-versatile', options: { maxTokens: 4096 } } },
			{ name: 'Anthropic', nodeType: '@n8n/n8n-nodes-langchain.lmChatAnthropic', credType: 'anthropicApi', modelParam: { model: 'claude-opus-4-20250514', options: { maxTokens: 4096 } } },
			{ name: 'Gemini', nodeType: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini', credType: 'googlePalmApi', modelParam: { modelName: 'models/gemini-2.5-pro', options: { maxOutputTokens: 4096 } } },
		];

		for (const p of providers) {
			const cred = credMap.get(p.credType);
			if (!cred) { console.log(`  ⚠ No ${p.credType} credential`); continue; }

			try {
				const result = await api('POST', '/workflows', {
					name: `LLM_Test_${p.name}`,
					nodes: [
						{ parameters: {}, id: `trigger-${p.name.toLowerCase()}`, name: 'Manual Trigger', type: 'n8n-nodes-base.manualTrigger', typeVersion: 1, position: [0, 0] },
						{ parameters: { promptType: 'define', text: `Respond with exactly: {"status":"ok","provider":"${p.name}","message":"hello world"}`, hasOutputParser: false, options: {} }, id: `chain-${p.name.toLowerCase()}`, name: 'LLM Chain', type: '@n8n/n8n-nodes-langchain.chainLlm', typeVersion: 1.4, position: [400, 0] },
						{ parameters: { ...p.modelParam }, id: `model-${p.name.toLowerCase()}`, name: `${p.name} Model`, type: p.nodeType, typeVersion: 1, position: [200, -200], credentials: { [p.credType]: { id: cred.id, name: cred.name } } },
					],
					connections: {
						'Manual Trigger': { main: [[{ node: 'LLM Chain', type: 'main', index: 0 }]] },
						[`${p.name} Model`]: { ai_languageModel: [[{ node: 'LLM Chain', type: 'ai_languageModel', index: 0 }]] },
					},
					settings: { executionOrder: 'v1' },
				}) as any;
				console.log(`  ✓ ${result.name} (${result.id})`);
			} catch (e: any) {
				console.log(`  ✗ ${p.name}: ${e.message.slice(0, 100)}`);
			}
		}
	});

	test('verify n8n credentials exist', async () => {
		const creds = await n8nApi('GET', '/credentials') as any;
		console.log(`Found ${creds.data.length} credentials:`);
		for (const c of creds.data) {
			console.log(`  ${c.name} (${c.type})`);
		}
	});
});
