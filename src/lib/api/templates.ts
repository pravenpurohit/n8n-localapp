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

/** List templates from n8n.io public API (no auth, direct fetch) */
export async function listTemplates(
	category?: string,
	search?: string
): Promise<{ workflows: Template[] }> {
	const params = new URLSearchParams();
	if (category) params.set('category', category);
	if (search) params.set('search', search);

	const query = params.toString();
	const path = query ? `/templates/workflows?${query}` : '/templates/workflows';

	const res = await fetch(`${N8N_TEMPLATES_BASE}${path}`);
	if (!res.ok) throw new Error(`Templates API error: ${res.status}`);
	return res.json();
}

/** Get a single template from n8n.io public API (no auth, direct fetch) */
export async function getTemplate(id: number): Promise<TemplateDetail> {
	const res = await fetch(`${N8N_TEMPLATES_BASE}/templates/workflows/${id}`);
	if (!res.ok) throw new Error(`Templates API error: ${res.status}`);
	return res.json();
}
