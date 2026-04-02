<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import { canvasStore } from '$lib/stores/canvas.svelte';

	let { id, data } = $props<{ id: string; data: Record<string, unknown> }>();

	const label = $derived((data.label as string) ?? 'Trigger');
	const icon = $derived((data.icon as string) ?? '⚡');
	const execStatus = $derived(canvasStore.executionStatus.get(id));
</script>

<div
	class="relative rounded-lg border-2 border-[#ff6d5a] bg-white px-4 py-3 shadow-sm dark:bg-[#252547]"
	class:border-green-400={execStatus === 'success'}
	class:border-red-400={execStatus === 'error'}
>
	<div class="flex items-center gap-2">
		<span class="text-lg">{icon}</span>
		<span class="text-xs text-[#ff6d5a]">⚡</span>
		<span class="text-sm font-medium">{label}</span>
		{#if execStatus === 'success'}
			<span class="text-green-500">✓</span>
		{:else if execStatus === 'error'}
			<span class="text-red-500">✗</span>
		{/if}
	</div>

	<!-- No input handle — triggers are entry points -->
	<Handle type="source" position={Position.Right} />
</div>
