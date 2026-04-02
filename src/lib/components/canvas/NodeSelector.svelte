<script lang="ts">
	import { nodeRegistry } from '$lib/core/node-registry';
	import { canvasStore } from '$lib/stores/canvas.svelte';
	import SearchInput from '$lib/components/common/SearchInput.svelte';
	import type { NodeCategory, NodeTypeDefinition } from '$lib/types';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let searchQuery = $state('');

	const categories: NodeCategory[] = [
		'Advanced AI',
		'Actions in an App',
		'Data transformation',
		'Flow',
		'Core',
		'Human in the loop',
	] as NodeCategory[];

	const groupedNodes = $derived.by(() => {
		const groups: Record<string, NodeTypeDefinition[]> = {};
		for (const cat of categories) {
			let nodes = nodeRegistry.getByCategory(cat);
			if (searchQuery) {
				const q = searchQuery.toLowerCase();
				nodes = nodes.filter(
					(n) => n.displayName.toLowerCase().includes(q) || n.type.toLowerCase().includes(q)
				);
			}
			if (nodes.length > 0) groups[cat] = nodes;
		}
		// Also include search results not in known categories
		if (searchQuery) {
			const searchResults = nodeRegistry.search(searchQuery);
			const knownTypes = new Set(Object.values(groups).flat().map((n) => n.type));
			const uncategorized = searchResults.filter((n) => !knownTypes.has(n.type));
			if (uncategorized.length > 0) groups['Other'] = uncategorized;
		}
		return groups;
	});

	function addNode(def: NodeTypeDefinition) {
		canvasStore.addNode(def.type, { x: 300, y: 300 });
		open = false;
	}
</script>

{#if open}
	<div class="absolute right-0 top-0 z-20 flex h-full w-80 flex-col border-l border-gray-200 bg-white shadow-lg dark:border-[#3a3a5c] dark:bg-[#1a1a2e]">
		<div class="flex items-center justify-between border-b border-gray-200 p-3 dark:border-[#3a3a5c]">
			<span class="text-sm font-medium">Add Node</span>
			<button onclick={() => open = false} class="text-gray-400 hover:text-gray-600">✕</button>
		</div>

		<div class="p-3">
			<SearchInput placeholder="Search nodes..." onchange={(v) => searchQuery = v} />
		</div>

		<div class="flex-1 overflow-y-auto px-3 pb-3">
			{#each Object.entries(groupedNodes) as [category, nodes]}
				<details open class="mb-2">
					<summary class="cursor-pointer py-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
						{category} ({nodes.length})
					</summary>
					<div class="space-y-1 pl-2">
						{#each nodes as def}
							<button
								onclick={() => addNode(def)}
								class="flex w-full items-center gap-2 rounded p-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-[#3a3a5c]"
							>
								<span>{def.icon ?? '⚙️'}</span>
								<div>
									<div class="font-medium">{def.displayName}</div>
									<div class="text-xs text-gray-400">{def.type.split('.').pop()}</div>
								</div>
							</button>
						{/each}
					</div>
				</details>
			{/each}
		</div>
	</div>
{/if}
