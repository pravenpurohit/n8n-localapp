<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import SearchInput from '$lib/components/common/SearchInput.svelte';
	import TagPill from '$lib/components/common/TagPill.svelte';
	import StatusBadge from '$lib/components/common/StatusBadge.svelte';
	import LoadMore from '$lib/components/common/LoadMore.svelte';
	import { workflowsStore } from '$lib/stores/workflows.svelte';
	import { credentialsStore } from '$lib/stores/credentials.svelte';
	import { executionsStore } from '$lib/stores/executions.svelte';
	import { tagsStore } from '$lib/stores/tags.svelte';
	import { workflowNameCache } from '$lib/utils/cache.svelte';
	import { formatRelativeTime } from '$lib/utils/format';

	let activeTab = $state<'workflows' | 'credentials' | 'executions'>('workflows');

	onMount(async () => {
		await Promise.all([
			workflowsStore.load(),
			credentialsStore.load(),
			executionsStore.load(),
			tagsStore.load(),
			workflowNameCache.refresh(),
		]);
	});
</script>

<div class="p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-semibold">Overview</h1>
		<button
			onclick={() => goto('/workflows/new')}
			class="rounded-lg bg-[#ff6d5a] px-4 py-2 text-sm font-medium text-white hover:bg-[#e55a48]"
		>
			Create Workflow
		</button>
	</div>

	<!-- Tabs -->
	<div class="mb-4 flex gap-1 border-b border-gray-200 dark:border-[#3a3a5c]">
		{#each ['workflows', 'credentials', 'executions'] as tab}
			<button
				onclick={() => activeTab = tab as typeof activeTab}
				class="px-4 py-2 text-sm font-medium transition-colors"
				class:text-[#ff6d5a]={activeTab === tab}
				class:border-b-2={activeTab === tab}
				class:border-[#ff6d5a]={activeTab === tab}
				class:text-gray-500={activeTab !== tab}
			>
				{tab.charAt(0).toUpperCase() + tab.slice(1)}
			</button>
		{/each}
	</div>

	<!-- Workflows Tab -->
	{#if activeTab === 'workflows'}
		<div class="mb-4 flex gap-3">
			<div class="flex-1">
				<SearchInput
					placeholder="Search workflows..."
					onchange={(v) => workflowsStore.setSearch(v)}
				/>
			</div>
			<!-- Tag filter -->
			<div class="flex flex-wrap gap-1">
				{#each tagsStore.tags as tag}
					<button
						onclick={() => {
							const sel = workflowsStore.selectedTags;
							workflowsStore.setSelectedTags(
								sel.includes(tag.id) ? sel.filter(t => t !== tag.id) : [...sel, tag.id]
							);
						}}
						class="rounded-full border px-2 py-0.5 text-xs"
						class:border-[#ff6d5a]={workflowsStore.selectedTags.includes(tag.id)}
						class:bg-orange-50={workflowsStore.selectedTags.includes(tag.id)}
					>
						{tag.name}
					</button>
				{/each}
			</div>
		</div>

		<div class="space-y-1">
			{#each workflowsStore.filteredWorkflows as workflow}
				<button
					onclick={() => goto(`/workflows/${workflow.id}`)}
					class="flex w-full items-center gap-4 rounded-lg p-3 text-left hover:bg-gray-50 dark:hover:bg-[#3a3a5c]/50"
				>
					<div class="flex-1">
						<div class="text-sm font-medium">{workflow.name}</div>
						<div class="flex gap-1 mt-1">
							{#each workflow.tags as tag}
								<TagPill name={tag.name} />
							{/each}
						</div>
					</div>
					<span class="text-xs" class:text-green-500={workflow.active} class:text-gray-400={!workflow.active}>
						{workflow.active ? 'Active' : 'Inactive'}
					</span>
					<span class="text-xs text-gray-400">{formatRelativeTime(workflow.updatedAt)}</span>
				</button>
			{/each}
		</div>

		<LoadMore
			loading={workflowsStore.list.loading}
			hasMore={workflowsStore.list.hasMore}
			onclick={() => workflowsStore.loadMore()}
		/>
	{/if}

	<!-- Credentials Tab -->
	{#if activeTab === 'credentials'}
		<div class="mb-4">
			<SearchInput placeholder="Search credentials..." />
		</div>
		<div class="space-y-1">
			{#each credentialsStore.list.items as cred}
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
	{/if}

	<!-- Executions Tab -->
	{#if activeTab === 'executions'}
		<div class="mb-4">
			<SearchInput placeholder="Search executions..." />
		</div>
		<div class="space-y-1">
			{#each executionsStore.list.items as exec}
				<div class="flex items-center gap-4 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-[#3a3a5c]/50">
					<div class="flex-1">
						<div class="text-sm font-medium">{executionsStore.getWorkflowName(exec.workflowId)}</div>
						<div class="text-xs text-gray-400">{formatRelativeTime(exec.startedAt)}</div>
					</div>
					<StatusBadge status={exec.status} />
					<span class="text-xs text-gray-400">#{exec.id}</span>
				</div>
			{/each}
		</div>
		<LoadMore
			loading={executionsStore.list.loading}
			hasMore={executionsStore.list.hasMore}
			onclick={() => executionsStore.loadMore()}
		/>
	{/if}
</div>
