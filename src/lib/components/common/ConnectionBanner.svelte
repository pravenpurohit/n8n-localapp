<script lang="ts">
	import { connectionStore } from '$lib/stores/connection.svelte';
</script>

{#if connectionStore.status === 'disconnected'}
	<div class="fixed left-0 right-0 top-0 z-40 bg-red-500 px-4 py-2 text-center text-sm text-white">
		n8n instance unreachable. Retrying... (attempt {connectionStore.retryCount})
	</div>
{/if}
