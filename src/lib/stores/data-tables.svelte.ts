import * as dtApi from '$lib/api/data-tables';
import { PaginatedList } from '$lib/utils/pagination';
import type { DataTable, DataTableRow } from '$lib/api/data-tables';

class DataTablesStore {
	list = new PaginatedList<DataTable>((cursor) => dtApi.listDataTables(cursor));
	rows = new PaginatedList<DataTableRow>(() => Promise.resolve({ data: [], nextCursor: undefined }));
	activeTableId = $state<string | null>(null);

	async load(): Promise<void> {
		await this.list.loadInitial();
	}

	async loadMore(): Promise<void> {
		await this.list.loadMore();
	}

	async loadRows(tableId: string): Promise<void> {
		this.activeTableId = tableId;
		this.rows = new PaginatedList<DataTableRow>((cursor) => dtApi.listRows(tableId, cursor));
		await this.rows.loadInitial();
	}

	async loadMoreRows(): Promise<void> {
		await this.rows.loadMore();
	}
}

export const dataTablesStore = new DataTablesStore();
