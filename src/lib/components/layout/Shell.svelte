<script lang="ts">
	import Sidebar from './Sidebar.svelte';
	import ConnectionBanner from '$lib/components/common/ConnectionBanner.svelte';
	import ErrorNotification from '$lib/components/common/ErrorNotification.svelte';
	import { connectionStore } from '$lib/stores/connection.svelte';

	let { children } = $props<{ children: import('svelte').Snippet }>();
</script>

<div class="flex h-screen w-screen overflow-hidden bg-white text-gray-800 dark:bg-[#1a1a2e] dark:text-gray-200">
	{#if !connectionStore.isConnected && connectionStore.status === 'disconnected'}
		<ConnectionBanner />
	{/if}

	<Sidebar />

	<main class="flex-1 overflow-auto">
		{@render children()}
	</main>

	<ErrorNotification />
</div>
