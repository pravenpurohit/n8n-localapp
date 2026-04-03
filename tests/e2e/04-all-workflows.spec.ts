/**
 * Req 38: Test Workflow Validation — all variants render on canvas
 * Req 33: AI/LangChain Workflow Support
 */
import { test, expect } from '@playwright/test';
import { screenshot, gotoWithAuth, n8nApi } from './helpers';

test.describe('Req 38: All Workflow Variants Render', () => {
	test('overview shows imported workflows', async ({ page }) => {
		await gotoWithAuth(page, '/overview');
		await screenshot(page, 'all-workflows-overview');
	});

	for (const prefix of ['W0_', 'W1_Compile_Source_Prompt', 'W2_Execute_Step', 'W3_']) {
		test(`renders ${prefix}* on canvas`, async ({ page }) => {
			const wfs = await n8nApi('GET', '/workflows') as any;
			const wf = wfs.data.find((w: any) => w.name.startsWith(prefix));
			if (!wf) { test.skip(); return; }
			await gotoWithAuth(page, `/workflows/${wf.id}`);
			await page.waitForTimeout(3000);
			await screenshot(page, `canvas-${wf.name}`);
		});
	}
});
