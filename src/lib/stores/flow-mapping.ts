import type { Node as SvelteFlowNode, Edge as SvelteFlowEdge } from '@xyflow/svelte';
import type { WorkflowNode, WorkflowConnections, ConnectionTarget } from '$lib/types';
import type { NodeTypeRegistry } from '$lib/core/node-registry.svelte';

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

/** Convert n8n WorkflowConnections to Svelte Flow edges.
 *  Requires the flow nodes array to resolve node names → Svelte Flow IDs. */
export function workflowConnectionsToEdges(
	connections: WorkflowConnections,
	flowNodes: SvelteFlowNode[]
): SvelteFlowEdge[] {
	const edges: SvelteFlowEdge[] = [];

	// n8n connections are keyed by node name, but Svelte Flow uses node IDs.
	const nameToId = new Map<string, string>();
	for (const node of flowNodes) {
		nameToId.set(node.data.label as string, node.id);
	}

	for (const [sourceName, outputs] of Object.entries(connections)) {
		const sourceId = nameToId.get(sourceName) ?? sourceName;
		for (const [connectionType, targetGroups] of Object.entries(
			outputs as Record<string, ConnectionTarget[][]>
		)) {
			for (let outputIdx = 0; outputIdx < targetGroups.length; outputIdx++) {
				for (const target of targetGroups[outputIdx]) {
					const targetId = nameToId.get(target.node) ?? target.node;
					const sourceHandle = `${connectionType}-${outputIdx}`;
					const targetHandle = `${target.type}-${target.index}`;
					const id = `${sourceId}-${sourceHandle}-${targetId}-${targetHandle}`;
					edges.push({
						id,
						source: sourceId,
						target: targetId,
						sourceHandle,
						targetHandle,
						type: 'customEdge',
						data: { connectionType, sourceName, targetName: target.node }
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

/** Convert Svelte Flow edges back to n8n WorkflowConnections.
 *  Requires the flow nodes array to resolve Svelte Flow IDs → node names. */
export function edgesToWorkflowConnections(
	edges: SvelteFlowEdge[],
	flowNodes: SvelteFlowNode[]
): WorkflowConnections {
	const connections: WorkflowConnections = {};

	// n8n connections are keyed by node name, not ID
	const idToName = new Map<string, string>();
	for (const node of flowNodes) {
		idToName.set(node.id, (node.data.label as string) ?? node.id);
	}

	for (const edge of edges) {
		// Prefer the stored sourceName/targetName from load, fall back to ID→name lookup
		const sourceName = (edge.data?.sourceName as string) ?? idToName.get(edge.source) ?? edge.source;
		const targetName = (edge.data?.targetName as string) ?? idToName.get(edge.target) ?? edge.target;
		const sourceHandle = edge.sourceHandle ?? 'main-0';
		const targetHandle = edge.targetHandle ?? 'main-0';

		const [connectionType, outputIdxStr] = sourceHandle.split('-');
		const outputIdx = parseInt(outputIdxStr, 10) || 0;

		const [targetType, targetIdxStr] = targetHandle.split('-');
		const targetIdx = parseInt(targetIdxStr, 10) || 0;

		if (!connections[sourceName]) connections[sourceName] = {};
		if (!connections[sourceName][connectionType]) connections[sourceName][connectionType] = [];

		while (connections[sourceName][connectionType].length <= outputIdx) {
			connections[sourceName][connectionType].push([]);
		}

		connections[sourceName][connectionType][outputIdx].push({
			node: targetName,
			type: targetType,
			index: targetIdx
		});
	}

	return connections;
}
