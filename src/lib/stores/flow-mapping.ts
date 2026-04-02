import type { Node as SvelteFlowNode, Edge as SvelteFlowEdge } from '@xyflow/svelte';
import type { WorkflowNode, WorkflowConnections, ConnectionTarget } from '$lib/types';
import type { NodeTypeRegistry } from '$lib/core/node-registry';

const AI_NODE_PATTERNS = ['langchain', 'chainLlm', 'lmChat', 'lmText', 'outputParser', 'agent'];
const TRIGGER_PATTERN = /trigger/i;

function detectNodeType(nodeType: string): 'customNode' | 'triggerNode' | 'clusterNode' {
	if (AI_NODE_PATTERNS.some((p) => nodeType.includes(p))) return 'clusterNode';
	if (TRIGGER_PATTERN.test(nodeType)) return 'triggerNode';
	return 'customNode';
}

/** Convert n8n WorkflowNodes to Svelte Flow nodes */
export function workflowNodesToFlowNodes(
	nodes: WorkflowNode[],
	registry: NodeTypeRegistry
): SvelteFlowNode[] {
	return nodes.map((node) => {
		const def = registry.get(node.type, node.typeVersion);
		return {
			id: node.id,
			type: detectNodeType(node.type),
			position: { x: node.position[0], y: node.position[1] },
			data: {
				label: node.name,
				nodeType: node.type,
				typeVersion: node.typeVersion,
				parameters: node.parameters,
				credentials: node.credentials,
				disabled: node.disabled ?? false,
				icon: def?.icon ?? '⚙️'
			}
		};
	});
}

/** Convert n8n WorkflowConnections to Svelte Flow edges */
export function workflowConnectionsToEdges(connections: WorkflowConnections): SvelteFlowEdge[] {
	const edges: SvelteFlowEdge[] = [];
	const nodeNameToId = new Map<string, string>();

	// Note: connections use node names as keys, but Svelte Flow uses IDs.
	// We store the source name in the edge and resolve during rendering.
	// For now, use the source name as a proxy since we need the full node list for ID resolution.
	for (const [sourceName, outputs] of Object.entries(connections)) {
		for (const [connectionType, targetGroups] of Object.entries(
			outputs as Record<string, ConnectionTarget[][]>
		)) {
			for (let outputIdx = 0; outputIdx < targetGroups.length; outputIdx++) {
				for (const target of targetGroups[outputIdx]) {
					const sourceHandle = `${connectionType}-${outputIdx}`;
					const targetHandle = `${target.type}-${target.index}`;
					const id = `${sourceName}-${sourceHandle}-${target.node}-${targetHandle}`;
					edges.push({
						id,
						source: sourceName,
						target: target.node,
						sourceHandle,
						targetHandle,
						type: 'customEdge',
						data: { connectionType }
					});
				}
			}
		}
	}
	return edges;
}

/** Convert Svelte Flow nodes back to n8n WorkflowNodes */
export function flowNodesToWorkflowNodes(nodes: SvelteFlowNode[]): WorkflowNode[] {
	return nodes
		.filter((n) => n.type !== 'stickyNote')
		.map((node) => ({
			id: node.id,
			name: (node.data.label as string) ?? node.id,
			type: (node.data.nodeType as string) ?? '',
			typeVersion: (node.data.typeVersion as number) ?? 1,
			position: [node.position.x, node.position.y] as [number, number],
			parameters: (node.data.parameters as Record<string, unknown>) ?? {},
			credentials: node.data.credentials as Record<string, { id: string; name: string }> | undefined,
			disabled: (node.data.disabled as boolean) ?? false
		}));
}

/** Convert Svelte Flow edges back to n8n WorkflowConnections */
export function edgesToWorkflowConnections(edges: SvelteFlowEdge[]): WorkflowConnections {
	const connections: WorkflowConnections = {};

	for (const edge of edges) {
		const sourceName = edge.source;
		const sourceHandle = edge.sourceHandle ?? 'main-0';
		const targetHandle = edge.targetHandle ?? 'main-0';

		const [connectionType, outputIdxStr] = sourceHandle.split('-');
		const outputIdx = parseInt(outputIdxStr, 10) || 0;

		const [targetType, targetIdxStr] = targetHandle.split('-');
		const targetIdx = parseInt(targetIdxStr, 10) || 0;

		if (!connections[sourceName]) connections[sourceName] = {};
		if (!connections[sourceName][connectionType]) connections[sourceName][connectionType] = [];

		// Ensure the output index array is large enough
		while (connections[sourceName][connectionType].length <= outputIdx) {
			connections[sourceName][connectionType].push([]);
		}

		connections[sourceName][connectionType][outputIdx].push({
			node: edge.target,
			type: targetType,
			index: targetIdx
		});
	}

	return connections;
}
