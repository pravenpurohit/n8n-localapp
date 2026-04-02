<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import SearchInput from '$lib/components/common/SearchInput.svelte';
	import { listTemplates, getTemplate, type Template } from '$lib/api/templates';
	import { createWorkflow } from '$lib/api/workflows';

	let templates = $state<Template[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');
	let selectedTemplate = $state<Template | null>(null);
	let detailLoading = $state(false);

	onMount(async () => {
		try {
			const result = await listTemplates();
			templates = result.workflows;
		} catch {
			templates = [];
		} finally {
			loading = false;
		}
	});

	async function search(query: string) {
		searchQuery = query;
		loading = true;
		try {
			const result = await listTemplates(undefined, query || undefined);
			templates = result.workflows;
		} finally {
			loading = false;
		}
	}

	async function useTemplate(template: Template) {
		detailLoading = true;
		try {
			const detail = await getTemplate(template.id);
			const workflow = await createWorkflow({
				name: template.name,
				...(detail.workflow as any),
			});
			goto(`/workflows/${workflow.id}`);
		} finally {
			detailLoading = false;
		}
	}
</script>

<div class="p-6">
	<h1 class="mb-6 text-2xl font-semibold">Templates</h1>

	<div class="mb-4">
		<SearchInput placeholder="Search templates..." onchange={search} />
	</div>

	{#if loading}
		<p class="text-gray-400">Loading templates...</p>
	{:else if templates.length === 0}
		<p class="text-gray-400">No templates found.</p>
	{:else}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each templates as template}
				<div class="rounded-lg border border-gray-200 p-4 hover:shadow-md dark:border-[#3a3a5c]">
					<h3 class="mb-1 text-sm font-medium">{template.name}</h3>
					<p class="mb-3 text-xs text-gray-400 line-clamp-2">{template.description}</p>
					<div class="flex items-center justify-between">
						<span class="text-xs text-gray-400">{template.totalViews} views</span>
						<button
							onclick={() => useTemplate(template)}
							disabled={detailLoading}
							class="rounded bg-[#ff6d5a] px-3 py-1 text-xs font-medium text-white hover:bg-[#e55a48] disabled:opacity-50"
						>
							Use Template
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
