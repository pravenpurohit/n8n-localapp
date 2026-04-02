<script lang="ts">
	let { loading = false, hasMore = false, onclick }: {
		loading?: boolean;
		hasMore?: boolean;
		onclick: () => void;
	} = $props();
</script>

{#if hasMore}
	<div class="flex justify-center py-4">
		<button
			{onclick}
			disabled={loading}
			class="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:border-[#3a3a5c] dark:text-gray-400 dark:hover:bg-[#3a3a5c]"
		>
			{loading ? 'Loading...' : 'Load More'}
		</button>
	</div>
{/if}
