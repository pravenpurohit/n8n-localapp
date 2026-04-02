<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import LoadMore from '$lib/components/common/LoadMore.svelte';
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';
	import { dataTablesStore } from '$lib/stores/data-tables.svelte';
	import { createDataTable, deleteDataTable } from '$lib/api/data-tables';

	let showCreate = $state(false);
	let newName = $state('');
	let confirmDelete = $state(false);
	let deleteTargetId = $state('');

	onMount(() => dataTablesStore.load());

	async function handleCreate() {
		if (!newName.trim()) return;
		await createDataTable(newName.trim());
		newName = '';
		showCreate = false;
		await dataTablesStore.load();
	}

	async function handleDelete() {
		await deleteDataTable(deleteTargetId);
		await dataTablesStore.load();
	}
</script>

<div class="p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-semibold">Data Tables</h1>
		<button
			onclick={() => showCreate = true}
			class="rounded-lg bg-[#ff6d5a] px-4 py-2 text-sm font-medium text-white hover:bg-[#e55a48]"
		>
			Create Data Table
		</button>
	</div>

	{#if showCreate}
		<div class="mb-4 flex gap-2">
			<input
				bind:value={newName}
				placeholder="Table name"
				class="flex-1 rounded border border-gray-200 px-3 py-2 text-sm dark:border-[#3a3a5c] dark:bg-[#252547]"
			/>
			<button onclick={handleCreate} class="rounded bg-[#ff6d5a] px-4 py-2 text-sm text-white">Create</button>
			<button onclick={() => showCreate = false} class="rounded px-4 py-2 text-sm text-gray-500">Cancel</button>
		</div>
	{/if}

	<div class="space-y-1">
		{#each dataTablesStore.list.items as table}
			<div class="flex items-center gap-4 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-[#3a3a5c]/50">
				<button onclick={() => goto(`/data-tables/${table.id}`)} class="flex-1 text-left">
					<div class="text-sm font-medium">{table.name}</div>
				</button>
				<button
					onclick={() => { deleteTargetId = table.id; confirmDelete = true; }}
					class="text-xs text-red-500 hover:underline"
				>
					Delete
				</button>
			</div>
		{/each}
	</div>

	<LoadMore
		loading={dataTablesStore.list.loading}
		hasMore={dataTablesStore.list.hasMore}
		onclick={() => dataTablesStore.loadMore()}
	/>
</div>

<ConfirmDialog bind:open={confirmDelete} title="Delete Data Table" message="This will permanently delete this data table." confirmLabel="Delete" onconfirm={handleDelete} />
