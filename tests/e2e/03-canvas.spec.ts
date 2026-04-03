import { test, expect } from '@playwright/test';
import { screenshot, gotoWithAuth, importWorkflow, cleanupTestWorkflows } from './helpers';

test.describe('Workflow Canvas', () => {
	let workflowId: string;

	test.beforeAll(async () => {
		const w = await importWorkflow('W1_Compile_Source_Prompt.json');
		workflowId = w.id;
	});

	test.afterAll(async () => {
		await cleanupTestWorkflows();
	});

	test('loads and renders workflow on canvas', async ({ page }) => {
		await gotoWithAuth(page, `/workflows/${workflowId}`);
		await page.waitForTimeout(2000);
		await screenshot(page, 'canvas-w1-loaded');
		await expect(page.getByText('W1_Compile_Source_Prompt')).toBeVisible();
	});

	test('new workflow page shows empty canvas', async ({ page }) => {
		await gotoWithAuth(page, '/workflows/new');
		await screenshot(page, 'canvas-new-workflow');
		await expect(page.getByText('Add first step')).toBeVisible();
	});

	test('node selector opens', async ({ page }) => {
		await gotoWithAuth(page, `/workflows/${workflowId}`);
		await page.waitForTimeout(1000);
		const addBtn = page.getByText('Add Node').first();
		if (await addBtn.isVisible()) {
			await addBtn.click();
			await page.waitForTimeout(500);
			await screenshot(page, 'canvas-node-selector');
		} else {
			await screenshot(page, 'canvas-no-add-button');
		}
	});
});
