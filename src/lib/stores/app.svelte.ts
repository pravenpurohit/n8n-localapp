import { apiClient } from '$lib/api/client';
import { connectionStore } from './connection.svelte';
import { nodeRegistry } from '$lib/core/node-registry.svelte';
import { logger } from '$lib/core/logger';
import { isTauri, tauriInvoke } from '$lib/core/platform';
import type { AppConfig } from '$lib/types';

class AppStore {
	config = $state<AppConfig | null>(null);
	initialized = $state<boolean>(false);
	debug = $state<boolean>(false);
	error = $state<string | null>(null);

	async initialize(): Promise<void> {
		try {
			await apiClient.initialize();

			if (isTauri()) {
				const envConfig = await tauriInvoke<AppConfig>('read_env_config');
				this.config = envConfig;
				this.debug = envConfig.debug;
			} else {
				// Browser mode: use defaults
				this.config = {
					n8nBaseUrl: '',
					n8nApiKey: (typeof window !== 'undefined' && (window as any).__N8N_API_KEY__) ||
						(import.meta as any).env?.VITE_N8N_API_KEY || '',
					debug: true
				};
				this.debug = true;

				// Browser dev mode: login to n8n for session auth (workflow execution)
				// Credentials injected by test infrastructure via window globals, NOT from client bundle
				try {
					const email = (typeof window !== 'undefined' && (window as any).__N8N_EMAIL__) || '';
					const password = (typeof window !== 'undefined' && (window as any).__N8N_PASSWORD__) || '';
					if (email && password) {
						await fetch('/rest/login', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ emailOrLdapLoginId: email, password }),
							credentials: 'include',
						});
					}
				} catch {
					// Login is optional — public API still works without it
				}
			}

			logger.setDebug(this.debug);

			// Check connection
			await connectionStore.checkConnection();

			// Initialize node registry
			await nodeRegistry.initialize(async () => {
				const response = await apiClient.requestInternal<unknown[]>('GET', '/rest/nodes');
				return response as import('$lib/types').NodeTypeDefinition[];
			});

			this.initialized = true;
		} catch (err) {
			this.error = err instanceof Error ? err.message : String(err);
			throw err;
		}
	}
}

export const appStore = new AppStore();
