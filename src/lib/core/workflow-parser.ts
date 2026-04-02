import type { Workflow, WorkflowNode, WorkflowConnections, ConnectionTarget } from '$lib/types';

/** Result of parsing a workflow JSON string */
export interface ParseResult {
	workflow: Workflow;
	warnings: string[];
}

/** Error thrown when workflow JSON has structural issues */
export class ParseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ParseError';
	}
}

/**
 * Parse a raw n8n workflow JSON string into a typed Workflow with warnings.
 * Validates required fields and connection references.
 */
export function parseWorkflowJson(json: string): ParseResult {
	const warnings: string[] = [];

	let raw: Record<string, unknown>;
	try {
		raw = JSON.parse(json) as Record<string, unknown>;
	} catch {
		throw new ParseError('Invalid JSON');
	}

	if (!raw.nodes || !Array.isArray(raw.nodes)) {
		throw new ParseError('Missing or invalid "nodes" array');
	}
	if (!raw.connections || typeof raw.connections !== 'object' || Array.isArray(raw.connections)) {
		throw new ParseError('Missing or invalid "connections" object');
	}

	const nodes: WorkflowNode[] = (raw.nodes as unknown[]).map((n) => parseNode(n));
	const connections = raw.connections as WorkflowConnections;

	// Validate connection references
	const nodeNames = new Set(nodes.map((n) => n.name));
	for (const [source, outputs] of Object.entries(connections)) {
		if (!nodeNames.has(source)) {
			warnings.push(`Connection source "${source}" not found in nodes`);
		}
		for (const targetGroups of Object.values(outputs as Record<string, ConnectionTarget[][]>)) {
			for (const targetGroup of targetGroups) {
				for (const target of targetGroup) {
					if (!nodeNames.has(target.node)) {
						warnings.push(`Connection target "${target.node}" not found in nodes`);
					}
				}
			}
		}
	}

	return {
		workflow: {
			id: (raw.id as string) ?? '',
			name: (raw.name as string) ?? 'Untitled Workflow',
			active: (raw.active as boolean) ?? false,
			versionId: (raw.versionId as string) ?? '',
			nodes,
			connections,
			settings: (raw.settings as Workflow['settings']) ?? {},
			staticData: raw.staticData ?? null,
			tags: (raw.tags as Workflow['tags']) ?? [],
			pinData: (raw.pinData as Record<string, unknown[]>) ?? {},
			createdAt: (raw.createdAt as string) ?? new Date().toISOString(),
			updatedAt: (raw.updatedAt as string) ?? new Date().toISOString()
		},
		warnings
	};
}

function parseNode(raw: unknown): WorkflowNode {
	const node = raw as Record<string, unknown>;

	if (!node.type || typeof node.type !== 'string') {
		throw new ParseError('Node missing "type" field');
	}
	if (!node.name || typeof node.name !== 'string') {
		throw new ParseError('Node missing "name" field');
	}

	return {
		id: (node.id as string) ?? crypto.randomUUID(),
		name: node.name as string,
		type: node.type as string,
		typeVersion: (node.typeVersion as number) ?? 1,
		position: (node.position as [number, number]) ?? [0, 0],
		parameters: (node.parameters as Record<string, unknown>) ?? {},
		credentials: node.credentials as Record<string, { id: string; name: string }> | undefined,
		disabled: (node.disabled as boolean) ?? false
	};
}

/**
 * Serialize a Workflow back to JSON string (for round-trip).
 */
export function serializeWorkflow(workflow: Workflow): string {
	return JSON.stringify(
		{
			id: workflow.id || undefined,
			name: workflow.name,
			active: workflow.active,
			versionId: workflow.versionId || undefined,
			nodes: workflow.nodes.map((n) => ({
				parameters: n.parameters,
				id: n.id,
				name: n.name,
				type: n.type,
				typeVersion: n.typeVersion,
				position: n.position,
				...(n.credentials ? { credentials: n.credentials } : {}),
				...(n.disabled ? { disabled: n.disabled } : {})
			})),
			connections: workflow.connections,
			pinData: workflow.pinData,
			settings: workflow.settings,
			staticData: workflow.staticData,
			tags: workflow.tags.length > 0 ? workflow.tags : undefined
		},
		null,
		2
	);
}
