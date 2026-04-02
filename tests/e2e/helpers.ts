/**
 * Shared helpers for E2E tests.
 * Provides n8n API utilities and common page interactions.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const N8N_BASE = process.env.N8N_BASE_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY || '';

/** Headers for n8n API calls */
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

/** Import a workflow JSON file into n8n, returns the created workflow */
export async function importWorkflow(filename: string): Promise<{ id: string; name: string }> {
	const filepath = join(process.cwd(), 'test-data', 'workflows', filename);
	const workflow = JSON.parse(readFileSync(filepath, 'utf-8'));
	// Remove id so n8n assigns a new one
	delete workflow.id;
	const result = await n8nApi('POST', '/workflows', workflow) as { id: string; name: string };
	return result;
}

/** List all workflows from n8n */
export async function listWorkflows(): Promise<Array<{ id: string; name: string }>> {
	const result = await n8nApi('GET', '/workflows') as { data: Array<{ id: string; name: string }> };
	return result.data;
}

/** Delete a workflow by ID */
export async function deleteWorkflow(id: string): Promise<void> {
	await n8nApi('DELETE', `/workflows/${id}`);
}

/** Clean up all test workflows (those starting with W0_, W1_, W2_, W3_) */
export async function cleanupTestWorkflows(): Promise<void> {
	const workflows = await listWorkflows();
	for (const w of workflows) {
		if (/^W[0-3]_/.test(w.name)) {
			await deleteWorkflow(w.id);
		}
	}
}

/** Load sample prompts from fixtures */
export function loadSamplePrompts(): Array<{
	id: string;
	graphName: string;
	sourcePrompt: string;
	expectedStrategy: string;
}> {
	const filepath = join(process.cwd(), 'test-data', 'fixtures', 'sample-prompts.json');
	const data = JSON.parse(readFileSync(filepath, 'utf-8'));
	return data.prompts;
}

/** Take a named screenshot */
export async function screenshot(page: import('@playwright/test').Page, name: string): Promise<void> {
	await page.screenshot({
		path: `test-results/screenshots/${name}_${Date.now()}.png`,
		fullPage: true,
	});
}
