<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import LoadMore from '$lib/components/common/LoadMore.svelte';
	import { dataTablesStore } from '$lib/stores/data-tables.svelte';
	import { addRow, updateRow, deleteRow } from '$lib/api/data-tables';

	let newRowData = $state('{}');
	let loading = $state(true);

	onMount(async () => {
		await dataTablesStore.loadRows($page.params.id);
		loading = false;
	});

	async function handleAddRow() {
		try {
			const data = JSON.parse(newRowData);
			await addRow($page.params.id, data);
			newRowData = '{}';
			await dataTablesStore.loadRows($page.params.id);
		} catch {
			// invalid JSON
		}
	}

	async function handleDeleteRow(rowId: string) {
		await deleteRow($page.params.id, rowId);
		await dataTablesStore.loadRows($page.params.id);
	}
</script>

<div class="p-6">
	<div class="mb-6 flex items-center gap-3">
		<a href="/data-tables" class="text-gray-400 hover:text-gray-600">← Back</a>
		<h1 class="text-2xl font-semibold">Data Table</h1>
	</div>

	{#if loading}
		<p class="text-gray-400">Loading rows...</p>
	{:else}
		<!-- Add row -->
		<div class="mb-4 flex gap-2">
			<input
				bind:value={newRowData}
				placeholder='{"key": "value"}'
				class="flex-1 rounded border border-gray-200 px-3 py-2 font-mono text-sm dark:border-[#3a3a5c] dark:bg-[#252547]"
			/>
			<button onclick={handleAddRow} class="rounded bg-[#ff6d5a] px-4 py-2 text-sm text-white">Add Row</button>
		</div>

		<!-- Rows -->
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead>
					<tr class="border-b border-gray-200 dark:border-[#3a3a5c]">
						<th class="px-4 py-3 font-medium text-gray-500">ID</th>
						<th class="px-4 py-3 font-medium text-gray-500">Data</th>
						<th class="px-4 py-3 font-medium text-gray-500">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each dataTablesStore.rows.items as row}
						<tr class="border-b border-gray-100 dark:border-[#3a3a5c]">
							<td class="px-4 py-3 text-gray-400">{row.id}</td>
							<td class="px-4 py-3 font-mono text-xs">{JSON.stringify(row.data)}</td>
							<td class="px-4 py-3">
								<button onclick={() => handleDeleteRow(row.id)} class="text-xs text-red-500 hover:underline">Delete</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<LoadMore
			loading={dataTablesStore.rows.loading}
			hasMore={dataTablesStore.rows.hasMore}
			onclick={() => dataTablesStore.loadMoreRows()}
		/>
	{/if}
</div>
