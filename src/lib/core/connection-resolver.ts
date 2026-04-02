import type { WorkflowNode, WorkflowConnections, ConnectionTarget } from '$lib/types';

/** Known n8n connection types */
export const CONNECTION_TYPES = [
	'main',
	'ai_languageModel',
	'ai_outputParser',
	'ai_agent',
	'ai_memory',
	'ai_tool',
	'ai_vectorStore',
	'ai_embedding'
] as const;

export type ConnectionType = (typeof CONNECTION_TYPES)[number];

export interface ConnectionValidationResult {
	valid: boolean;
	warnings: string[];
}

/**
 * Validate that all connection source and target nodes exist in the node list.
 * Returns warnings for any dangling references.
 */
export function validateConnections(
	nodes: WorkflowNode[],
	connections: WorkflowConnections
): ConnectionValidationResult {
	const warnings: string[] = [];
	const nodeNames = new Set(nodes.map((n) => n.name));

	for (const [source, outputs] of Object.entries(connections)) {
		if (!nodeNames.has(source)) {
			warnings.push(`Connection source "${source}" not found in nodes`);
		}

		for (const [connectionType, targetGroups] of Object.entries(
			outputs as Record<string, ConnectionTarget[][]>
		)) {
			if (!isKnownConnectionType(connectionType)) {
				warnings.push(`Unknown connection type "${connectionType}" from "${source}"`);
			}

			for (const targetGroup of targetGroups) {
				for (const target of targetGroup) {
					if (!nodeNames.has(target.node)) {
						warnings.push(
							`Connection target "${target.node}" (from "${source}") not found in nodes`
						);
					}
				}
			}
		}
	}

	return {
		valid: warnings.length === 0,
		warnings
	};
}

/**
 * Identify the connection type between a source node type and target node type.
 * AI/LangChain nodes use specialized connection types; standard nodes use "main".
 */
export function getConnectionType(sourceType: string, targetType: string): ConnectionType {
	// AI language model connections
	if (sourceType.includes('lmChat') || sourceType.includes('lmText')) {
		return 'ai_languageModel';
	}
	// AI output parser connections
	if (sourceType.includes('outputParser')) {
		return 'ai_outputParser';
	}
	// AI agent connections
	if (sourceType.includes('.agent')) {
		return 'ai_agent';
	}
	// AI memory connections
	if (sourceType.includes('memory') && targetType.includes('langchain')) {
		return 'ai_memory';
	}
	// AI tool connections
	if (sourceType.includes('tool') && targetType.includes('langchain')) {
		return 'ai_tool';
	}
	// AI vector store connections
	if (sourceType.includes('vectorStore')) {
		return 'ai_vectorStore';
	}
	// AI embedding connections
	if (sourceType.includes('embedding')) {
		return 'ai_embedding';
	}

	return 'main';
}

function isKnownConnectionType(type: string): type is ConnectionType {
	return (CONNECTION_TYPES as readonly string[]).includes(type);
}
