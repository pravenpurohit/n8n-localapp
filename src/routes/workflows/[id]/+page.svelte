<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { beforeNavigate } from '$app/navigation';
	import TopBar from '$lib/components/layout/TopBar.svelte';
	import WorkflowCanvas from '$lib/components/canvas/WorkflowCanvas.svelte';
	import NodeSelector from '$lib/components/canvas/NodeSelector.svelte';
	import NodeConfigPanel from '$lib/components/panels/NodeConfigPanel.svelte';
	import StatusBadge from '$lib/components/common/StatusBadge.svelte';
	import { canvasStore } from '$lib/stores/canvas.svelte';
	import { nodePanelStore } from '$lib/stores/node-panel.svelte';
	import { notificationStore } from '$lib/stores/notifications.svelte';
	import { getExecution, listExecutions } from '$lib/api/executions';
	import { apiClient } from '$lib/api/client';
	import { formatRelativeTime } from '$lib/utils/format';
	import { logger } from '$lib/core/logger';
	import type { Execution } from '$lib/types';

	let activeTab = $state<'editor' | 'executions'>('editor');
	let nodeSelectorOpen = $state(false);
	let loading = $state(true);
	let executing = $state(false);
	let pollingInterval: ReturnType<typeof setInterval> | null = null;
	let pollDelay = 1000;
	let workflowExecutions = $state<Execution[]>([]);

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
			await loadExecutions();
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

	async function loadExecutions() {
		if (!canvasStore.workflowId) return;
		try {
			const result = await listExecutions({ workflowId: canvasStore.workflowId });
			workflowExecutions = result.data;
		} catch { /* ignore */ }
	}

	async function handleExecute() {
		executing = true;
		// F2.3: Set all nodes to 'running' immediately
		const statusMap = new Map<string, 'success' | 'error' | 'running'>();
		for (const node of canvasStore.nodes) {
			if (node.type !== 'stickyNote') statusMap.set(node.data.label as string, 'running');
		}
		canvasStore.executionStatus = statusMap;

		const execId = await canvasStore.executeWorkflow();
		if (execId) {
			pollDelay = 1000;
			startPolling(execId);
		} else {
			executing = false;
			canvasStore.executionStatus = new Map();
		}
	}

	function startPolling(executionId: string) {
		const startTime = Date.now();

		async function poll() {
			if (Date.now() - startTime > 300_000) {
				stopPolling();
				executing = false;
				logger.warn('canvas-page', 'Execution polling timeout');
				notificationStore.add('warning', 'Execution Timeout', 'Execution polling timed out after 5 minutes.');
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
					// Mark remaining nodes as still running
					for (const node of canvasStore.nodes) {
						const name = node.data.label as string;
						if (!statusMap.has(name) && node.type !== 'stickyNote') {
							statusMap.set(name, 'running');
						}
					}
					canvasStore.executionStatus = statusMap;
				}
				if (['success', 'error', 'canceled'].includes(exec.status)) {
					stopPolling();
					executing = false;

					// F2.1: Fetch full execution data and populate node I/O
					await populateNodeExecutionData(executionId);
					await loadExecutions();

					if (exec.status === 'success') {
						notificationStore.add('success', 'Execution Complete', 'Workflow executed successfully.');
					} else if (exec.status === 'error') {
						const errorMsg = exec.data?.resultData?.error?.message || 'Workflow execution failed. Check node outputs for details.';
						notificationStore.addError(errorMsg);
					}
					return; // Don't schedule next poll
				}
			} catch {
				// continue polling
			}
			// F7.1: Exponential backoff — 1s, 2s, 4s, 8s, cap at 10s
			pollDelay = Math.min(pollDelay * 2, 10000);
			pollingInterval = setTimeout(poll, pollDelay) as any;
		}

		pollingInterval = setTimeout(poll, pollDelay) as any;
	}

	/** F2.1: Fetch full execution data via internal API and populate node I/O tabs */
	async function populateNodeExecutionData(executionId: string) {
		try {
			const fullExec = await apiClient.requestInternal<any>(
				'GET', `/rest/executions/${executionId}?includeData=true`
			);
			const dataStr = fullExec.data?.data;
			if (!dataStr) return;

			// n8n stores execution data in flatted format — try to parse runData
			let runData: Record<string, any[]> = {};
			if (typeof dataStr === 'string') {
				try {
					// Simple extraction: look for runData in the serialized format
					const parsed = JSON.parse(dataStr);
					// Flatted format — runData is referenced by index
					if (Array.isArray(parsed) && parsed[0]?.resultData) {
						const resultIdx = parsed[0].resultData;
						if (typeof resultIdx === 'string' && parsed[parseInt(resultIdx)]) {
							const resultData = parsed[parseInt(resultIdx)];
							if (resultData.runData) {
								const runDataIdx = resultData.runData;
								if (typeof runDataIdx === 'string' && parsed[parseInt(runDataIdx)]) {
									runData = parsed[parseInt(runDataIdx)];
								}
							}
						}
					}
				} catch { /* flatted parsing is best-effort */ }
			} else if (dataStr?.resultData?.runData) {
				runData = dataStr.resultData.runData;
			}

			// Populate node data with execution results
			if (Object.keys(runData).length > 0) {
				const updatedNodes = canvasStore.nodes.map(node => {
					const nodeName = node.data.label as string;
					const nodeResults = runData[nodeName];
					if (nodeResults && Array.isArray(nodeResults) && nodeResults.length > 0) {
						const last = nodeResults[nodeResults.length - 1];
						const outputData = last?.data?.main?.[0] || [];
						const inputData = last?.inputData?.main?.[0] || [];
						return {
							...node,
							data: {
								...node.data,
								outputData: outputData.map((item: any) => item?.json || item),
								inputData: inputData.map((item: any) => item?.json || item),
							}
						};
					}
					return node;
				});
				canvasStore.nodes = updatedNodes;
			}
		} catch (err) {
			logger.debug('canvas-page', 'Could not fetch execution data', { error: String(err) });
		}
	}

	function stopPolling() {
		if (pollingInterval) {
			clearTimeout(pollingInterval as any);
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
				onclick={() => { activeTab = 'executions'; loadExecutions(); }}
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
				disabled={executing}
				class="my-1 rounded bg-green-500 px-3 py-1 text-xs font-medium text-white hover:bg-green-600 disabled:opacity-50"
			>
				{executing ? '⟳ Running...' : '▶ Execute'}
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
				<!-- F2.2: Wire the per-workflow Executions tab -->
				<div class="p-6">
					<h2 class="mb-4 text-lg font-semibold">Executions</h2>
					{#if workflowExecutions.length === 0}
						<p class="text-sm text-gray-400">No executions yet. Click Execute to run this workflow.</p>
					{:else}
						<div class="space-y-2">
							{#each workflowExecutions as exec}
								<div class="flex items-center gap-4 rounded-lg border border-gray-200 p-3 dark:border-[#3a3a5c]">
									<StatusBadge status={exec.status} />
									<div class="flex-1">
										<span class="text-sm font-medium">#{exec.id}</span>
										<span class="ml-2 text-xs text-gray-400">{formatRelativeTime(exec.startedAt)}</span>
									</div>
									<span class="text-xs text-gray-400">{exec.mode}</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}
