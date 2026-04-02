<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Shell from '$lib/components/layout/Shell.svelte';
	import { appStore } from '$lib/stores/app.svelte';

	let { children }: { children: Snippet } = $props();
	let loading = $state(true);

	onMount(async () => {
		try {
			await appStore.initialize();
		} catch {
			goto('/error');
		} finally {
			loading = false;
		}
	});
</script>

{#if loading}
	<div class="flex h-screen w-screen items-center justify-center bg-white dark:bg-[#1a1a2e]">
		<div class="text-center">
			<div class="mb-4 text-4xl">⚡</div>
			<p class="text-gray-500 dark:text-gray-400">Connecting to n8n...</p>
		</div>
	</div>
{:else if appStore.error}
	{@render children()}
{:else}
	<Shell {children} />
{/if}
