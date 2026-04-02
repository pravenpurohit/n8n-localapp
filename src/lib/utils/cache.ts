import { apiClient } from '$lib/api/client';

class WorkflowNameCache {
	private cache = $state<Map<string, string>>(new Map());

	async refresh(): Promise<void> {
		let cursor: string | undefined;
		const newCache = new Map<string, string>();
		do {
			const response = await apiClient.paginate<{ id: string; name: string }>(
				'/workflows',
				cursor
			);
			for (const w of response.data) {
				newCache.set(w.id, w.name);
			}
			cursor = response.nextCursor;
		} while (cursor);
		this.cache = newCache;
	}

	getName(workflowId: string): string {
		return this.cache.get(workflowId) ?? workflowId;
	}
}

export const workflowNameCache = new WorkflowNameCache();
