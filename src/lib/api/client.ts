import { invoke } from '@tauri-apps/api/core';
import { logger } from '$lib/core/logger';
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

/** Send an HTTP request through Tauri's Rust backend */
async function tauriHttp(request: HttpRequest): Promise<HttpResponse> {
	const startTime = performance.now();
	try {
		const response = await invoke<HttpResponse>('http_request', { request });
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
		const config = await invoke<AppConfig>('read_env_config');
		this.baseUrl = config.n8nBaseUrl.replace(/\/$/, '');
		this.apiKey = config.n8nApiKey;
	}

	async request<T>(method: string, path: string, body?: unknown): Promise<T> {
		const response = await tauriHttp({
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

	/** Make a request to the internal REST API (no /api/v1 prefix) */
	async requestInternal<T>(method: string, path: string, body?: unknown): Promise<T> {
		const response = await tauriHttp({
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

	/** Fetch a paginated list with cursor-based pagination */
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
