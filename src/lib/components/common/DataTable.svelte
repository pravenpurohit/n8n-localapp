<script lang="ts">
	interface Column {
		key: string;
		label: string;
		sortable?: boolean;
	}

	let { columns, rows, onrowclick }: {
		columns: Column[];
		rows: Record<string, unknown>[];
		onrowclick?: (row: Record<string, unknown>) => void;
	} = $props();

	let sortKey = $state<string | null>(null);
	let sortAsc = $state(true);

	function toggleSort(key: string) {
		if (sortKey === key) {
			sortAsc = !sortAsc;
		} else {
			sortKey = key;
			sortAsc = true;
		}
	}

	const sortedRows = $derived.by(() => {
		if (!sortKey) return rows;
		return [...rows].sort((a, b) => {
			const av = String(a[sortKey!] ?? '');
			const bv = String(b[sortKey!] ?? '');
			return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
		});
	});
</script>

<div class="overflow-x-auto">
	<table class="w-full text-left text-sm">
		<thead>
			<tr class="border-b border-gray-200 dark:border-[#3a3a5c]">
				{#each columns as col}
					<th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
						{#if col.sortable}
							<button onclick={() => toggleSort(col.key)} class="hover:text-gray-700 dark:hover:text-gray-200">
								{col.label} {sortKey === col.key ? (sortAsc ? '↑' : '↓') : ''}
							</button>
						{:else}
							{col.label}
						{/if}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each sortedRows as row}
				<tr
					class="border-b border-gray-100 hover:bg-gray-50 dark:border-[#3a3a5c] dark:hover:bg-[#3a3a5c]/50"
					class:cursor-pointer={!!onrowclick}
					onclick={() => onrowclick?.(row)}
				>
					{#each columns as col}
						<td class="px-4 py-3">{row[col.key] ?? ''}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
