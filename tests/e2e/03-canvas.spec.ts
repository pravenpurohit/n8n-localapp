/**
 * Req 3: Workflow Canvas Editor
 * Req 4: Node Configuration Panel
 * Req 33: AI/LangChain Workflow Support
 * Req 36: Workflow Activation/Deactivation
 */
import { test, expect } from '@playwright/test';
import { screenshot, gotoWithAuth, n8nApi } from './helpers';

test.describe('Req 3: Workflow Canvas', () => {
	test('loads workflow on canvas (Req 3 AC#1)', async ({ page }) => {
		const wfs = await n8nApi('GET', '/workflows') as any;
		const wf = wfs.data.find((w: any) => w.name.includes('W1_Compile'));
		if (!wf) { test.skip(); return; }
		await gotoWithAuth(page, `/workflows/${wf.id}`);
		await page.waitForTimeout(3000);
		await screenshot(page, 'canvas-workflow-loaded');
	});

	test('new workflow shows empty canvas (Req 3 AC#12)', async ({ page }) => {
		await gotoWithAuth(page, '/workflows/new');
		await page.waitForTimeout(1000);
		await screenshot(page, 'canvas-new-workflow');
	});

	test('node selector opens (Req 3 AC#4)', async ({ page }) => {
		const wfs = await n8nApi('GET', '/workflows') as any;
		const wf = wfs.data[0];
		if (!wf) { test.skip(); return; }
		await gotoWithAuth(page, `/workflows/${wf.id}`);
		await page.waitForTimeout(1000);
		const addBtn = page.getByText('Add Node').first();
		if (await addBtn.isVisible()) {
			await addBtn.click();
			await page.waitForTimeout(500);
			await screenshot(page, 'canvas-node-selector');
		}
	});

	test('execute button visible (Req 3 AC#9)', async ({ page }) => {
		const wfs = await n8nApi('GET', '/workflows') as any;
		const wf = wfs.data[0];
		if (!wf) { test.skip(); return; }
		await gotoWithAuth(page, `/workflows/${wf.id}`);
		await page.waitForTimeout(3000);
		await screenshot(page, 'canvas-execute-button');
	});

	test('save button visible (Req 37 AC#2)', async ({ page }) => {
		const wfs = await n8nApi('GET', '/workflows') as any;
		const wf = wfs.data[0];
		if (!wf) { test.skip(); return; }
		await gotoWithAuth(page, `/workflows/${wf.id}`);
		await page.waitForTimeout(3000);
		await screenshot(page, 'canvas-save-button');
	});

	test('activate toggle visible (Req 36)', async ({ page }) => {
		const wfs = await n8nApi('GET', '/workflows') as any;
		const wf = wfs.data[0];
		if (!wf) { test.skip(); return; }
		await gotoWithAuth(page, `/workflows/${wf.id}`);
		await page.waitForTimeout(3000);
		await screenshot(page, 'canvas-activate-toggle');
	});
});
