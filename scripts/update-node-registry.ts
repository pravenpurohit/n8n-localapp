/**
 * Fetches node type definitions from a running n8n instance
 * and writes them to src/static/node-registry.json.
 *
 * Usage: npm run update-node-registry
 *
 * Requires N8N_BASE_URL and N8N_API_KEY in .env
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

interface NodeTypeDefinition {
	type: string;
	displayName: string;
	icon: string;
	category: string;
	version: number | number[];
	description: string;
	defaults: { name: string; color?: string };
	inputs: Array<{ type: string; displayName?: string; required?: boolean }>;
	outputs: Array<{ type: string; displayName?: string; required?: boolean }>;
	properties: Array<Record<string, unknown>>;
	credentials?: Array<{ name: string; required: boolean }>;
}

function loadEnv(): { baseUrl: string; apiKey: string } {
	const envPath = resolve(projectRoot, '.env');
	let content: string;
	try {
		content = readFileSync(envPath, 'utf-8');
	} catch {
		throw new Error(`.env file not found at ${envPath}`);
	}

	const vars: Record<string, string> = {};
	for (const line of content.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const eqIdx = trimmed.indexOf('=');
		if (eqIdx === -1) continue;
		const key = trimmed.slice(0, eqIdx).trim();
		const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
		vars[key] = value;
	}

	const baseUrl = vars['N8N_BASE_URL'];
	const apiKey = vars['N8N_API_KEY'];

	if (!baseUrl) throw new Error('N8N_BASE_URL not found in .env');
	if (!apiKey) throw new Error('N8N_API_KEY not found in .env');

	return { baseUrl: baseUrl.replace(/\/$/, ''), apiKey };
}

function transformNode(raw: Record<string, unknown>): NodeTypeDefinition {
	const rawInputs = raw.inputs as unknown;
	const rawOutputs = raw.outputs as unknown;

	const inputs = Array.isArray(rawInputs)
		? rawInputs.map((i: unknown) => {
				if (typeof i === 'string') return { type: i };
				if (typeof i === 'object' && i !== null) {
					const obj = i as Record<string, unknown>;
					return {
						type: (obj.type as string) ?? 'main',
						...(obj.displayName ? { displayName: obj.displayName as string } : {}),
						...(obj.required !== undefined ? { required: obj.required as boolean } : {})
					};
				}
				return { type: 'main' };
			})
		: [];

	const outputs = Array.isArray(rawOutputs)
		? rawOutputs.map((o: unknown) => {
				if (typeof o === 'string') return { type: o };
				if (typeof o === 'object' && o !== null) {
					const obj = o as Record<string, unknown>;
					return {
						type: (obj.type as string) ?? 'main',
						...(obj.displayName ? { displayName: obj.displayName as string } : {}),
						...(obj.required !== undefined ? { required: obj.required as boolean } : {})
					};
				}
				return { type: 'main' };
			})
		: [];

	const defaults = (raw.defaults as Record<string, unknown>) ?? {};

	return {
		type: raw.type as string,
		displayName: (raw.displayName as string) ?? (raw.type as string),
		icon: (raw.icon as string) ?? 'fa:question',
		category: (raw.category as string) ?? 'Core',
		version: (raw.version as number | number[]) ?? 1,
		description: (raw.description as string) ?? '',
		defaults: {
			name: (defaults.name as string) ?? (raw.displayName as string) ?? '',
			...(defaults.color ? { color: defaults.color as string } : {})
		},
		inputs,
		outputs,
		properties: Array.isArray(raw.properties) ? (raw.properties as Array<Record<string, unknown>>) : [],
		credentials: Array.isArray(raw.credentials)
			? (raw.credentials as Array<{ name: string; required: boolean }>)
			: []
	};
}

async function main(): Promise<void> {
	console.log('Loading .env configuration...');
	const { baseUrl, apiKey } = loadEnv();
	console.log(`Fetching node types from ${baseUrl}/rest/nodes ...`);

	const response = await fetch(`${baseUrl}/rest/nodes`, {
		headers: {
			'X-N8N-API-KEY': apiKey,
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch nodes: ${response.status} ${response.statusText}`);
	}

	const rawNodes = (await response.json()) as Record<string, unknown>[];
	console.log(`Received ${rawNodes.length} node type definitions`);

	const transformed = rawNodes.map(transformNode);

	const outputPath = resolve(projectRoot, 'src/static/node-registry.json');
	writeFileSync(outputPath, JSON.stringify(transformed, null, 2) + '\n', 'utf-8');
	console.log(`Wrote ${transformed.length} node types to ${outputPath}`);
}

main().catch((err) => {
	console.error('Error:', err instanceof Error ? err.message : err);
	process.exit(1);
});
