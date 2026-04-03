/**
 * Platform detection and Tauri invoke wrapper.
 * In Tauri: uses invoke() for HTTP proxy and env config.
 * In browser (dev server / E2E tests): uses direct fetch() to n8n.
 */

let _isTauri: boolean | null = null;

/** Detect if running inside Tauri webview */
export function isTauri(): boolean {
	if (_isTauri === null) {
		_isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
	}
	return _isTauri;
}

/** Invoke a Tauri command, or throw if not in Tauri */
export async function tauriInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
	const { invoke } = await import('@tauri-apps/api/core');
	return invoke<T>(cmd, args);
}

/**
 * Browser-mode config. When not in Tauri, read from hardcoded defaults
 * that match the .env file. In production Tauri, these are never used.
 */
const BROWSER_CONFIG = {
	n8nBaseUrl: 'http://localhost:5678',
	n8nApiKey: '', // Will be read from n8n cookie/session or set below
	debug: true,
};

/** Set the browser-mode API key (called during init) */
export function setBrowserApiKey(key: string): void {
	BROWSER_CONFIG.n8nApiKey = key;
}

export function getBrowserConfig() {
	return { ...BROWSER_CONFIG };
}
