<script lang="ts">
	import Sidebar from './Sidebar.svelte';
	import ConnectionBanner from '$lib/components/common/ConnectionBanner.svelte';
	import { connectionStore } from '$lib/stores/connection.svelte';
	import { notificationStore } from '$lib/stores/notifications.svelte';

	let { children } = $props<{ children: import('svelte').Snippet }>();

	const severityStyles: Record<string, { bg: string; border: string; icon: string }> = {
		error: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: '❌' },
		warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', icon: '⚠️' },
		info: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', icon: 'ℹ️' },
		success: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', icon: '✅' },
	};
</script>

<div class="flex h-screen w-screen overflow-hidden bg-white text-gray-800 dark:bg-[#1a1a2e] dark:text-gray-200">
	{#if !connectionStore.isConnected && connectionStore.status === 'disconnected'}
		<ConnectionBanner />
	{/if}

	<Sidebar />

	<main class="flex-1 overflow-auto">
		{@render children()}
	</main>

	<!-- Notification toast stack -->
	{#if notificationStore.notifications.length > 0}
		<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
			{#each notificationStore.notifications as notif (notif.id)}
				{@const style = severityStyles[notif.severity] || severityStyles.info}
				<div class="rounded-lg border p-4 shadow-lg {style.bg} {style.border}">
					<div class="flex items-start gap-3">
						<span class="text-lg">{style.icon}</span>
						<div class="flex-1 min-w-0">
							<div class="text-sm font-medium">{notif.title}</div>
							<div class="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</div>
						</div>
						<button
							onclick={() => notificationStore.dismiss(notif.id)}
							class="text-gray-400 hover:text-gray-600 text-sm"
						>✕</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
