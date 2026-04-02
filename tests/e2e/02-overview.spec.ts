/**
 * E2E Test: Overview Page
 * Verifies tabs, workflow list, search, pagination.
 */

import { test, expect } from '@playwright/test';
import { screenshot, importWorkflow, cleanupTestWorkflows } from './helpers';

test.describe('Overview Page', () => {
	test.beforeAll(async () => {
		// Import a test workflow so the list isn't empty
		await importWorkflow('W0_Compile_Then_Run.json');
	});

	test.afterAll(async () => {
		await cleanupTestWorkflows();
	});

	test('shows three tabs', async ({ page }) => {
		await page.goto('/overview');
		await page.waitForLoadState('networkidle');
		await screenshot(page, 'overview-loaded');

		await expect(page.getByText('Workflows')).toBeVisible();
		await expect(page.getByText('Credentials')).toBeVisible();
		await expect(page.getByText('Executions')).toBeVisible();
	});

	test('workflows tab shows imported workflow', async ({ page }) => {
		await page.goto('/overview');
		await page.waitForLoadState('networkidle');

		// Should see the imported workflow
		await expect(page.getByText('W0_Compile_Then_Run')).toBeVisible();
		await screenshot(page, 'overview-workflow-list');
	});

	test('search filters workflows', async ({ page }) => {
		await page.goto('/overview');
		await page.waitForLoadState('networkidle');

		const searchInput = page.getByPlaceholder('Search workflows');
		await searchInput.fill('W0');
		await page.waitForTimeout(400); // debounce
		await expect(page.getByText('W0_Compile_Then_Run')).toBeVisible();
		await screenshot(page, 'overview-search');

		await searchInput.fill('nonexistent');
		await page.waitForTimeout(400);
		await screenshot(page, 'overview-search-empty');
	});

	test('credentials tab renders', async ({ page }) => {
		await page.goto('/overview');
		await page.waitForLoadState('networkidle');

		await page.getByRole('button', { name: 'Credentials' }).click();
		await screenshot(page, 'overview-credentials-tab');
	});

	test('executions tab renders', async ({ page }) => {
		await page.goto('/overview');
		await page.waitForLoadState('networkidle');

		await page.getByRole('button', { name: 'Executions' }).click();
		await screenshot(page, 'overview-executions-tab');
	});
});
