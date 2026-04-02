<script lang="ts">
	import type { Node as SvelteFlowNode } from '@xyflow/svelte';
	import { canvasStore } from '$lib/stores/canvas.svelte';

	let { node }: { node: SvelteFlowNode } = $props();

	const settings = [
		{ key: 'retryOnFail', label: 'Retry on Fail' },
		{ key: 'continueOnFail', label: 'Continue on Fail' },
		{ key: 'alwaysOutputData', label: 'Always Output Data' },
		{ key: 'executeOnce', label: 'Execute Once' },
	];

	function toggle(key: string) {
		const current = !!(node.data[key] as boolean);
		node.data = { ...node.data, [key]: !current };
		canvasStore.markDirty();
	}
</script>

<div class="space-y-3">
	{#each settings as setting}
		<label class="flex items-center justify-between">
			<span class="text-sm">{setting.label}</span>
			<input
				type="checkbox"
				checked={!!(node.data[setting.key] as boolean)}
				onchange={() => toggle(setting.key)}
				class="rounded"
			/>
		</label>
	{/each}
</div>
