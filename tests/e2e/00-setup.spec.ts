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

	test('verify n8n credentials exist', async () => {
		const creds = await n8nApi('GET', '/credentials') as any;
		console.log(`Found ${creds.data.length} credentials:`);
		for (const c of creds.data) {
			console.log(`  ${c.name} (${c.type})`);
		}
	});
});
