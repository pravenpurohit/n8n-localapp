import { vi } from 'vitest';

/**
 * Mock responses map: command name → return value.
 * Tests set up expected responses via `mockInvoke.mockResponse()`.
 */
const invokeResponses = new Map<string, unknown>();

/**
 * Mock implementation of `@tauri-apps/api/core` invoke.
 * Returns the pre-configured response for the given command,
 * or rejects with "No mock response" if none was set.
 */
const mockInvokeFn = vi.fn(async (cmd: string, _args?: Record<string, unknown>) => {
	if (invokeResponses.has(cmd)) {
		return invokeResponses.get(cmd);
	}
	throw new Error(`No mock response configured for Tauri command: "${cmd}"`);
});

vi.mock('@tauri-apps/api/core', () => ({
	invoke: mockInvokeFn
}));

/**
 * Helper for tests to configure mock Tauri invoke responses.
 *
 * Usage:
 *   import { mockInvoke } from '$lib/test/setup';
 *   mockInvoke.mockResponse('read_env_config', { n8nBaseUrl: '...', n8nApiKey: '...', debug: false });
 */
export const mockInvoke = {
	/** Set a mock return value for a Tauri command. */
	mockResponse(command: string, response: unknown): void {
		invokeResponses.set(command, response);
	},

	/** Clear all mock responses. */
	clearResponses(): void {
		invokeResponses.clear();
	},

	/** Get the underlying vi.fn() mock for assertions. */
	get fn() {
		return mockInvokeFn;
	}
};
