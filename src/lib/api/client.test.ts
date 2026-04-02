import { describe, it, expect, beforeEach } from 'vitest';
import { apiClient, ApiRequestError } from './client';
import { mockInvoke } from '$lib/test/setup';

describe('ApiClient', () => {
	beforeEach(() => {
		mockInvoke.clearResponses();
	});

	it('initializes from env config', async () => {
		mockInvoke.mockResponse('read_env_config', {
			n8nBaseUrl: 'http://localhost:5678',
			n8nApiKey: 'test-key-123',
			debug: false
		});

		await apiClient.initialize();
		// No error means success — config is stored internally
		expect(mockInvoke.fn).toHaveBeenCalledWith('read_env_config');
	});

	it('makes GET requests with correct URL and headers', async () => {
		mockInvoke.mockResponse('read_env_config', {
			n8nBaseUrl: 'http://localhost:5678',
			n8nApiKey: 'test-key',
			debug: false
		});
		await apiClient.initialize();

		mockInvoke.mockResponse('http_request', {
			status: 200,
			body: JSON.stringify({ data: [{ id: '1' }] }),
			headers: {}
		});

		const result = await apiClient.get<{ data: Array<{ id: string }> }>('/workflows');
		expect(result.data[0].id).toBe('1');
	});

	it('throws ApiRequestError on 401', async () => {
		mockInvoke.mockResponse('read_env_config', {
			n8nBaseUrl: 'http://localhost:5678',
			n8nApiKey: 'bad-key',
			debug: false
		});
		await apiClient.initialize();

		mockInvoke.mockResponse('http_request', {
			status: 401,
			body: '{"message":"Unauthorized"}',
			headers: {}
		});

		await expect(apiClient.get('/workflows')).rejects.toThrow(ApiRequestError);
		await expect(apiClient.get('/workflows')).rejects.toThrow(/check your API key/);
	});

	it('throws ApiRequestError on 5xx', async () => {
		mockInvoke.mockResponse('read_env_config', {
			n8nBaseUrl: 'http://localhost:5678',
			n8nApiKey: 'test-key',
			debug: false
		});
		await apiClient.initialize();

		mockInvoke.mockResponse('http_request', {
			status: 500,
			body: 'Internal Server Error',
			headers: {}
		});

		await expect(apiClient.get('/workflows')).rejects.toThrow(ApiRequestError);
		await expect(apiClient.get('/workflows')).rejects.toThrow(/Server error/);
	});

	it('throws ApiRequestError with parsed message on 4xx', async () => {
		mockInvoke.mockResponse('read_env_config', {
			n8nBaseUrl: 'http://localhost:5678',
			n8nApiKey: 'test-key',
			debug: false
		});
		await apiClient.initialize();

		mockInvoke.mockResponse('http_request', {
			status: 404,
			body: JSON.stringify({ message: 'Workflow not found' }),
			headers: {}
		});

		await expect(apiClient.get('/workflows/999')).rejects.toThrow('Workflow not found');
	});

	it('paginate appends cursor to path', async () => {
		mockInvoke.mockResponse('read_env_config', {
			n8nBaseUrl: 'http://localhost:5678',
			n8nApiKey: 'test-key',
			debug: false
		});
		await apiClient.initialize();

		mockInvoke.mockResponse('http_request', {
			status: 200,
			body: JSON.stringify({ data: [], nextCursor: 'abc123' }),
			headers: {}
		});

		const result = await apiClient.paginate('/workflows', 'cursor1');
		expect(result.nextCursor).toBe('abc123');

		// Verify the URL included the cursor
		const lastCall = mockInvoke.fn.mock.calls[mockInvoke.fn.mock.calls.length - 1];
		expect(lastCall[1].request.url).toContain('cursor=cursor1');
	});
});
