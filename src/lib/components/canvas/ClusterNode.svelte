<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import { canvasStore } from '$lib/stores/canvas.svelte';

	let { id, data } = $props<{ id: string; data: Record<string, unknown> }>();

	const label = $derived((data.label as string) ?? 'AI Node');
	const icon = $derived((data.icon as string) ?? '🤖');
	const execStatus = $derived(canvasStore.executionStatus.get(id));

	const aiPorts = ['ai_languageModel', 'ai_outputParser', 'ai_agent', 'ai_memory', 'ai_tool', 'ai_vectorStore', 'ai_embedding'];
</script>

<div
	class="relative rounded-lg border-2 border-purple-400 bg-white px-4 py-3 shadow-sm dark:bg-[#252547]"
	class:border-green-400={execStatus === 'success'}
	class:border-red-400={execStatus === 'error'}
>
	<Handle type="target" position={Position.Left} />

	<div class="flex items-center gap-2">
		<span class="text-lg">{icon}</span>
		<span class="text-sm font-medium">{label}</span>
		<span class="rounded bg-purple-100 px-1 text-xs text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">AI</span>
	</div>

	<Handle type="source" position={Position.Right} />

	<!-- AI sub-connection ports at bottom -->
	{#each aiPorts as port, i}
		<Handle
			type="target"
			position={Position.Bottom}
			id={`${port}-0`}
			style="left: {((i + 1) / (aiPorts.length + 1)) * 100}%"
		/>
	{/each}
</div>
