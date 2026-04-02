import { apiClient } from './client';
import type { Execution, ExecutionStatus, PaginatedResponse } from '$lib/types';

export interface ExecutionFilters {
	status?: ExecutionStatus;
	workflowId?: string;
	dateFrom?: string;
	dateTo?: string;
}

export async function listExecutions(
	filters?: ExecutionFilters,
	cursor?: string
): Promise<PaginatedResponse<Execution>> {
	const params = new URLSearchParams();
	if (filters?.status) params.set('status', filters.status);
	if (filters?.workflowId) params.set('workflowId', filters.workflowId);
	if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
	if (filters?.dateTo) params.set('dateTo', filters.dateTo);

	const query = params.toString();
	const path = query ? `/executions?${query}` : '/executions';
	return apiClient.paginate<Execution>(path, cursor);
}

export async function getExecution(id: string): Promise<Execution> {
	return apiClient.get<Execution>(`/executions/${id}`);
}

export async function deleteExecution(id: string): Promise<void> {
	await apiClient.delete(`/executions/${id}`);
}

export async function retryExecution(id: string): Promise<Execution> {
	return apiClient.post<Execution>(`/executions/${id}/retry`, {});
}
