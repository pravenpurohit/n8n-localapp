<script lang="ts">
	import { goto } from '$app/navigation';
	import { parseWorkflowJson } from '$lib/core/workflow-parser';
	import { createWorkflow } from '$lib/api/workflows';
	import { canvasStore } from '$lib/stores/canvas.svelte';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let importJson = $state('');
	let importError = $state<string | null>(null);
	let activeTab = $state<'import' | 'export'>('import');

	async function handleImport() {
		importError = null;
		try {
			const { workflow } = parseWorkflowJson(importJson);
			const created = await createWorkflow({
				name: workflow.name,
				nodes: workflow.nodes,
				connections: workflow.connections,
				settings: workflow.settings,
			});
			open = false;
			goto(`/workflows/${created.id}`);
		} catch (err) {
			importError = err instanceof Error ? err.message : String(err);
		}
	}

	function handleExport() {
		const json = JSON.stringify({
			name: canvasStore.workflowName,
			nodes: canvasStore.nodes.map((n) => n.data),
			connections: {},
			settings: canvasStore.workflowSettings,
		}, null, 2);

		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${canvasStore.workflowName || 'workflow'}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onclick={() => open = false}>
		<div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-[#252547]" onclick|stopPropagation>
			<div class="mb-4 flex gap-2">
				<button onclick={() => activeTab = 'import'} class="text-sm font-medium" class:text-[#ff6d5a]={activeTab === 'import'}>Import</button>
				<button onclick={() => activeTab = 'export'} class="text-sm font-medium" class:text-[#ff6d5a]={activeTab === 'export'}>Export</button>
			</div>

			{#if activeTab === 'import'}
				<textarea
					bind:value={importJson}
					placeholder="Paste workflow JSON here..."
					class="mb-3 h-48 w-full rounded border border-gray-200 p-3 font-mono text-xs dark:border-[#3a3a5c] dark:bg-[#1a1a2e]"
				></textarea>
				{#if importError}
					<p class="mb-3 text-xs text-red-500">{importError}</p>
				{/if}
				<button onclick={handleImport} class="rounded bg-[#ff6d5a] px-4 py-2 text-sm text-white">Import</button>
			{:else}
				<p class="mb-3 text-sm text-gray-500">Download the current workflow as JSON.</p>
				<button onclick={handleExport} class="rounded bg-[#ff6d5a] px-4 py-2 text-sm text-white">Download JSON</button>
			{/if}
		</div>
	</div>
{/if}
