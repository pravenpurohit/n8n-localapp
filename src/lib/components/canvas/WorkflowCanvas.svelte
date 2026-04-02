<script lang="ts">
	import { SvelteFlow, Background, type NodeTypes, type EdgeTypes, type OnConnect } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import { canvasStore } from '$lib/stores/canvas.svelte';
	import { nodePanelStore } from '$lib/stores/node-panel.svelte';
	import CustomNode from './CustomNode.svelte';
	import TriggerNode from './TriggerNode.svelte';
	import ClusterNode from './ClusterNode.svelte';
	import CustomEdge from './CustomEdge.svelte';

	const nodeTypes: NodeTypes = {
		customNode: CustomNode as any,
		triggerNode: TriggerNode as any,
		clusterNode: ClusterNode as any,
	};

	const edgeTypes: EdgeTypes = {
		customEdge: CustomEdge as any,
	};

	const onConnect: OnConnect = (connection) => {
		canvasStore.addEdge(
			connection.source!,
			connection.target!,
			connection.sourceHandle ?? 'main-0',
			connection.targetHandle ?? 'main-0'
		);
	};

	function handleNodeClick(_event: MouseEvent, node: any) {
		canvasStore.selectedNodeId = node.id;
		nodePanelStore.open(node);
	}

	function handlePaneClick() {
		canvasStore.selectedNodeId = null;
		nodePanelStore.close();
	}
</script>

<div class="h-full w-full">
	<SvelteFlow
		nodes={canvasStore.nodes}
		edges={canvasStore.edges}
		{nodeTypes}
		{edgeTypes}
		{onConnect}
		on:nodeclick={(e) => handleNodeClick(e.detail.event, e.detail.node)}
		on:paneclick={handlePaneClick}
		fitView
	>
		<Background variant="dots" gap={20} color="#ddd" />
	</SvelteFlow>
</div>
