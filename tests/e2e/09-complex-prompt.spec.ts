/**
 * Complex Prompt Execution: 6-Stage Production Business Due Diligence
 * 11,142 chars — the most demanding prompt in the test suite.
 * Timeout: 15 minutes per provider (LLMs need time for this).
 *
 * Output saved to test-results/{provider}-6stage-output.md
 */

import { test, expect } from '@playwright/test';
import { screenshot, gotoWithAuth, n8nApi } from './helpers';
import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
config();

const BASE = process.env.N8N_BASE_URL || 'http://localhost:5678';
const EMAIL = process.env.N8N_EMAIL || '';
const PASSWORD = process.env.N8N_PASSWORD || '';
let sessionCookie = '';

// 15 minute test timeout
test.setTimeout(15 * 60 * 1000);

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
	if (!res.ok) { console.log(`  API error: ${res.status} ${(await res.text()).slice(0, 200)}`); return null; }
	return ((await res.json()) as any).data?.executionId || null;
}

async function waitForExecution(execId: string, timeoutMs: number) {
	const start = Date.now();
	let lastStatus = '';
	while (Date.now() - start < timeoutMs) {
		try {
			const exec = await n8nApi('GET', `/executions/${execId}`) as any;
			if (exec.status !== lastStatus) {
				lastStatus = exec.status;
				const elapsed = Math.round((Date.now() - start) / 1000);
				console.log(`    [${elapsed}s] status: ${exec.status}`);
			}
			if (['success', 'error', 'canceled'].includes(exec.status)) return exec;
		} catch {}
		await new Promise(r => setTimeout(r, 5000)); // Poll every 5s for long runs
	}
	return { status: 'timeout' };
}

async function extractOutput(execId: string): Promise<string | null> {
	try {
		const res = await fetch(`${BASE}/rest/executions/${execId}?includeData=true`, {
			headers: { Cookie: sessionCookie },
		});
		const d = await res.json() as any;
		const dataStr = d.data?.data;
		if (!dataStr || typeof dataStr !== 'string') return null;

		const flatted = JSON.parse(dataStr);
		// Find the longest text content (the LLM output)
		let longest = '';
		for (const item of flatted) {
			if (typeof item === 'string' && item.length > longest.length) {
				longest = item;
			}
		}
		return longest.length > 100 ? longest : null;
	} catch { return null; }
}

test.beforeAll(async () => {
	const ok = await login();
	console.log(`Session login: ${ok ? 'OK' : 'FAILED'}`);
});

test.describe('6-Stage Due Diligence Prompt', () => {
	// Load the prompt
	const prompts = JSON.parse(readFileSync(join(process.cwd(), 'test-data', 'fixtures', 'sample-prompts.json'), 'utf-8'));
	const complexPrompt = prompts.prompts.find((p: any) => p.id === 'production-business-diligence-6stage');
	const promptText = complexPrompt?.sourcePrompt || '';

	for (const providerName of ['Groq', 'Gemini']) {
		test(`${providerName}: execute 6-stage prompt (${promptText.length} chars)`, async ({ page }) => {
			// Find the LLM_Test workflow
			const existing = await n8nApi('GET', '/workflows') as any;
			const wf = existing.data.find((w: any) => w.name === `LLM_Test_${providerName}`);
			if (!wf) { console.log(`⚠ LLM_Test_${providerName} not found`); test.skip(); return; }

			// Update the workflow prompt to use the 6-stage prompt
			const fullWf = await n8nApi('GET', `/workflows/${wf.id}`) as any;
			for (const node of fullWf.nodes) {
				if (node.type.includes('chainLlm')) {
					node.parameters.text = promptText;
				}
			}
			await n8nApi('PUT', `/workflows/${wf.id}`, {
				name: fullWf.name,
				nodes: fullWf.nodes,
				connections: fullWf.connections,
				settings: fullWf.settings,
			});
			console.log(`  Updated ${providerName} workflow with 6-stage prompt (${promptText.length} chars)`);

			// Execute
			console.log(`  Executing ${providerName}...`);
			const startTime = Date.now();
			const execId = await executeViaApi(wf.id);
			expect(execId).toBeTruthy();
			console.log(`  Execution ID: ${execId}`);

			// Wait up to 14 minutes
			const exec = await waitForExecution(execId!, 14 * 60 * 1000);
			const elapsed = Math.round((Date.now() - startTime) / 1000);
			console.log(`  Final status: ${exec.status} (${elapsed}s)`);

			// Extract and save output
			const output = await extractOutput(execId!);
			if (output) {
				const outputPath = `test-results/${providerName}-6stage-output.md`;
				writeFileSync(outputPath, output);
				console.log(`  ✓ Output saved: ${outputPath} (${output.length} chars)`);
			} else {
				console.log(`  ⚠ Could not extract output text`);
			}

			// Save execution metadata
			writeFileSync(`test-results/${providerName}-6stage-execution.json`, JSON.stringify({
				provider: providerName,
				executionId: execId,
				status: exec.status,
				durationSeconds: elapsed,
				promptLength: promptText.length,
				outputLength: output?.length || 0,
			}, null, 2));

			// Navigate to app and screenshot
			await gotoWithAuth(page, `/workflows/${wf.id}`);
			await page.waitForTimeout(5000);
			await screenshot(page, `6stage-${providerName}-canvas`);

			// Screenshot the executions tab
			const execTab = page.locator('button:has-text("Executions")').first();
			if (await execTab.isVisible().catch(() => false)) {
				await execTab.click();
				await page.waitForTimeout(1000);
				await screenshot(page, `6stage-${providerName}-executions`);
			}

			// Log summary
			console.log(`\n  === ${providerName} Summary ===`);
			console.log(`  Status: ${exec.status}`);
			console.log(`  Duration: ${elapsed}s`);
			console.log(`  Output: ${output ? `${output.length} chars` : 'none'}`);
			if (output) {
				console.log(`  First 300 chars: ${output.slice(0, 300)}`);
			}
		});
	}
});
