import { apiClient } from './client';
import type { PaginatedResponse } from '$lib/types';

export interface DataTable {
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}

export interface DataTableRow {
	id: string;
	data: Record<string, unknown>;
}

export async function listDataTables(cursor?: string): Promise<PaginatedResponse<DataTable>> {
	return apiClient.paginate<DataTable>('/data-tables', cursor);
}

export async function createDataTable(name: string): Promise<DataTable> {
	return apiClient.post<DataTable>('/data-tables', { name });
}

export async function deleteDataTable(id: string): Promise<void> {
	await apiClient.delete(`/data-tables/${id}`);
}

export async function listRows(
	tableId: string,
	cursor?: string
): Promise<PaginatedResponse<DataTableRow>> {
	return apiClient.paginate<DataTableRow>(`/data-tables/${tableId}/rows`, cursor);
}

export async function addRow(tableId: string, data: Record<string, unknown>): Promise<DataTableRow> {
	return apiClient.post<DataTableRow>(`/data-tables/${tableId}/rows`, data);
}

export async function updateRow(
	tableId: string,
	rowId: string,
	data: Record<string, unknown>
): Promise<DataTableRow> {
	return apiClient.patch<DataTableRow>(`/data-tables/${tableId}/rows/${rowId}`, data);
}

export async function deleteRow(tableId: string, rowId: string): Promise<void> {
	await apiClient.delete(`/data-tables/${tableId}/rows/${rowId}`);
}

export async function upsertRow(
	tableId: string,
	data: Record<string, unknown>
): Promise<DataTableRow> {
	return apiClient.put<DataTableRow>(`/data-tables/${tableId}/rows`, data);
}
