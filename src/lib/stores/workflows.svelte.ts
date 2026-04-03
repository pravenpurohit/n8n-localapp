import { listWorkflows } from '$lib/api/workflows';
import { PaginatedList } from '$lib/utils/pagination.svelte';
import type { Workflow } from '$lib/types';

class WorkflowsStore {
	list = new PaginatedList<Workflow>((cursor) => listWorkflows(cursor));
	searchQuery = $state<string>('');
	selectedTags = $state<string[]>([]);

	filteredWorkflows = $derived.by(() => {
		let result = this.list.items;
		const q = this.searchQuery.toLowerCase();
		if (q) {
			result = result.filter((w) => w.name.toLowerCase().includes(q));
		}
		if (this.selectedTags.length > 0) {
			result = result.filter((w) =>
				this.selectedTags.every((tagId) => w.tags.some((t) => t.id === tagId))
			);
		}
		return result;
	});

	async load(): Promise<void> {
		await this.list.loadInitial();
	}

	async loadMore(): Promise<void> {
		await this.list.loadMore();
	}

	setSearch(query: string): void {
		this.searchQuery = query;
	}

	setSelectedTags(tagIds: string[]): void {
		this.selectedTags = tagIds;
	}
}

export const workflowsStore = new WorkflowsStore();
