import { logger } from '$lib/core/logger';
import { isTauri, tauriInvoke } from '$lib/core/platform';
import type { AppConfig, PaginatedResponse } from '$lib/types';

interface HttpRequest {
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	url: string;
	body?: unknown;
	headers?: Record<string, string>;
}

interface HttpResponse {
	status: number;
	body: string;
	headers: Record<string, string>;
}

export class ApiRequestError extends Error {
	constructor(
		public readonly status: number,
		message: string
	) {
		super(message);
		this.name = 'ApiRequestError';
	}
}

/** Send an HTTP request — via Tauri invoke or browser fetch */
async function httpRequest(request: HttpRequest): Promise<HttpResponse> {
	const startTime = performance.now();
	try {
		let response: HttpResponse;

		if (isTauri()) {
			response = await tauriInvoke<HttpResponse>('http_request', { request });
		} else {
			// Browser fallback: direct fetch with credentials for session cookies
			const res = await fetch(request.url, {
				method: request.method,
				headers: request.headers,
				body: request.body ? JSON.stringify(request.body) : undefined,
				credentials: 'include',
			});
			const body = await res.text();
			const headers: Record<string, string> = {};
			res.headers.forEach((v, k) => (headers[k] = v));
			response = { status: res.status, body, headers };
		}

		const duration = Math.round(performance.now() - startTime);
		logger.debug('api', 'HTTP request completed', {
			method: request.method,
			url: request.url,
			status: response.status,
			duration
		});
		return response;
	} catch (error) {
		logger.error('api', 'HTTP request failed', {
			method: request.method,
			url: request.url,
			error: String(error)
		});
		throw error;
	}
}

class ApiClient {
	private baseUrl: string = '';
	private apiKey: string = '';

	async initialize(): Promise<void> {
		if (isTauri()) {
			const config = await tauriInvoke<AppConfig>('read_env_config');
			this.baseUrl = config.n8nBaseUrl.replace(/\/$/, '');
			this.apiKey = config.n8nApiKey;
		} else {
			// Browser mode: use relative URLs (proxied by Vite to n8n)
			// API key from window global (injected by tests) or import.meta.env
			this.baseUrl = '';
			this.apiKey =
				(typeof window !== 'undefined' && (window as any).__N8N_API_KEY__) ||
				(import.meta as any).env?.VITE_N8N_API_KEY ||
				'';
		}
	}

	/** Set credentials directly (used in browser/test mode) */
	configure(baseUrl: string, apiKey: string): void {
		this.baseUrl = baseUrl.replace(/\/$/, '');
		this.apiKey = apiKey;
	}

	async request<T>(method: string, path: string, body?: unknown): Promise<T> {
		const response = await httpRequest({
			method: method as HttpRequest['method'],
			url: `${this.baseUrl}/api/v1${path}`,
			body,
			headers: { 'X-N8N-API-KEY': this.apiKey, 'Content-Type': 'application/json' }
		});

		if (response.status === 401) {
			throw new ApiRequestError(401, 'Unauthorized — check your API key in .env');
		}
		if (response.status >= 500) {
			throw new ApiRequestError(response.status, `Server error: ${response.body}`);
		}
		if (response.status >= 400) {
			const parsed = tryParseJson(response.body);
			throw new ApiRequestError(response.status, parsed?.message ?? response.body);
		}

		return JSON.parse(response.body) as T;
	}

	async get<T>(path: string): Promise<T> {
		return this.request<T>('GET', path);
	}

	async post<T>(path: string, body: unknown): Promise<T> {
		return this.request<T>('POST', path, body);
	}

	async put<T>(path: string, body: unknown): Promise<T> {
		return this.request<T>('PUT', path, body);
	}

	async patch<T>(path: string, body: unknown): Promise<T> {
		return this.request<T>('PATCH', path, body);
	}

	async delete<T>(path: string): Promise<T> {
		return this.request<T>('DELETE', path);
	}

	async requestInternal<T>(method: string, path: string, body?: unknown): Promise<T> {
		const response = await httpRequest({
			method: method as HttpRequest['method'],
			url: `${this.baseUrl}${path}`,
			body,
			headers: { 'X-N8N-API-KEY': this.apiKey, 'Content-Type': 'application/json' }
		});

		if (response.status >= 400) {
			const parsed = tryParseJson(response.body);
			throw new ApiRequestError(response.status, parsed?.message ?? response.body);
		}

		return JSON.parse(response.body) as T;
	}

	async paginate<T>(path: string, cursor?: string): Promise<PaginatedResponse<T>> {
		const separator = path.includes('?') ? '&' : '?';
		const url = cursor ? `${path}${separator}cursor=${cursor}` : path;
		return this.get<PaginatedResponse<T>>(url);
	}
}

function tryParseJson(body: string): { message?: string } | null {
	try {
		return JSON.parse(body);
	} catch {
		return null;
	}
}

export const apiClient = new ApiClient();
