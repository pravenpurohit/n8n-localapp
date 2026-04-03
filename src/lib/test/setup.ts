import { vi } from 'vitest';

/**
 * Mock responses map: command name → return value.
 */
const invokeResponses = new Map<string, unknown>();

const mockInvokeFn = vi.fn(async (cmd: string, _args?: Record<string, unknown>) => {
	if (invokeResponses.has(cmd)) {
		return invokeResponses.get(cmd);
	}
	throw new Error(`No mock response configured for Tauri command: "${cmd}"`);
});

// Mock @tauri-apps/api/core
vi.mock('@tauri-apps/api/core', () => ({
	invoke: mockInvokeFn
}));

// Mock platform module to simulate Tauri environment in tests
vi.mock('$lib/core/platform', () => ({
	isTauri: () => true,
	tauriInvoke: mockInvokeFn,
	setBrowserApiKey: () => {},
	getBrowserConfig: () => ({ n8nBaseUrl: 'http://localhost:5678', n8nApiKey: '', debug: false }),
}));

export const mockInvoke = {
	mockResponse(command: string, response: unknown): void {
		invokeResponses.set(command, response);
	},
	clearResponses(): void {
		invokeResponses.clear();
	},
	get fn() {
		return mockInvokeFn;
	}
};
