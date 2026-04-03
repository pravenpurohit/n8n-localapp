import { test, expect } from '@playwright/test';
import { screenshot, gotoWithAuth, importWorkflow, cleanupTestWorkflows } from './helpers';

const WORKFLOW_FILES = [
	'W0_Compile_Then_Run.json',
	'W1_Compile_Source_Prompt.json',
	'W1_Compile_Source_Prompt_Gemini.json',
	'W1_Compile_Source_Prompt_Claude.json',
	'W1_Compile_Source_Prompt_Groq.json',
	'W2_Execute_Step.json',
	'W2_Execute_Step_Gemini.json',
	'W2_Execute_Step_Claude.json',
	'W2_Execute_Step_Groq.json',
	'W3_Run_Compiled_Graph.json',
];

test.describe('All Workflow Variants', () => {
	const imported: Array<{ id: string; name: string; file: string }> = [];

	test.beforeAll(async () => {
		for (const file of WORKFLOW_FILES) {
			const w = await importWorkflow(file);
			imported.push({ ...w, file });
		}
	});

	test.afterAll(async () => {
		await cleanupTestWorkflows();
	});

	test('overview shows all imported workflows', async ({ page }) => {
		await gotoWithAuth(page, '/overview');
		await screenshot(page, 'all-workflows-overview');
	});

	for (const file of WORKFLOW_FILES) {
		test(`renders ${file} on canvas`, async ({ page }) => {
			const w = imported.find((i) => i.file === file);
			if (!w) { test.skip(); return; }

			await gotoWithAuth(page, `/workflows/${w.id}`);
			await page.waitForTimeout(2000);
			await screenshot(page, `canvas-${file.replace('.json', '')}`);
			await expect(page.getByText(w.name)).toBeVisible();
		});
	}
});
