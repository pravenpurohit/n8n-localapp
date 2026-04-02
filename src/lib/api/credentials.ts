import { apiClient } from './client';
import type { Credential, CredentialWithData, CredentialSchema, PaginatedResponse } from '$lib/types';

export async function listCredentials(cursor?: string): Promise<PaginatedResponse<Credential>> {
	return apiClient.paginate<Credential>('/credentials', cursor);
}

export async function getCredential(id: string): Promise<CredentialWithData> {
	return apiClient.get<CredentialWithData>(`/credentials/${id}`);
}

export async function createCredential(credential: Partial<CredentialWithData>): Promise<Credential> {
	return apiClient.post<Credential>('/credentials', credential);
}

export async function updateCredential(
	id: string,
	credential: Partial<CredentialWithData>
): Promise<Credential> {
	return apiClient.patch<Credential>(`/credentials/${id}`, credential);
}

export async function deleteCredential(id: string): Promise<void> {
	await apiClient.delete(`/credentials/${id}`);
}

export async function getCredentialSchema(type: string): Promise<CredentialSchema> {
	return apiClient.get<CredentialSchema>(`/credentials/schema/${type}`);
}

export async function testCredential(id: string): Promise<{ success: boolean }> {
	return apiClient.post<{ success: boolean }>(`/credentials/${id}/test`, {});
}
