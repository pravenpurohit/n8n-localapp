<script lang="ts">
	import { canvasStore } from '$lib/stores/canvas.svelte';

	let { id, data } = $props<{ id: string; data: Record<string, unknown> }>();

	let text = $state((data.text as string) ?? '');

	function handleInput(e: Event) {
		text = (e.target as HTMLTextAreaElement).value;
		// Persist text back to node data so it survives save
		data.text = text;
		canvasStore.markDirty();
	}
</script>

<div class="rounded border border-yellow-300 bg-yellow-50 p-3 shadow-sm dark:border-yellow-700 dark:bg-yellow-900/20" style="min-width: 150px; min-height: 100px;">
	<textarea
		value={text}
		oninput={handleInput}
		placeholder="Add a note..."
		class="h-full w-full resize-none bg-transparent text-sm outline-none"
	></textarea>
</div>
