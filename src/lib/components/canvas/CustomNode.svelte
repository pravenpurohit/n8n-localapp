<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import { canvasStore } from '$lib/stores/canvas.svelte';

	let { id, data } = $props<{ id: string; data: Record<string, unknown> }>();

	const label = $derived((data.label as string) ?? 'Node');
	const icon = $derived((data.icon as string) ?? '⚙️');
	const disabled = $derived((data.disabled as boolean) ?? false);
	const execStatus = $derived(canvasStore.executionStatus.get(label));
	const outputItems = $derived(Array.isArray(data.outputData) ? (data.outputData as unknown[]).length : 0);

	let hovered = $state(false);

	function handleDelete() {
		canvasStore.removeNode(id);
	}

	function toggleDisabled() {
		data.disabled = !disabled;
		canvasStore.markDirty();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="relative rounded-lg border-2 bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md dark:bg-[#252547]"
	class:border-gray-200={!execStatus && !disabled}
	class:border-green-400={execStatus === 'success'}
	class:border-red-400={execStatus === 'error'}
	class:border-yellow-400={execStatus === 'running'}
	class:border-dashed={disabled}
	class:opacity-50={disabled}
	onmouseenter={() => hovered = true}
	onmouseleave={() => hovered = false}
>
	<Handle type="target" position={Position.Left} />

	<div class="flex items-center gap-2">
		<span class="text-lg">{icon}</span>
		<span class="text-sm font-medium">{label}</span>
		{#if disabled}
			<span class="text-xs text-gray-400">(disabled)</span>
		{/if}
		{#if execStatus === 'success'}
			<span class="text-green-500">✓</span>
		{:else if execStatus === 'error'}
			<span class="text-red-500">✗</span>
		{:else if execStatus === 'running'}
			<span class="animate-spin text-yellow-500">⟳</span>
		{/if}
	</div>

	<!-- Output item count badge -->
	{#if outputItems > 0}
		<div class="absolute -bottom-2 right-2 rounded-full bg-gray-200 px-1.5 text-xs text-gray-600 dark:bg-[#3a3a5c] dark:text-gray-300">
			{outputItems} item{outputItems !== 1 ? 's' : ''}
		</div>
	{/if}

	{#if hovered}
		<div class="absolute -top-8 right-0 flex gap-1 rounded bg-white p-1 shadow dark:bg-[#252547]">
			<button onclick={toggleDisabled} class="rounded p-1 text-xs hover:bg-gray-100 dark:hover:bg-[#3a3a5c]" title={disabled ? 'Enable' : 'Disable'}>
				{disabled ? '⚡' : '⏸'}
			</button>
			<button onclick={handleDelete} class="rounded p-1 text-xs hover:bg-red-100 dark:hover:bg-red-900/30" title="Delete">🗑</button>
		</div>
	{/if}

	<Handle type="source" position={Position.Right} />
</div>
