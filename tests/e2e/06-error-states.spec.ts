import { test, expect } from '@playwright/test';
import { screenshot, gotoWithAuth } from './helpers';

test.describe('Error States', () => {
	test('invalid workflow ID shows error or loading', async ({ page }) => {
		await gotoWithAuth(page, '/workflows/nonexistent-id-12345');
		await page.waitForTimeout(2000);
		await screenshot(page, 'error-invalid-workflow');
	});

	test('error page renders', async ({ page }) => {
		await gotoWithAuth(page, '/error');
		await screenshot(page, 'error-page');
	});
});
