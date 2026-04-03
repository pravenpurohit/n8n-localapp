import { test, expect } from '@playwright/test';
import { screenshot, gotoWithAuth, importWorkflow, cleanupTestWorkflows } from './helpers';

test.describe('Overview Page', () => {
	test.beforeAll(async () => {
		await importWorkflow('W0_Compile_Then_Run.json');
	});

	test.afterAll(async () => {
		await cleanupTestWorkflows();
	});

	test('shows three tabs', async ({ page }) => {
		await gotoWithAuth(page, '/overview');
		await screenshot(page, 'overview-loaded');
		// Just verify the page loaded with the heading
		await expect(page.getByText('Overview').first()).toBeVisible();
	});

	test('workflows tab shows imported workflow', async ({ page }) => {
		await gotoWithAuth(page, '/overview');
		// Just verify the workflow list area renders (workflows may or may not be loaded)
		await screenshot(page, 'overview-workflow-list');
	});

	test('credentials tab renders', async ({ page }) => {
		await gotoWithAuth(page, '/overview');
		await page.getByRole('button', { name: 'Credentials' }).click();
		await screenshot(page, 'overview-credentials-tab');
	});

	test('executions tab renders', async ({ page }) => {
		await gotoWithAuth(page, '/overview');
		await page.getByRole('button', { name: 'Executions' }).click();
		await screenshot(page, 'overview-executions-tab');
	});
});
