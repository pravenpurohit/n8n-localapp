<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { beforeNavigate } from '$app/navigation';
	import TopBar from '$lib/components/layout/TopBar.svelte';
	import WorkflowCanvas from '$lib/components/canvas/WorkflowCanvas.svelte';
	import NodeSelector from '$lib/components/canvas/NodeSelector.svelte';
	import NodeConfigPanel from '$lib/components/panels/NodeConfigPanel.svelte';
	import { canvasStore } from '$lib/stores/canvas.svelte';
	import { nodePanelStore } from '$lib/stores/node-panel.svelte';
	import { getExecution } from '$lib/api/executions';
	import { logger } from '$lib/core/logger';

	let activeTab = $state<'editor' | 'executions'>('editor');
	let nodeSelectorOpen = $state(false);
	let loading = $state(true);
	let pollingInterval: ReturnType<typeof setInterval> | null = null;

	function handleKeydown(e: KeyboardEvent) {
		const mod = e.metaKey || e.ctrlKey;
		if (mod && e.key === 's') {
			e.preventDefault();
			canvasStore.saveWorkflow();
		} else if (e.key === 'Delete' || e.key === 'Backspace') {
			if (canvasStore.selectedNodeId && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
				canvasStore.removeNode(canvasStore.selectedNodeId);
			}
		} else if (e.key === 'Escape') {
			canvasStore.selectedNodeId = null;
			nodePanelStore.close();
			nodeSelectorOpen = false;
		}
	}

	onMount(async () => {
		window.addEventListener('keydown', handleKeydown);
		const id = $page.params.id;
		try {
			await canvasStore.loadWorkflow(id);
		} catch (err) {
			logger.error('canvas-page', 'Failed to load workflow', { error: String(err) });
		} finally {
			loading = false;
		}
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeydown);
		stopPolling();
		canvasStore.reset();
	});

	beforeNavigate(({ cancel }) => {
		if (canvasStore.isDirty) {
			if (!confirm('You have unsaved changes. Discard?')) {
				cancel();
			}
		}
	});

	async function handleExecute() {
		const execId = await canvasStore.executeWorkflow();
		if (execId) startPolling(execId);
	}

	function startPolling(executionId: string) {
		const startTime = Date.now();
		pollingInterval = setInterval(async () => {
			if (Date.now() - startTime > 300_000) {
				stopPolling();
				logger.warn('canvas-page', 'Execution polling timeout');
				return;
			}
			try {
				const exec = await getExecution(executionId);
				if (exec.data?.resultData?.runData) {
					const statusMap = new Map<string, 'success' | 'error' | 'running'>();
					for (const [nodeName, results] of Object.entries(exec.data.resultData.runData)) {
						const last = results[results.length - 1];
						statusMap.set(nodeName, last.error ? 'error' : 'success');
					}
					canvasStore.executionStatus = statusMap;
				}
				if (['success', 'error', 'canceled'].includes(exec.status)) {
					stopPolling();
				}
			} catch {
				// continue polling
			}
		}, 1000);
	}

	function stopPolling() {
		if (pollingInterval) {
			clearInterval(pollingInterval);
			pollingInterval = null;
		}
	}
</script>

{#if loading}
	<div class="flex h-full items-center justify-center">
		<p class="text-gray-400">Loading workflow...</p>
	</div>
{:else}
	<div class="flex h-full flex-col">
		<TopBar />

		<!-- Tab bar -->
		<div class="flex border-b border-gray-200 px-4 dark:border-[#3a3a5c]">
			<button
				onclick={() => activeTab = 'editor'}
				class="px-3 py-2 text-sm"
				class:text-[#ff6d5a]={activeTab === 'editor'}
				class:border-b-2={activeTab === 'editor'}
				class:border-[#ff6d5a]={activeTab === 'editor'}
			>
				Editor
			</button>
			<button
				onclick={() => activeTab = 'executions'}
				class="px-3 py-2 text-sm"
				class:text-[#ff6d5a]={activeTab === 'executions'}
				class:border-b-2={activeTab === 'executions'}
				class:border-[#ff6d5a]={activeTab === 'executions'}
			>
				Executions
			</button>
			<div class="flex-1"></div>
			<button
				onclick={handleExecute}
				class="my-1 rounded bg-green-500 px-3 py-1 text-xs font-medium text-white hover:bg-green-600"
			>
				▶ Execute
			</button>
			<button
				onclick={() => nodeSelectorOpen = !nodeSelectorOpen}
				class="my-1 ml-2 rounded border border-gray-200 px-3 py-1 text-xs dark:border-[#3a3a5c]"
			>
				+ Add Node
			</button>
		</div>

		<!-- Content -->
		<div class="relative flex-1">
			{#if activeTab === 'editor'}
				<WorkflowCanvas />
				<NodeSelector bind:open={nodeSelectorOpen} />
				{#if nodePanelStore.selectedNode}
					<NodeConfigPanel />
				{/if}
			{:else}
				<div class="p-6 text-sm text-gray-500">
					Workflow executions will appear here.
				</div>
			{/if}
		</div>
	</div>
{/if}
