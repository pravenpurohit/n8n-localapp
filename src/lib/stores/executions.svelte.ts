import { listExecutions, type ExecutionFilters } from '$lib/api/executions';
import { PaginatedList } from '$lib/utils/pagination.svelte';
import { workflowNameCache } from '$lib/utils/cache.svelte';
import type { Execution, ExecutionStatus } from '$lib/types';

class ExecutionsStore {
	statusFilter = $state<ExecutionStatus | undefined>(undefined);
	workflowFilter = $state<string | undefined>(undefined);
	dateRangeFilter = $state<{ from?: string; to?: string }>({});

	private get filters(): ExecutionFilters {
		return {
			status: this.statusFilter,
			workflowId: this.workflowFilter,
			dateFrom: this.dateRangeFilter.from,
			dateTo: this.dateRangeFilter.to
		};
	}

	list = new PaginatedList<Execution>((cursor) => listExecutions(this.filters, cursor));

	getWorkflowName(workflowId: string): string {
		return workflowNameCache.getName(workflowId);
	}

	async load(): Promise<void> {
		await this.list.loadInitial();
	}

	async loadMore(): Promise<void> {
		await this.list.loadMore();
	}

	async applyFilters(): Promise<void> {
		this.list.reset();
		await this.list.loadInitial();
	}
}

export const executionsStore = new ExecutionsStore();
