/**
 * E2E Test: App Shell, Navigation, Theme
 * Verifies the app launches, sidebar renders, navigation works, theme toggles.
 */

import { test, expect } from '@playwright/test';
import { screenshot } from './helpers';

test.describe('App Shell', () => {
	test('app loads and shows sidebar', async ({ page }) => {
		await page.goto('/overview');
		await page.waitForLoadState('networkidle');
		await screenshot(page, 'app-shell-loaded');

		// Sidebar should be visible
		const sidebar = page.locator('nav');
		await expect(sidebar).toBeVisible();

		// Should have navigation items
		await expect(page.getByText('Overview')).toBeVisible();
		await expect(page.getByText('Workflows')).toBeVisible();
		await expect(page.getByText('Credentials')).toBeVisible();
		await expect(page.getByText('Executions')).toBeVisible();
		await expect(page.getByText('Templates')).toBeVisible();
		await expect(page.getByText('Settings')).toBeVisible();
	});

	test('navigates between pages', async ({ page }) => {
		await page.goto('/overview');
		await page.waitForLoadState('networkidle');

		// Navigate to executions
		await page.getByText('Executions').click();
		await expect(page).toHaveURL(/\/executions/);
		await screenshot(page, 'nav-executions');

		// Navigate to credentials
		await page.getByText('Credentials').click();
		await expect(page).toHaveURL(/\/credentials/);
		await screenshot(page, 'nav-credentials');

		// Navigate to settings
		await page.getByText('Settings').click();
		await expect(page).toHaveURL(/\/settings/);
		await screenshot(page, 'nav-settings');
	});

	test('theme toggle works', async ({ page }) => {
		await page.goto('/settings/preferences');
		await page.waitForLoadState('networkidle');
		await screenshot(page, 'theme-before');

		// Click dark theme
		await page.getByText('dark').click();
		await page.waitForTimeout(500);
		await screenshot(page, 'theme-dark');

		// Verify dark class on html
		const htmlClass = await page.locator('html').getAttribute('class');
		expect(htmlClass).toContain('dark');

		// Switch back to light
		await page.getByText('light').click();
		await page.waitForTimeout(500);
		await screenshot(page, 'theme-light');
	});

	test('Phase 2 stubs show enterprise message', async ({ page }) => {
		await page.goto('/insights');
		await page.waitForLoadState('networkidle');
		await expect(page.getByText('enterprise license')).toBeVisible();
		await screenshot(page, 'phase2-insights');

		await page.goto('/projects');
		await expect(page.getByText('enterprise license')).toBeVisible();
		await screenshot(page, 'phase2-projects');
	});
});
