/** Paginated API response envelope */
export interface PaginatedResponse<T> {
	data: T[];
	nextCursor?: string;
}

/** API error response from n8n */
export interface ApiErrorResponse {
	status: number;
	message: string;
	code?: string;
}

/** App configuration from .env */
export interface AppConfig {
	n8nBaseUrl: string;
	n8nApiKey: string;
	debug: boolean;
}
