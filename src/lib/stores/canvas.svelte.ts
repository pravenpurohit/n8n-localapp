import type { Node as SvelteFlowNode, Edge as SvelteFlowEdge } from '@xyflow/svelte';
import type { Workflow, WorkflowNode, WorkflowSettings, Tag } from '$lib/types';
import { getWorkflow, updateWorkflow, createWorkflow } from '$lib/api/workflows';
import { activateWorkflow, deactivateWorkflow } from '$lib/api/workflows';
import { nodeRegistry } from '$lib/core/node-registry.svelte';
import { logger } from '$lib/core/logger';
import {
	workflowNodesToFlowNodes,
	workflowConnectionsToEdges,
	flowNodesToWorkflowNodes,
	edgesToWorkflowConnections
} from '$lib/stores/flow-mapping';

class CanvasStore {
	nodes = $state<SvelteFlowNode[]>([]);
	edges = $state<SvelteFlowEdge[]>([]);
	selectedNodeId = $state<string | null>(null);
	workflowId = $state<string>('');
	workflowName = $state<string>('');
	workflowActive = $state<boolean>(false);
	workflowTags = $state<Tag[]>([]);
	workflowSettings = $state<WorkflowSettings>({});
	isDirty = $state<boolean>(false);
	executionStatus = $state<Map<string, 'success' | 'error' | 'running'>>(new Map());
	private versionId = '';
	private originalWorkflow: Workflow | null = null;

	selectedNode = $derived(this.nodes.find((n) => n.id === this.selectedNodeId) ?? null);

	async loadWorkflow(id: string): Promise<void> {
		const workflow = await getWorkflow(id);
		this.originalWorkflow = workflow;
		this.workflowId = workflow.id;
		this.workflowName = workflow.name;
		this.workflowActive = workflow.active;
		this.workflowTags = workflow.tags;
		this.workflowSettings = workflow.settings;
		this.versionId = workflow.versionId;
		this.nodes = workflowNodesToFlowNodes(workflow.nodes, nodeRegistry);
		this.edges = workflowConnectionsToEdges(workflow.connections, this.nodes);
		this.executionStatus = new Map();
		this.isDirty = false;
	}

	async saveWorkflow(): Promise<void> {
		const workflowNodes = flowNodesToWorkflowNodes(this.nodes);
		const connections = edgesToWorkflowConnections(this.edges, this.nodes);
		const payload: Partial<Workflow> = {
			name: this.workflowName,
			nodes: workflowNodes,
			connections,
			settings: this.workflowSettings,
			tags: this.workflowTags
		};

		if (this.workflowId) {
			const updated = await updateWorkflow(this.workflowId, {
				...payload,
				versionId: this.versionId
			});
			this.versionId = updated.versionId;
		} else {
			const created = await createWorkflow(payload);
			this.workflowId = created.id;
			this.versionId = created.versionId;
		}
		this.isDirty = false;
		logger.info('canvas', `Workflow saved: ${this.workflowId}`);
	}

	async activateWorkflow(): Promise<void> {
		if (!this.workflowId) return;
		const result = await activateWorkflow(this.workflowId);
		this.workflowActive = result.active;
	}

	async deactivateWorkflow(): Promise<void> {
		if (!this.workflowId) return;
		const result = await deactivateWorkflow(this.workflowId);
		this.workflowActive = result.active;
	}

	async executeWorkflow(): Promise<string | null> {
		if (!this.workflowId) return null;
		try {
			// Try public API first
			const { apiClient } = await import('$lib/api/client');
			const result = await apiClient.post<{ data: { id: string } }>(
				`/workflows/${this.workflowId}/run`,
				{}
			);
			return result.data.id;
		} catch {
			try {
				// Fallback to internal REST API
				const { apiClient } = await import('$lib/api/client');
				const result = await apiClient.requestInternal<{ data: { id: string } }>(
					'POST',
					`/rest/workflows/${this.workflowId}/run`,
					{ startNodes: [] }
				);
				return result.data.id;
			} catch (err) {
				logger.error('canvas', 'Failed to execute workflow', { error: String(err) });
				return null;
			}
		}
	}

	addNode(type: string, position: { x: number; y: number }): void {
		const def = nodeRegistry.get(type);
		const id = crypto.randomUUID();
		const isTrigger = type.toLowerCase().includes('trigger');
		const isAi =
			type.includes('langchain') || type.includes('chainLlm') || type.includes('lmChat');

		const node: SvelteFlowNode = {
			id,
			type: isAi ? 'clusterNode' : isTrigger ? 'triggerNode' : 'customNode',
			position,
			data: {
				label: def?.displayName ?? type.split('.').pop() ?? type,
				nodeType: type,
				typeVersion: def ? (Array.isArray(def.version) ? def.version[0] : def.version) : 1,
				parameters: {},
				icon: def?.icon ?? '⚙️'
			}
		};
		this.nodes = [...this.nodes, node];
		this.isDirty = true;
	}

	removeNode(id: string): void {
		this.nodes = this.nodes.filter((n) => n.id !== id);
		this.edges = this.edges.filter((e) => e.source !== id && e.target !== id);
		if (this.selectedNodeId === id) this.selectedNodeId = null;
		this.isDirty = true;
	}

	addEdge(source: string, target: string, sourceHandle: string, targetHandle: string): void {
		const id = `${source}-${sourceHandle}-${target}-${targetHandle}`;
		if (this.edges.some((e) => e.id === id)) return;
		this.edges = [
			...this.edges,
			{ id, source, target, sourceHandle, targetHandle, type: 'customEdge' }
		];
		this.isDirty = true;
	}

	removeEdge(id: string): void {
		this.edges = this.edges.filter((e) => e.id !== id);
		this.isDirty = true;
	}

	addStickyNote(position: { x: number; y: number }): void {
		const id = crypto.randomUUID();
		this.nodes = [
			...this.nodes,
			{
				id,
				type: 'stickyNote',
				position,
				data: { label: '', text: '', width: 200, height: 150 },
				style: 'width: 200px; height: 150px;'
			}
		];
		this.isDirty = true;
	}

	markDirty(): void {
		this.isDirty = true;
	}

	reset(): void {
		this.nodes = [];
		this.edges = [];
		this.selectedNodeId = null;
		this.workflowId = '';
		this.workflowName = '';
		this.workflowActive = false;
		this.workflowTags = [];
		this.workflowSettings = {};
		this.isDirty = false;
		this.executionStatus = new Map();
		this.versionId = '';
		this.originalWorkflow = null;
	}
}

export const canvasStore = new CanvasStore();
