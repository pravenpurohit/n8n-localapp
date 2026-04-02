import { apiClient } from './client';
import type { Tag } from '$lib/types';

export async function listTags(): Promise<Tag[]> {
	return apiClient.get<Tag[]>('/tags');
}

export async function createTag(name: string): Promise<Tag> {
	return apiClient.post<Tag>('/tags', { name });
}

export async function updateTag(id: string, name: string): Promise<Tag> {
	return apiClient.patch<Tag>(`/tags/${id}`, { name });
}

export async function deleteTag(id: string): Promise<void> {
	await apiClient.delete(`/tags/${id}`);
}
