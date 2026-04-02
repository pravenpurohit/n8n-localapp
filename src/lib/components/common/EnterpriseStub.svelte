<script lang="ts">
	let { title, description = 'This feature requires an enterprise license.' }: {
		title: string;
		description?: string;
	} = $props();
</script>

<div class="flex h-full items-center justify-center p-6">
	<div class="max-w-md text-center">
		<span class="mb-4 inline-block text-5xl">🔒</span>
		<h1 class="mb-2 text-xl font-semibold">{title}</h1>
		<p class="text-sm text-gray-500 dark:text-gray-400">{description}</p>
	</div>
</div>
