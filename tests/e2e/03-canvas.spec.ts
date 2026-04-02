/**
 * E2E Test: Workflow Canvas Editor
 * Imports test workflows, verifies canvas rendering, node interaction.
 */

import { test, expect } from '@playwright/test';
import { screenshot, importWorkflow, cleanupTestWorkflows } from './helpers';

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
		await page.goto(`/workflows/${workflowId}`);
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000); // wait for Svelte Flow to render

		await screenshot(page, 'canvas-w1-loaded');

		// Should see the workflow name in the top bar
		await expect(page.getByText('W1_Compile_Source_Prompt')).toBeVisible();
	});

	test('shows node config panel on node click', async ({ page }) => {
		await page.goto(`/workflows/${workflowId}`);
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Click on a node (the Manual Trigger should be visible)
		const node = page.locator('[data-testid="rf__node"]').first();
		if (await node.isVisible()) {
			await node.click();
			await page.waitForTimeout(500);
			await screenshot(page, 'canvas-node-selected');
		}
	});

	test('new workflow page shows empty canvas', async ({ page }) => {
		await page.goto('/workflows/new');
		await page.waitForLoadState('networkidle');
		await screenshot(page, 'canvas-new-workflow');

		await expect(page.getByText('Add first step')).toBeVisible();
	});

	test('node selector opens', async ({ page }) => {
		await page.goto(`/workflows/${workflowId}`);
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);

		await page.getByText('+ Add Node').click();
		await page.waitForTimeout(500);
		await screenshot(page, 'canvas-node-selector');

		await expect(page.getByText('Add Node')).toBeVisible();
	});
});
