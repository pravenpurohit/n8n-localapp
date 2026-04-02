import { apiClient } from './client';
import type { Workflow, PaginatedResponse } from '$lib/types';

export async function listWorkflows(cursor?: string): Promise<PaginatedResponse<Workflow>> {
	return apiClient.paginate<Workflow>('/workflows', cursor);
}

export async function getWorkflow(id: string): Promise<Workflow> {
	return apiClient.get<Workflow>(`/workflows/${id}`);
}

export async function createWorkflow(workflow: Partial<Workflow>): Promise<Workflow> {
	return apiClient.post<Workflow>('/workflows', workflow);
}

export async function updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow> {
	return apiClient.put<Workflow>(`/workflows/${id}`, workflow);
}

export async function deleteWorkflow(id: string): Promise<void> {
	await apiClient.delete(`/workflows/${id}`);
}

export async function activateWorkflow(id: string): Promise<Workflow> {
	return apiClient.post<Workflow>(`/workflows/${id}/activate`, {});
}

export async function deactivateWorkflow(id: string): Promise<Workflow> {
	return apiClient.post<Workflow>(`/workflows/${id}/deactivate`, {});
}
