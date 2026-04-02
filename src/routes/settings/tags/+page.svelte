<script lang="ts">
	import { onMount } from 'svelte';
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';
	import { tagsStore } from '$lib/stores/tags.svelte';

	let newTagName = $state('');
	let editingId = $state<string | null>(null);
	let editingName = $state('');
	let confirmDelete = $state(false);
	let deleteTargetId = $state('');

	onMount(() => tagsStore.load());

	async function handleCreate() {
		if (!newTagName.trim()) return;
		await tagsStore.create(newTagName.trim());
		newTagName = '';
	}

	function startEdit(id: string, name: string) {
		editingId = id;
		editingName = name;
	}

	async function finishEdit() {
		if (editingId && editingName.trim()) {
			await tagsStore.update(editingId, editingName.trim());
		}
		editingId = null;
	}

	async function handleDelete() {
		await tagsStore.remove(deleteTargetId);
	}
</script>

<div class="p-6">
	<h1 class="mb-6 text-2xl font-semibold">Tags</h1>

	<div class="mb-4 flex gap-2">
		<input
			bind:value={newTagName}
			placeholder="New tag name"
			onkeydown={(e) => e.key === 'Enter' && handleCreate()}
			class="flex-1 rounded border border-gray-200 px-3 py-2 text-sm dark:border-[#3a3a5c] dark:bg-[#252547]"
		/>
		<button onclick={handleCreate} class="rounded bg-[#ff6d5a] px-4 py-2 text-sm text-white">Create</button>
	</div>

	<div class="space-y-1">
		{#each tagsStore.tags as tag}
			<div class="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-[#3a3a5c]/50">
				{#if editingId === tag.id}
					<input
						bind:value={editingName}
						onblur={finishEdit}
						onkeydown={(e) => e.key === 'Enter' && finishEdit()}
						class="flex-1 rounded border border-gray-200 px-2 py-1 text-sm dark:border-[#3a3a5c] dark:bg-[#252547]"
						autofocus
					/>
				{:else}
					<span class="flex-1 text-sm">{tag.name}</span>
					<button onclick={() => startEdit(tag.id, tag.name)} class="text-xs text-blue-500 hover:underline">Edit</button>
					<button onclick={() => { deleteTargetId = tag.id; confirmDelete = true; }} class="text-xs text-red-500 hover:underline">Delete</button>
				{/if}
			</div>
		{/each}
	</div>
</div>

<ConfirmDialog bind:open={confirmDelete} title="Delete Tag" message="This will remove the tag from all workflows." confirmLabel="Delete" onconfirm={handleDelete} />
