import { listCredentials } from '$lib/api/credentials';
import { PaginatedList } from '$lib/utils/pagination';
import type { Credential } from '$lib/types';

class CredentialsStore {
	list = new PaginatedList<Credential>((cursor) => listCredentials(cursor));

	async load(): Promise<void> {
		await this.list.loadInitial();
	}

	async loadMore(): Promise<void> {
		await this.list.loadMore();
	}
}

export const credentialsStore = new CredentialsStore();
