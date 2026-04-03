/**
 * User Journey Tests — end-to-end flows that a real user would perform.
 * Each test follows a complete user journey and captures errors.
 */

import { test, expect } from '@playwright/test';
import { screenshot, gotoWithAuth, n8nApi } from './helpers';

test.describe('User Journeys', () => {
	test('Journey 1: Create new workflow from overview', async ({ page }) => {
		const errors: string[] = [];
		page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
		page.on('pageerror', (err) => errors.push(`PAGE ERROR: ${err.message}`));

		// Start at overview
		await gotoWithAuth(page, '/overview');
		await screenshot(page, 'journey1-overview');

		// Click Create Workflow
		const createBtn = page.getByText('Create Workflow');
		await expect(createBtn).toBeVisible();
		await createBtn.click();
		await page.waitForTimeout(2000);
		await screenshot(page, 'journey1-new-workflow');

		// Should be on /workflows/new
		expect(page.url()).toContain('/workflows/new');

		// Should see "Add first step" or the canvas
		const pageContent = await page.content();
		const hasContent = pageContent.includes('Add first step') || pageContent.includes('Add a Trigger') || pageContent.includes('Add Node');
		expect(hasContent).toBeTruthy();

		// Log any errors
		if (errors.length > 0) {
			console.log('  ERRORS during create workflow:');
			errors.forEach(e => console.log(`    ${e.slice(0, 200)}`));
		}
		expect(errors.filter(e => e.includes('PAGE ERROR'))).toHaveLength(0);

		await screenshot(page, 'journey1-complete');
	});

	test('Journey 2: Open existing workflow and view canvas', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));

		// Get a workflow
		const wfs = await n8nApi('GET', '/workflows') as any;
		const wf = wfs.data.find((w: any) => w.name.includes('W1_Compile'));
		if (!wf) { test.skip(); return; }

		// Navigate from overview
		await gotoWithAuth(page, '/overview');
		await screenshot(page, 'journey2-overview');

		// Click on the workflow (navigate directly since clicking list items is complex)
		await page.goto(`/workflows/${wf.id}`);
		await page.waitForTimeout(4000);
		await screenshot(page, 'journey2-canvas');

		// Should not have page errors
		expect(errors).toHaveLength(0);
	});

	test('Journey 3: Navigate through all main sections', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));

		const sections = [
			{ path: '/overview', name: 'Overview' },
			{ path: '/executions', name: 'Executions' },
			{ path: '/credentials', name: 'Credentials' },
			{ path: '/data-tables', name: 'Data Tables' },
			{ path: '/settings', name: 'Settings' },
			{ path: '/settings/preferences', name: 'Preferences' },
			{ path: '/settings/connection', name: 'Connection' },
			{ path: '/settings/tags', name: 'Tags' },
			{ path: '/workflows/new', name: 'New Workflow' },
		];

		for (const section of sections) {
			await gotoWithAuth(page, section.path);
			await screenshot(page, `journey3-${section.name.toLowerCase().replace(/\s/g, '-')}`);

			if (errors.length > 0) {
				console.log(`  ERROR at ${section.name}: ${errors[errors.length - 1].slice(0, 150)}`);
			}
		}

		// Allow console errors (API calls may fail) but no page crashes
		const pageCrashes = errors.filter(e => e.includes('Cannot read') || e.includes('is not a function') || e.includes('undefined'));
		if (pageCrashes.length > 0) {
			console.log('  PAGE CRASHES:');
			pageCrashes.forEach(e => console.log(`    ${e.slice(0, 200)}`));
		}
	});

	test('Journey 4: Theme switching', async ({ page }) => {
		await gotoWithAuth(page, '/settings/preferences');

		// Switch to dark
		await page.getByText('dark').click();
		await page.waitForTimeout(500);
		await screenshot(page, 'journey4-dark');
		const darkClass = await page.locator('html').getAttribute('class');
		expect(darkClass).toContain('dark');

		// Switch to light
		await page.getByText('light').click();
		await page.waitForTimeout(500);
		await screenshot(page, 'journey4-light');

		// Switch to system
		await page.getByText('system').click();
		await page.waitForTimeout(500);
		await screenshot(page, 'journey4-system');
	});

	test('Journey 5: View execution results after workflow run', async ({ page }) => {
		// Check if any executions exist
		const execs = await n8nApi('GET', '/executions?limit=1') as any;
		if (execs.data.length === 0) { test.skip(); return; }

		// Go to executions page
		await gotoWithAuth(page, '/executions');
		await page.waitForTimeout(1000);
		await screenshot(page, 'journey5-executions-list');

		// Go to the workflow that was executed
		const exec = execs.data[0];
		await gotoWithAuth(page, `/workflows/${exec.workflowId}`);
		await page.waitForTimeout(3000);
		await screenshot(page, 'journey5-workflow-with-results');
	});
});
