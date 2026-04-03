import { test, expect } from '@playwright/test';
import { screenshot, gotoWithAuth } from './helpers';

test.describe('App Shell', () => {
	test('app loads and shows sidebar', async ({ page }) => {
		// Capture console errors for debugging
		const errors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') errors.push(msg.text());
		});
		page.on('pageerror', (err) => errors.push(err.message));

		await gotoWithAuth(page, '/overview');
		await screenshot(page, 'app-shell-loaded');

		// Log any errors for debugging
		if (errors.length > 0) {
			console.log('Browser errors:', errors.join('\n'));
		}

		const sidebar = page.locator('nav').first();
		await expect(sidebar).toBeVisible();
		await expect(sidebar.getByText('Overview')).toBeVisible();
		await expect(sidebar.getByText('Workflows')).toBeVisible();
		await expect(sidebar.getByText('Credentials')).toBeVisible();
		await expect(sidebar.getByText('Executions')).toBeVisible();
		await expect(sidebar.getByText('Templates')).toBeVisible();
		await expect(sidebar.getByText('Settings')).toBeVisible();
	});

	test('navigates between pages', async ({ page }) => {
		await gotoWithAuth(page, '/overview');

		const sidebar = page.locator('nav').first();
		await sidebar.getByText('Executions').click();
		await expect(page).toHaveURL(/\/executions/);
		await screenshot(page, 'nav-executions');

		await sidebar.getByText('Credentials').click();
		await expect(page).toHaveURL(/\/credentials/);
		await screenshot(page, 'nav-credentials');

		await sidebar.getByText('Settings').click();
		await expect(page).toHaveURL(/\/settings/);
		await screenshot(page, 'nav-settings');
	});

	test('theme toggle works', async ({ page }) => {
		await gotoWithAuth(page, '/settings/preferences');
		await screenshot(page, 'theme-before');

		await page.getByText('dark').click();
		await page.waitForTimeout(500);
		await screenshot(page, 'theme-dark');

		const htmlClass = await page.locator('html').getAttribute('class');
		expect(htmlClass).toContain('dark');

		await page.getByText('light').click();
		await page.waitForTimeout(500);
		await screenshot(page, 'theme-light');
	});

	test('Phase 2 stubs show enterprise message', async ({ page }) => {
		await gotoWithAuth(page, '/insights');
		await expect(page.getByText('enterprise license')).toBeVisible();
		await screenshot(page, 'phase2-insights');

		await page.goto('/projects');
		await expect(page.getByText('enterprise license')).toBeVisible();
		await screenshot(page, 'phase2-projects');
	});
});
