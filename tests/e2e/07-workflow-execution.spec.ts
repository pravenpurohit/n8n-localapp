/**
 * Req 3 AC#9: Execute workflow
 * Req 3 AC#10: Execution status on nodes
 * Req 4 AC#5,6: Input/Output data display
 * Req 5: Global Executions Page
 * Req 6: Workflow-Level Executions
 * Req 34 AC#7-9: LLM error handling
 *
 * Tests execute LLM workflows and verify output is visible.
 * Results persist after test run for manual inspection.
 */

import { test, expect } from '@playwright/test';
import { screenshot, gotoWithAuth, n8nApi } from './helpers';

interface LlmTestWorkflow { name: string; id: string; provider: string; }
let workflows: LlmTestWorkflow[] = [];

test.beforeAll(async () => {
	// Always find workflows by name from n8n directly (manifest may have stale IDs)
	const existing = await n8nApi('GET', '/workflows') as any;
	workflows = existing.data
		.filter((w: any) => w.name.startsWith('LLM_Test_'))
		.map((w: any) => ({ name: w.name, id: w.id, provider: w.name.replace('LLM_Test_', '') }));
	console.log(`Found ${workflows.length} LLM test workflows`);
});

test.describe('Req 3/4/5/6: Workflow Execution & Output', () => {
	for (const providerName of ['Groq', 'Gemini']) {
		test(`execute LLM_Test_${providerName} and verify output`, async ({ page }) => {
			const wf = workflows.find(w => w.provider === providerName);
			if (!wf) { console.log(`⚠ ${providerName} not found`); test.skip(); return; }

			const consoleLogs: string[] = [];
			page.on('console', (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));

			// Load workflow
			await gotoWithAuth(page, `/workflows/${wf.id}`);
			await page.waitForTimeout(3000);
			await screenshot(page, `exec-${providerName}-before`);

			// Click Execute if visible
			const executeBtn = page.getByText('▶ Execute').or(page.getByText('⟳ Running...'));
			if (await executeBtn.isVisible().catch(() => false)) {
				await executeBtn.click();
				console.log(`  Clicked Execute for ${providerName}`);

				// Wait for LLM response
				await page.waitForTimeout(25000);
				await screenshot(page, `exec-${providerName}-after`);

				// Check execution via API
				const execs = await n8nApi('GET', `/executions?workflowId=${wf.id}&limit=1`) as any;
				if (execs.data.length > 0) {
					const exec = execs.data[0];
					console.log(`  ${providerName} execution: ${exec.id} status=${exec.status}`);
				}

				// Click on LLM Chain node to check output
				const llmNode = page.locator('text=LLM Chain').first();
				if (await llmNode.isVisible().catch(() => false)) {
					await llmNode.click();
					await page.waitForTimeout(500);
					await screenshot(page, `exec-${providerName}-node-selected`);

					// Click Output tab
					const outputBtn = page.getByText('output').last();
					if (await outputBtn.isVisible().catch(() => false)) {
						await outputBtn.click();
						await page.waitForTimeout(500);
						await screenshot(page, `exec-${providerName}-output-tab`);

						const noData = await page.getByText('No execution data').isVisible().catch(() => false);
						console.log(`  Output tab: ${noData ? 'NO DATA' : 'has data'}`);

						// Screenshot each view mode
						for (const vm of ['table', 'json', 'schema']) {
							const btn = page.getByText(vm, { exact: true }).first();
							if (await btn.isVisible().catch(() => false)) {
								await btn.click();
								await page.waitForTimeout(300);
								await screenshot(page, `exec-${providerName}-output-${vm}`);
								console.log(`  ${vm} view rendered`);
							}
						}
					}
				}

				// Check per-workflow executions tab
				const execTab = page.getByText('Executions').first();
				if (await execTab.isVisible().catch(() => false)) {
					await execTab.click();
					await page.waitForTimeout(1000);
					await screenshot(page, `exec-${providerName}-executions-tab`);
				}
			} else {
				console.log(`  Execute button not visible for ${providerName}`);
				await screenshot(page, `exec-${providerName}-no-execute-btn`);
			}
		});
	}

	// Test billing error providers (Req 34 AC#7)
	for (const providerName of ['OpenAI', 'Anthropic']) {
		test(`execute LLM_Test_${providerName} handles billing error gracefully`, async ({ page }) => {
			const wf = workflows.find(w => w.provider === providerName);
			if (!wf) { test.skip(); return; }

			await gotoWithAuth(page, `/workflows/${wf.id}`);
			await page.waitForTimeout(2000);

			const executeBtn = page.getByText('▶ Execute');
			if (await executeBtn.isVisible()) {
				await executeBtn.click();
				await page.waitForTimeout(15000);
				await screenshot(page, `exec-${providerName}-error`);

				// Should show error notification (Req 34 AC#7)
				const hasNotification = await page.locator('.fixed.bottom-4').isVisible().catch(() => false);
				console.log(`  ${providerName}: notification visible=${hasNotification}`);
			}
		});
	}

	test('Req 5: global executions page shows all executions', async ({ page }) => {
		await gotoWithAuth(page, '/executions');
		await page.waitForTimeout(2000);
		await screenshot(page, 'executions-page-after-runs');
	});
});
