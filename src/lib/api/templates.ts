import { apiClient } from './client';

export interface Template {
	id: number;
	name: string;
	description: string;
	totalViews: number;
	createdAt: string;
}

export interface TemplateDetail extends Template {
	workflow: Record<string, unknown>;
	nodes: Array<{ type: string; displayName: string }>;
}

const N8N_TEMPLATES_BASE = 'https://api.n8n.io/api';

/** List templates from n8n.io public API */
export async function listTemplates(
	category?: string,
	search?: string
): Promise<{ workflows: Template[] }> {
	const params = new URLSearchParams();
	if (category) params.set('category', category);
	if (search) params.set('search', search);

	const query = params.toString();
	const path = query ? `/templates/workflows?${query}` : '/templates/workflows';

	// Templates use the public n8n.io API, routed through requestInternal with full URL
	return apiClient.requestInternal<{ workflows: Template[] }>('GET', `${N8N_TEMPLATES_BASE}${path}`);
}

/** Get a single template from n8n.io public API */
export async function getTemplate(id: number): Promise<TemplateDetail> {
	return apiClient.requestInternal<TemplateDetail>(
		'GET',
		`${N8N_TEMPLATES_BASE}/templates/workflows/${id}`
	);
}
