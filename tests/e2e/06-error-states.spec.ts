/**
 * Req 34: Error Handling and Offline Behavior
 * Req 1: API Key Authentication via .env
 */
import { test, expect } from '@playwright/test';
import { screenshot, gotoWithAuth } from './helpers';

test.describe('Req 34: Error Handling', () => {
	test('invalid workflow ID shows error gracefully (Req 34 AC#3)', async ({ page }) => {
		await gotoWithAuth(page, '/workflows/nonexistent-id-12345');
		await page.waitForTimeout(2000);
		await screenshot(page, 'error-invalid-workflow');
	});

	test('error page renders with instructions (Req 1 AC#4)', async ({ page }) => {
		await gotoWithAuth(page, '/error');
		await screenshot(page, 'error-page');
	});
});
