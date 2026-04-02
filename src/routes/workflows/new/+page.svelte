<script lang="ts">
	import { onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { beforeNavigate } from '$app/navigation';
	import TopBar from '$lib/components/layout/TopBar.svelte';
	import WorkflowCanvas from '$lib/components/canvas/WorkflowCanvas.svelte';
	import NodeSelector from '$lib/components/canvas/NodeSelector.svelte';
	import NodeConfigPanel from '$lib/components/panels/NodeConfigPanel.svelte';
	import { canvasStore } from '$lib/stores/canvas.svelte';
	import { nodePanelStore } from '$lib/stores/node-panel.svelte';

	let nodeSelectorOpen = $state(false);

	// Start with empty canvas
	canvasStore.reset();
	canvasStore.workflowName = 'New Workflow';

	onDestroy(() => {
		canvasStore.reset();
	});

	beforeNavigate(({ cancel }) => {
		// If no nodes added, no need to warn
		if (canvasStore.nodes.length === 0) return;
		if (canvasStore.isDirty) {
			if (!confirm('You have unsaved changes. Discard?')) {
				cancel();
			}
		}
	});

	async function handleSave() {
		await canvasStore.saveWorkflow();
		if (canvasStore.workflowId) {
			goto(`/workflows/${canvasStore.workflowId}`);
		}
	}
</script>

<div class="flex h-full flex-col">
	<TopBar />

	<div class="flex border-b border-gray-200 px-4 dark:border-[#3a3a5c]">
		<div class="flex-1"></div>
		<button
			onclick={() => nodeSelectorOpen = !nodeSelectorOpen}
			class="my-1 rounded border border-gray-200 px-3 py-1 text-xs dark:border-[#3a3a5c]"
		>
			+ Add Node
		</button>
	</div>

	<div class="relative flex-1">
		{#if canvasStore.nodes.length === 0}
			<div class="flex h-full items-center justify-center">
				<div class="text-center">
					<p class="mb-2 text-lg text-gray-400">Add first step</p>
					<button
						onclick={() => nodeSelectorOpen = true}
						class="rounded-lg bg-[#ff6d5a] px-4 py-2 text-sm font-medium text-white hover:bg-[#e55a48]"
					>
						Add a Trigger
					</button>
				</div>
			</div>
		{:else}
			<WorkflowCanvas />
		{/if}
		<NodeSelector bind:open={nodeSelectorOpen} />
		{#if nodePanelStore.selectedNode}
			<NodeConfigPanel />
		{/if}
	</div>
</div>
