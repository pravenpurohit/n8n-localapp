import type { PaginatedResponse } from '$lib/types';

export class PaginatedList<T> {
	items = $state<T[]>([]);
	nextCursor = $state<string | undefined>(undefined);
	loading = $state<boolean>(false);
	hasMore = $derived(this.nextCursor !== undefined);

	constructor(private fetchFn: (cursor?: string) => Promise<PaginatedResponse<T>>) {}

	async loadInitial(): Promise<void> {
		if (this.loading) return;
		this.loading = true;
		try {
			const response = await this.fetchFn();
			this.items = response.data;
			this.nextCursor = response.nextCursor;
		} finally {
			this.loading = false;
		}
	}

	async loadMore(): Promise<void> {
		if (!this.hasMore || this.loading) return;
		this.loading = true;
		try {
			const response = await this.fetchFn(this.nextCursor);
			this.items = [...this.items, ...response.data];
			this.nextCursor = response.nextCursor;
		} finally {
			this.loading = false;
		}
	}

	reset(): void {
		this.items = [];
		this.nextCursor = undefined;
	}
}
