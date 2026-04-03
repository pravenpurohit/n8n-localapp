<script lang="ts">
	import { onMount } from 'svelte';
	import SearchInput from '$lib/components/common/SearchInput.svelte';
	import StatusBadge from '$lib/components/common/StatusBadge.svelte';
	import LoadMore from '$lib/components/common/LoadMore.svelte';
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';
	import { executionsStore } from '$lib/stores/executions.svelte';
	import { workflowNameCache } from '$lib/utils/cache.svelte';
	import { formatRelativeTime, formatDuration } from '$lib/utils/format';
	import { deleteExecution, retryExecution } from '$lib/api/executions';
	import type { ExecutionStatus } from '$lib/types';

	let confirmDelete = $state(false);
	let deleteTargetId = $state('');
	let selectedIds = $state<Set<string>>(new Set());

	const statusOptions: (ExecutionStatus | 'all')[] = ['all', 'success', 'error', 'running', 'waiting', 'canceled'];

	onMount(async () => {
		await workflowNameCache.refresh();
		await executionsStore.load();
	});

	function setStatusFilter(status: string) {
		executionsStore.statusFilter = status === 'all' ? undefined : status as ExecutionStatus;
		executionsStore.applyFilters();
	}

	async function handleRetry(id: string) {
		await retryExecution(id);
		await executionsStore.applyFilters();
	}

	function confirmDeleteExec(id: string) {
		deleteTargetId = id;
		confirmDelete = true;
	}

	async function handleDelete() {
		await deleteExecution(deleteTargetId);
		await executionsStore.applyFilters();
	}

	function toggleSelect(id: string) {
		const next = new Set(selectedIds);
		if (next.has(id)) next.delete(id); else next.add(id);
		selectedIds = next;
	}
</script>

<div class="p-6">
	<h1 class="mb-6 text-2xl font-semibold">Executions</h1>

	<!-- Filters -->
	<div class="mb-4 flex flex-wrap gap-3">
		<div class="flex gap-1">
			{#each statusOptions as status}
				<button
					onclick={() => setStatusFilter(status)}
					class="rounded-full border px-3 py-1 text-xs capitalize"
					class:bg-[#ff6d5a]={executionsStore.statusFilter === (status === 'all' ? undefined : status)}
					class:text-white={executionsStore.statusFilter === (status === 'all' ? undefined : status)}
					class:border-gray-200={executionsStore.statusFilter !== (status === 'all' ? undefined : status)}
				>
					{status}
				</button>
			{/each}
		</div>
	</div>

	<!-- Table -->
	<div class="overflow-x-auto">
		<table class="w-full text-left text-sm">
			<thead>
				<tr class="border-b border-gray-200 dark:border-[#3a3a5c]">
					<th class="px-4 py-3 font-medium text-gray-500">Workflow</th>
					<th class="px-4 py-3 font-medium text-gray-500">Started</th>
					<th class="px-4 py-3 font-medium text-gray-500">Status</th>
					<th class="px-4 py-3 font-medium text-gray-500">ID</th>
					<th class="px-4 py-3 font-medium text-gray-500">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each executionsStore.list.items as exec}
					<tr class="border-b border-gray-100 hover:bg-gray-50 dark:border-[#3a3a5c] dark:hover:bg-[#3a3a5c]/50">
						<td class="px-4 py-3 font-medium">{executionsStore.getWorkflowName(exec.workflowId)}</td>
						<td class="px-4 py-3 text-gray-500">{formatRelativeTime(exec.startedAt)}</td>
						<td class="px-4 py-3"><StatusBadge status={exec.status} /></td>
						<td class="px-4 py-3 text-gray-400">#{exec.id}</td>
						<td class="px-4 py-3">
							<div class="flex gap-2">
								{#if exec.status === 'error'}
									<button onclick={() => handleRetry(exec.id)} class="text-xs text-blue-500 hover:underline">Retry</button>
								{/if}
								<button onclick={() => confirmDeleteExec(exec.id)} class="text-xs text-red-500 hover:underline">Delete</button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<LoadMore
		loading={executionsStore.list.loading}
		hasMore={executionsStore.list.hasMore}
		onclick={() => executionsStore.loadMore()}
	/>
</div>

<ConfirmDialog
	bind:open={confirmDelete}
	title="Delete Execution"
	message="Are you sure you want to delete this execution?"
	confirmLabel="Delete"
	onconfirm={handleDelete}
/>
