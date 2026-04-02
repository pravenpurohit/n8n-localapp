<script lang="ts">
	import { onMount } from 'svelte';
	import SearchInput from '$lib/components/common/SearchInput.svelte';
	import LoadMore from '$lib/components/common/LoadMore.svelte';
	import { credentialsStore } from '$lib/stores/credentials.svelte';

	let showForm = $state(false);
	let searchQuery = $state('');

	const filtered = $derived.by(() => {
		if (!searchQuery) return credentialsStore.list.items;
		const q = searchQuery.toLowerCase();
		return credentialsStore.list.items.filter(
			(c) => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)
		);
	});

	onMount(() => credentialsStore.load());
</script>

<div class="p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-semibold">Credentials</h1>
		<button
			onclick={() => showForm = true}
			class="rounded-lg bg-[#ff6d5a] px-4 py-2 text-sm font-medium text-white hover:bg-[#e55a48]"
		>
			Create New Credential
		</button>
	</div>

	<div class="mb-4">
		<SearchInput placeholder="Search credentials..." onchange={(v) => searchQuery = v} />
	</div>

	<div class="space-y-1">
		{#each filtered as cred}
			<div class="flex items-center gap-4 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-[#3a3a5c]/50">
				<div class="flex-1">
					<div class="text-sm font-medium">{cred.name}</div>
					<div class="text-xs text-gray-400">{cred.type}</div>
				</div>
			</div>
		{/each}
	</div>

	<LoadMore
		loading={credentialsStore.list.loading}
		hasMore={credentialsStore.list.hasMore}
		onclick={() => credentialsStore.loadMore()}
	/>
</div>

{#if showForm}
	{#await import('$lib/components/modals/CredentialForm.svelte') then { default: CredentialForm }}
		<CredentialForm bind:open={showForm} />
	{/await}
{/if}
