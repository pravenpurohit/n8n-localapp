<script lang="ts">
	import { connectionStore } from '$lib/stores/connection.svelte';
	import { appStore } from '$lib/stores/app.svelte';

	let testing = $state(false);

	async function testConnection() {
		testing = true;
		await connectionStore.checkConnection();
		testing = false;
	}
</script>

<div class="p-6">
	<h1 class="mb-6 text-2xl font-semibold">Connection</h1>

	<div class="max-w-md space-y-6">
		<div>
			<label class="mb-2 block text-sm font-medium">n8n Instance URL</label>
			<p class="rounded bg-gray-50 px-3 py-2 text-sm dark:bg-[#252547]">
				{appStore.config?.n8nBaseUrl ?? 'Not configured'}
			</p>
		</div>

		<div>
			<label class="mb-2 block text-sm font-medium">Status</label>
			<div class="flex items-center gap-2">
				<span
					class="h-3 w-3 rounded-full"
					class:bg-green-500={connectionStore.isConnected}
					class:bg-red-500={!connectionStore.isConnected}
				></span>
				<span class="text-sm">{connectionStore.isConnected ? 'Connected' : 'Disconnected'}</span>
			</div>
		</div>

		<button
			onclick={testConnection}
			disabled={testing}
			class="rounded bg-[#ff6d5a] px-4 py-2 text-sm font-medium text-white hover:bg-[#e55a48] disabled:opacity-50"
		>
			{testing ? 'Testing...' : 'Test Connection'}
		</button>

		<div class="rounded bg-gray-50 p-4 dark:bg-[#252547]">
			<p class="text-xs text-gray-500 dark:text-gray-400">
				To update connection settings, edit the <code>.env</code> file in the app directory and restart.
			</p>
		</div>
	</div>
</div>
