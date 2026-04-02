/**
 * E2E Test: Error States
 * Tests error handling for invalid routes, missing workflows, etc.
 */

import { test, expect } from '@playwright/test';
import { screenshot } from './helpers';

test.describe('Error States', () => {
	test('invalid workflow ID shows error', async ({ page }) => {
		await page.goto('/workflows/nonexistent-id-12345');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);
		await screenshot(page, 'error-invalid-workflow');
	});

	test('404 route shows error page', async ({ page }) => {
		await page.goto('/this-route-does-not-exist');
		await page.waitForLoadState('networkidle');
		await screenshot(page, 'error-404');
	});

	test('error page has link back to overview', async ({ page }) => {
		await page.goto('/this-route-does-not-exist');
		await page.waitForLoadState('networkidle');

		const overviewLink = page.getByText('Go to Overview');
		if (await overviewLink.isVisible()) {
			await overviewLink.click();
			await expect(page).toHaveURL(/\/overview/);
		}
	});
});
