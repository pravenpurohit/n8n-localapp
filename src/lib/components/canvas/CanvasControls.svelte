<script lang="ts">
	import { useReactFlow } from '@xyflow/svelte';

	const { fitView, zoomIn, zoomOut, setViewport } = useReactFlow();

	function resetZoom() {
		setViewport({ x: 0, y: 0, zoom: 1 });
	}
</script>

<div class="absolute bottom-4 left-4 z-10 flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow dark:border-[#3a3a5c] dark:bg-[#252547]">
	<button onclick={() => fitView()} class="rounded p-2 text-sm hover:bg-gray-100 dark:hover:bg-[#3a3a5c]" title="Fit view">⊞</button>
	<button onclick={() => zoomIn()} class="rounded p-2 text-sm hover:bg-gray-100 dark:hover:bg-[#3a3a5c]" title="Zoom in">+</button>
	<button onclick={() => zoomOut()} class="rounded p-2 text-sm hover:bg-gray-100 dark:hover:bg-[#3a3a5c]" title="Zoom out">−</button>
	<button onclick={resetZoom} class="rounded p-2 text-sm hover:bg-gray-100 dark:hover:bg-[#3a3a5c]" title="Reset zoom">↺</button>
</div>
