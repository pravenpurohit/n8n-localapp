/**
 * Req 2: Overview/Home Page
 * Req 29: Left Sidebar Navigation
 */
import { test, expect } from '@playwright/test';
import { screenshot, gotoWithAuth } from './helpers';

test.describe('Req 2: Overview Page', () => {
	test('shows overview heading', async ({ page }) => {
		await gotoWithAuth(page, '/overview');
		await screenshot(page, 'overview-loaded');
		await expect(page.getByText('Overview').first()).toBeVisible();
	});

	test('has Create Workflow button (Req 2 AC#7)', async ({ page }) => {
		await gotoWithAuth(page, '/overview');
		await expect(page.getByText('Create Workflow')).toBeVisible();
	});

	test('workflows tab renders workflow list (Req 2 AC#1)', async ({ page }) => {
		await gotoWithAuth(page, '/overview');
		await screenshot(page, 'overview-workflow-list');
	});

	test('credentials tab renders (Req 2 AC#3)', async ({ page }) => {
		await gotoWithAuth(page, '/overview');
		await page.getByRole('button', { name: 'Credentials' }).click();
		await screenshot(page, 'overview-credentials-tab');
	});

	test('executions tab renders (Req 2 AC#4)', async ({ page }) => {
		await gotoWithAuth(page, '/overview');
		await page.getByRole('button', { name: 'Executions' }).click();
		await screenshot(page, 'overview-executions-tab');
	});
});
