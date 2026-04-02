<script lang="ts">
	import { appStore } from '$lib/stores/app.svelte';
</script>

<div class="flex h-screen w-screen items-center justify-center bg-white dark:bg-[#1a1a2e]">
	<div class="max-w-md rounded-lg border border-red-200 bg-red-50 p-8 dark:border-red-800 dark:bg-red-900/20">
		<h1 class="mb-4 text-xl font-semibold text-red-700 dark:text-red-400">Connection Error</h1>
		<p class="mb-4 text-sm text-red-600 dark:text-red-300">
			{appStore.error ?? 'Could not connect to n8n instance.'}
		</p>
		<div class="rounded bg-gray-100 p-4 dark:bg-[#252547]">
			<p class="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
				Create a <code>.env</code> file in the app directory:
			</p>
			<pre class="text-xs text-gray-700 dark:text-gray-300">N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your-api-key-here
DEBUG=false</pre>
		</div>
		<button
			onclick={() => window.location.reload()}
			class="mt-4 rounded bg-[#ff6d5a] px-4 py-2 text-sm font-medium text-white hover:bg-[#e55a48]"
		>
			Retry Connection
		</button>
	</div>
</div>
