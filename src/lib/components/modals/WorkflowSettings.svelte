<script lang="ts">
	import { canvasStore } from '$lib/stores/canvas.svelte';
	import type { WorkflowSettings } from '$lib/types';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let settings = $state<WorkflowSettings>({ ...canvasStore.workflowSettings });

	function handleSave() {
		canvasStore.workflowSettings = { ...settings };
		canvasStore.markDirty();
		open = false;
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onclick={() => open = false}>
		<div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-[#252547]" onclick|stopPropagation>
			<h2 class="mb-4 text-lg font-semibold">Workflow Settings</h2>

			<div class="max-h-96 space-y-4 overflow-y-auto">
				<div>
					<label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Execution Order</label>
					<select bind:value={settings.executionOrder} class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#1a1a2e]">
						<option value="v1">v1 (recommended)</option>
						<option value="v0">v0 (legacy)</option>
					</select>
				</div>

				<div>
					<label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Error Workflow</label>
					<input bind:value={settings.errorWorkflow} placeholder="Workflow ID" class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#1a1a2e]" />
				</div>

				<div>
					<label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Caller Policy</label>
					<select bind:value={settings.callerPolicy} class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#1a1a2e]">
						<option value="any">Any workflow</option>
						<option value="none">No workflow</option>
						<option value="workflowsFromAList">Specific workflows</option>
					</select>
				</div>

				<div>
					<label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Timezone</label>
					<input bind:value={settings.timezone} placeholder="e.g. America/New_York" class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#1a1a2e]" />
				</div>

				<div class="space-y-2">
					<label class="flex items-center justify-between text-sm">
						<span>Save failed executions</span>
						<select bind:value={settings.saveDataErrorExecution} class="rounded border border-gray-200 px-2 py-1 text-xs dark:border-[#3a3a5c] dark:bg-[#1a1a2e]">
							<option value="all">All</option>
							<option value="none">None</option>
						</select>
					</label>
					<label class="flex items-center justify-between text-sm">
						<span>Save successful executions</span>
						<select bind:value={settings.saveDataSuccessExecution} class="rounded border border-gray-200 px-2 py-1 text-xs dark:border-[#3a3a5c] dark:bg-[#1a1a2e]">
							<option value="all">All</option>
							<option value="none">None</option>
						</select>
					</label>
					<label class="flex items-center justify-between text-sm">
						<span>Save manual executions</span>
						<input type="checkbox" bind:checked={settings.saveManualExecutions} class="rounded" />
					</label>
					<label class="flex items-center justify-between text-sm">
						<span>Save execution progress</span>
						<input type="checkbox" bind:checked={settings.saveExecutionProgress} class="rounded" />
					</label>
				</div>

				<div>
					<label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Timeout (seconds)</label>
					<input type="number" bind:value={settings.executionTimeout} class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#1a1a2e]" />
				</div>
			</div>

			<div class="mt-4 flex justify-end gap-3">
				<button onclick={() => open = false} class="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400">Cancel</button>
				<button onclick={handleSave} class="rounded bg-[#ff6d5a] px-4 py-2 text-sm font-medium text-white hover:bg-[#e55a48]">Save</button>
			</div>
		</div>
	</div>
{/if}
