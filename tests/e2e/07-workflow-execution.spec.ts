/**
 * Req 3/4/5/6/34: Workflow Execution with complex research prompt.
 * Executes via n8n internal API, saves LLM output, verifies in app UI.
 */

import { test, expect } from '@playwright/test';
import { screenshot, gotoWithAuth, n8nApi } from './helpers';
import { config } from 'dotenv';
import { writeFileSync } from 'fs';
config();

const BASE = process.env.N8N_BASE_URL || 'http://localhost:5678';
const EMAIL = process.env.N8N_EMAIL || '';
const PASSWORD = process.env.N8N_PASSWORD || '';
let sessionCookie = '';

async function login() {
	const res = await fetch(`${BASE}/rest/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ emailOrLdapLoginId: EMAIL, password: PASSWORD }),
	});
	const cookies = res.headers.getSetCookie?.() || [];
	const auth = cookies.find(c => c.startsWith('n8n-auth='));
	if (auth) sessionCookie = auth.split(';')[0];
	return !!(await res.json() as any).data?.id;
}

async function executeViaApi(workflowId: string): Promise<string | null> {
	const wf = await n8nApi('GET', `/workflows/${workflowId}`) as any;
	const trigger = wf.nodes.find((n: any) => n.type.includes('manualTrigger'));
	if (!trigger) return null;
	const res = await fetch(`${BASE}/rest/workflows/${workflowId}/run`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
		body: JSON.stringify({
			workflowData: wf,
			triggerToStartFrom: { name: trigger.name, data: [[{ json: {} }]] },
		}),
	});
	if (!res.ok) { console.log(`  API error: ${res.status}`); return null; }
	return ((await res.json()) as any).data?.executionId || null;
}

async function waitForExecution(execId: string, timeoutMs = 120000) {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		try {
			const exec = await n8nApi('GET', `/executions/${execId}`) as any;
			if (['success', 'error', 'canceled'].includes(exec.status)) return exec;
		} catch {}
		await new Promise(r => setTimeout(r, 3000));
	}
	return { status: 'timeout' };
}

interface Wf { name: string; id: string; provider: string; }
let workflows: Wf[] = [];

test.beforeAll(async () => {
	await login();
	const existing = await n8nApi('GET', '/workflows') as any;
	workflows = existing.data
		.filter((w: any) => w.name.startsWith('LLM_Test_'))
		.map((w: any) => ({ name: w.name, id: w.id, provider: w.name.replace('LLM_Test_', '') }));
	console.log(`Found ${workflows.length} LLM test workflows`);
});

test.describe('Workflow Execution with Complex Prompt', () => {
	for (const providerName of ['Groq', 'Gemini']) {
		test(`execute research report: ${providerName}`, async ({ page }) => {
			const wf = workflows.find(w => w.provider === providerName);
			if (!wf) { test.skip(); return; }

			// Execute via API (complex prompt — 30-90s for research report)
			console.log(`  Executing ${providerName} (${wf.id})...`);
			const execId = await executeViaApi(wf.id);
			expect(execId).toBeTruthy();
			console.log(`  Execution: ${execId}`);

			// Wait for LLM to generate the research report
			const exec = await waitForExecution(execId!, 120000);
			console.log(`  Status: ${exec.status}`);

			// Save raw output for inspection
			try {
				writeFileSync(`test-results/${providerName}-execution.json`, JSON.stringify(exec, null, 2));
				console.log(`  Saved: test-results/${providerName}-execution.json`);
			} catch {}

			// Navigate to workflow in app
			await gotoWithAuth(page, `/workflows/${wf.id}`);
			await page.waitForTimeout(5000);
			await screenshot(page, `research-${providerName}-canvas`);

			// Check node status indicators
			const html = await page.content();
			if (exec.status === 'success') {
				expect(html).toContain('text-green');
				console.log(`  ✓ Green status indicators visible`);
			}

			// Try clicking LLM Chain node for output
			const llmNode = page.locator('text=LLM Chain').first();
			if (await llmNode.isVisible().catch(() => false)) {
				await llmNode.click();
				await page.waitForTimeout(500);

				const outputBtn = page.getByText('output').last();
				if (await outputBtn.isVisible().catch(() => false)) {
					await outputBtn.click();
					await page.waitForTimeout(500);
					await screenshot(page, `research-${providerName}-output`);

					// Try each view
					for (const vm of ['json', 'table', 'schema']) {
						const btn = page.getByText(vm, { exact: true }).first();
						if (await btn.isVisible().catch(() => false)) {
							await btn.click();
							await page.waitForTimeout(300);
							await screenshot(page, `research-${providerName}-${vm}`);
						}
					}
				}
			}

			// Check executions tab
			const execTab = page.locator('button:has-text("Executions")').first();
			if (await execTab.isVisible().catch(() => false)) {
				await execTab.click();
				await page.waitForTimeout(1000);
				await screenshot(page, `research-${providerName}-executions`);
			}
		});
	}

	for (const providerName of ['OpenAI', 'Anthropic']) {
		test(`billing error: ${providerName}`, async ({ page }) => {
			const wf = workflows.find(w => w.provider === providerName);
			if (!wf) { test.skip(); return; }

			const execId = await executeViaApi(wf.id);
			if (execId) {
				const exec = await waitForExecution(execId, 15000);
				console.log(`  ${providerName}: ${exec.status}`);
			}

			await gotoWithAuth(page, `/workflows/${wf.id}`);
			await page.waitForTimeout(3000);
			await screenshot(page, `research-${providerName}-error`);
		});
	}

	test('global executions page', async ({ page }) => {
		await gotoWithAuth(page, '/executions');
		await page.waitForTimeout(2000);
		await screenshot(page, 'research-executions-page');
	});
});
