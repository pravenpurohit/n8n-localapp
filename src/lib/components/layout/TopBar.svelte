<script lang="ts">
	import { canvasStore } from '$lib/stores/canvas.svelte';
	import TagPill from '$lib/components/common/TagPill.svelte';

	let editingName = $state(false);
	let nameInput = $state(canvasStore.workflowName);

	function startEdit() {
		nameInput = canvasStore.workflowName;
		editingName = true;
	}

	function finishEdit() {
		canvasStore.workflowName = nameInput;
		canvasStore.markDirty();
		editingName = false;
	}

	async function handleSave() {
		await canvasStore.saveWorkflow();
	}

	async function toggleActive() {
		if (canvasStore.workflowActive) {
			await canvasStore.deactivateWorkflow();
		} else {
			await canvasStore.activateWorkflow();
		}
	}
</script>

<div class="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-2 dark:border-[#3a3a5c] dark:bg-[#1a1a2e]">
	<!-- Workflow name -->
	{#if editingName}
		<input
			bind:value={nameInput}
			onblur={finishEdit}
			onkeydown={(e) => e.key === 'Enter' && finishEdit()}
			class="rounded border border-gray-300 px-2 py-1 text-sm dark:border-[#3a3a5c] dark:bg-[#252547]"
			autofocus
		/>
	{:else}
		<button onclick={startEdit} class="text-sm font-medium hover:text-[#ff6d5a]">
			{canvasStore.workflowName || 'Untitled Workflow'}
		</button>
	{/if}

	<!-- Tags -->
	<div class="flex gap-1">
		{#each canvasStore.workflowTags as tag}
			<TagPill name={tag.name} />
		{/each}
	</div>

	<div class="flex-1"></div>

	<!-- Actions -->
	<button
		onclick={handleSave}
		disabled={!canvasStore.isDirty}
		class="rounded bg-[#ff6d5a] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#e55a48] disabled:opacity-50"
	>
		Save
	</button>

	<button
		onclick={toggleActive}
		class="rounded border px-3 py-1.5 text-xs font-medium"
		class:border-green-500={canvasStore.workflowActive}
		class:text-green-600={canvasStore.workflowActive}
		class:border-gray-300={!canvasStore.workflowActive}
		class:text-gray-600={!canvasStore.workflowActive}
	>
		{canvasStore.workflowActive ? 'Active' : 'Inactive'}
	</button>

	<button disabled class="rounded border border-gray-200 px-3 py-1.5 text-xs text-gray-400 dark:border-[#3a3a5c]" title="Phase 2">
		Share
	</button>

	<button disabled class="rounded border border-gray-200 px-3 py-1.5 text-xs text-gray-400 dark:border-[#3a3a5c]" title="Phase 2">
		History
	</button>
</div>
