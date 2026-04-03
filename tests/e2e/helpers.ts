/**
 * Shared helpers for E2E tests.
 * Provides n8n API utilities and common page interactions.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load .env
config();

const N8N_BASE = process.env.N8N_BASE_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY || '';

function apiHeaders(): Record<string, string> {
	return {
		'X-N8N-API-KEY': N8N_API_KEY,
		'Content-Type': 'application/json',
	};
}

/** Make a request to the n8n public API */
export async function n8nApi(method: string, path: string, body?: unknown): Promise<unknown> {
	const res = await fetch(`${N8N_BASE}/api/v1${path}`, {
		method,
		headers: apiHeaders(),
		body: body ? JSON.stringify(body) : undefined,
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`n8n API ${method} ${path} failed: ${res.status} ${text}`);
	}
	return res.json();
}

/** Import a workflow JSON file into n8n */
export async function importWorkflow(filename: string): Promise<{ id: string; name: string }> {
	const filepath = join(process.cwd(), 'test-data', 'workflows', filename);
	const workflow = JSON.parse(readFileSync(filepath, 'utf-8'));
	// Remove fields that n8n rejects on create
	delete workflow.id;
	delete workflow.meta;
	return n8nApi('POST', '/workflows', workflow) as Promise<{ id: string; name: string }>;
}

/** List all workflows */
export async function listWorkflows(): Promise<Array<{ id: string; name: string }>> {
	const result = (await n8nApi('GET', '/workflows')) as { data: Array<{ id: string; name: string }> };
	return result.data;
}

/** Delete a workflow */
export async function deleteWorkflow(id: string): Promise<void> {
	await n8nApi('DELETE', `/workflows/${id}`);
}

/** Clean up test workflows */
export async function cleanupTestWorkflows(): Promise<void> {
	const workflows = await listWorkflows();
	for (const w of workflows) {
		if (/^(W[0-3]_|LLM_Test_|W_LLM_)/.test(w.name)) {
			await deleteWorkflow(w.id);
		}
	}
}

/** Load sample prompts */
export function loadSamplePrompts() {
	const filepath = join(process.cwd(), 'test-data', 'fixtures', 'sample-prompts.json');
	return JSON.parse(readFileSync(filepath, 'utf-8')).prompts;
}

/** Take a named screenshot */
export async function screenshot(page: import('@playwright/test').Page, name: string) {
	await page.screenshot({
		path: `test-results/screenshots/${name}_${Date.now()}.png`,
		fullPage: true,
	});
}

/**
 * Navigate to a page and inject the n8n API key into the window
 * so the browser-mode API client can authenticate.
 */
export async function gotoWithAuth(page: import('@playwright/test').Page, path: string) {
	const email = process.env.N8N_EMAIL || '';
	const password = process.env.N8N_PASSWORD || '';
	await page.addInitScript(({ apiKey, email, password }) => {
		(window as any).__N8N_API_KEY__ = apiKey;
		(window as any).__N8N_EMAIL__ = email;
		(window as any).__N8N_PASSWORD__ = password;
	}, { apiKey: N8N_API_KEY, email, password });
	await page.goto(path);
	await page.waitForLoadState('domcontentloaded');
	await page.waitForTimeout(2000);
}
