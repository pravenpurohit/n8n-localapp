<script lang="ts">
	import { runAudit } from '$lib/api/audit';

	let results = $state<Record<string, unknown> | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function handleAudit() {
		loading = true;
		error = null;
		try {
			results = await runAudit();
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			loading = false;
		}
	}
</script>

<div class="p-6">
	<h1 class="mb-6 text-2xl font-semibold">Security Audit</h1>

	<button
		onclick={handleAudit}
		disabled={loading}
		class="mb-6 rounded bg-[#ff6d5a] px-4 py-2 text-sm font-medium text-white hover:bg-[#e55a48] disabled:opacity-50"
	>
		{loading ? 'Running Audit...' : 'Run Security Audit'}
	</button>

	{#if error}
		<div class="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
			{error}
		</div>
	{/if}

	{#if results}
		<pre class="overflow-auto rounded bg-gray-50 p-4 text-xs dark:bg-[#252547]">{JSON.stringify(results, null, 2)}</pre>
	{/if}
</div>
