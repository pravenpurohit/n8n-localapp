<script lang="ts">
	import type { Node as SvelteFlowNode } from '@xyflow/svelte';

	let { node, mode }: { node: SvelteFlowNode; mode: 'input' | 'output' } = $props();

	let viewMode = $state<'table' | 'json' | 'schema'>('table');

	const rawData = $derived(node.data[`${mode}Data`] as unknown[] | undefined);
	const items = $derived(Array.isArray(rawData) ? rawData : rawData ? [rawData] : []);
	const hasData = $derived(items.length > 0);

	// Extract all unique keys for table columns
	const columns = $derived.by(() => {
		const keys = new Set<string>();
		for (const item of items) {
			if (item && typeof item === 'object') {
				for (const key of Object.keys(item as Record<string, unknown>)) keys.add(key);
			}
		}
		return [...keys];
	});

	// Build schema tree
	const schema = $derived.by(() => {
		if (items.length === 0) return [];
		const first = items[0] as Record<string, unknown>;
		if (!first || typeof first !== 'object') return [];
		return Object.entries(first).map(([key, value]) => ({
			key,
			type: Array.isArray(value) ? 'array' : typeof value,
			value: typeof value === 'object' ? JSON.stringify(value).slice(0, 100) : String(value).slice(0, 100),
		}));
	});
</script>

<div>
	{#if hasData}
		<!-- View mode tabs -->
		<div class="mb-3 flex gap-1 border-b border-gray-200 dark:border-[#3a3a5c]">
			{#each ['table', 'json', 'schema'] as vm}
				<button
					onclick={() => viewMode = vm as typeof viewMode}
					class="px-3 py-1 text-xs font-medium capitalize"
					class:text-[#ff6d5a]={viewMode === vm}
					class:border-b-2={viewMode === vm}
					class:border-[#ff6d5a]={viewMode === vm}
					class:text-gray-500={viewMode !== vm}
				>
					{vm}
				</button>
			{/each}
			<span class="ml-auto text-xs text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
		</div>

		{#if viewMode === 'table'}
			<!-- Table view -->
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead>
						<tr class="border-b border-gray-200 dark:border-[#3a3a5c]">
							<th class="px-2 py-1 font-medium text-gray-500">#</th>
							{#each columns as col}
								<th class="px-2 py-1 font-medium text-gray-500">{col}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each items as item, i}
							<tr class="border-b border-gray-100 dark:border-[#3a3a5c]">
								<td class="px-2 py-1 text-gray-400">{i}</td>
								{#each columns as col}
									<td class="max-w-48 truncate px-2 py-1">
										{#if typeof (item as any)?.[col] === 'object'}
											<span class="text-gray-400">{JSON.stringify((item as any)[col]).slice(0, 80)}</span>
										{:else}
											{String((item as any)?.[col] ?? '')}
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

		{:else if viewMode === 'json'}
			<!-- JSON view -->
			<pre class="overflow-auto rounded bg-gray-50 p-3 text-xs dark:bg-[#252547]">{JSON.stringify(items, null, 2)}</pre>

		{:else}
			<!-- Schema view -->
			<div class="space-y-1">
				{#each schema as field}
					<div class="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-[#3a3a5c]">
						<span class="rounded bg-blue-100 px-1 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">{field.type}</span>
						<span class="font-medium">{field.key}</span>
						<span class="ml-auto truncate text-gray-400 max-w-32">{field.value}</span>
					</div>
				{/each}
			</div>
		{/if}

	{:else}
		<div class="flex flex-col items-center justify-center py-8 text-center">
			<span class="mb-2 text-2xl text-gray-300">📭</span>
			<p class="text-sm text-gray-400">No execution data</p>
			<p class="text-xs text-gray-400">Execute the workflow to see {mode} data</p>
		</div>
	{/if}
</div>
