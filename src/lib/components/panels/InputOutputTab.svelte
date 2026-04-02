<script lang="ts">
	import type { Node as SvelteFlowNode } from '@xyflow/svelte';

	let { node, mode }: { node: SvelteFlowNode; mode: 'input' | 'output' } = $props();

	// Execution data would be populated after running the workflow
	const data = $derived(node.data[`${mode}Data`] as unknown);
	const formatted = $derived(data ? JSON.stringify(data, null, 2) : null);
</script>

<div>
	{#if formatted}
		<pre class="overflow-auto rounded bg-gray-50 p-3 text-xs dark:bg-[#252547]">{formatted}</pre>
	{:else}
		<div class="flex flex-col items-center justify-center py-8 text-center">
			<span class="mb-2 text-2xl text-gray-300">📭</span>
			<p class="text-sm text-gray-400">No execution data</p>
			<p class="text-xs text-gray-400">Execute the workflow to see {mode} data</p>
		</div>
	{/if}
</div>
