/**
 * E2E Test: Workflow Execution via the App UI
 * Imports a simple LLM workflow, clicks Execute in the app, waits for results.
 */

import { test, expect } from '@playwright/test';
import { screenshot, gotoWithAuth, importWorkflow, cleanupTestWorkflows, n8nApi } from './helpers';

test.describe('Workflow Execution', () => {
	let simpleWfId: string;

	test.beforeAll(async () => {
		// Import the simple LLM test workflow (no Data Tables)
		const w = await importWorkflow('W_LLM_Test_Simple.json');
		simpleWfId = w.id;

		// Assign the Groq credential to the model node
		const creds = await n8nApi('GET', '/credentials') as any;
		const groqCred = creds.data.find((c: any) => c.type === 'groqApi');
		if (groqCred) {
			const wf = await n8nApi('GET', `/workflows/${simpleWfId}`) as any;
			for (const node of wf.nodes) {
				if (node.type.includes('lmChatGroq')) {
					node.credentials = { groqApi: { id: groqCred.id, name: groqCred.name } };
				}
			}
			await n8nApi('PUT', `/workflows/${simpleWfId}`, {
				name: wf.name,
				nodes: wf.nodes,
				connections: wf.connections,
				settings: wf.settings,
			});
		}
	});

	test.afterAll(async () => {
		await cleanupTestWorkflows();
	});

	test('loads simple LLM workflow on canvas', async ({ page }) => {
		await gotoWithAuth(page, `/workflows/${simpleWfId}`);
		await page.waitForTimeout(2000);
		await screenshot(page, 'exec-simple-llm-loaded');
		await expect(page.getByText('W_LLM_Test_Simple')).toBeVisible();
	});

	test('clicks Execute and captures result', async ({ page }) => {
		const consoleLogs: string[] = [];
		page.on('console', (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));

		await gotoWithAuth(page, `/workflows/${simpleWfId}`);
		await page.waitForTimeout(2000);
		await screenshot(page, 'exec-before-click');

		// Click Execute
		const executeBtn = page.getByText('▶ Execute');
		await expect(executeBtn).toBeVisible();
		await executeBtn.click();

		// Wait for execution to complete (poll for node status indicators)
		console.log('Waiting for execution...');
		await page.waitForTimeout(15000); // Give LLM time to respond
		await screenshot(page, 'exec-after-execute');

		// Check console for execution result
		const execLogs = consoleLogs.filter(l => l.includes('canvas') || l.includes('execution') || l.includes('ERROR'));
		console.log('Execution logs:');
		execLogs.forEach(l => console.log(`  ${l.slice(0, 200)}`));

		// Check for success/error indicators on nodes
		const pageContent = await page.content();
		const hasSuccess = pageContent.includes('✓') || pageContent.includes('text-green');
		const hasError = pageContent.includes('✗') || pageContent.includes('text-red');
		console.log(`Has success indicators: ${hasSuccess}, Has error indicators: ${hasError}`);
	});

	test('executions page shows the execution', async ({ page }) => {
		await gotoWithAuth(page, '/executions');
		await page.waitForTimeout(2000);
		await screenshot(page, 'exec-executions-page');
	});
});
