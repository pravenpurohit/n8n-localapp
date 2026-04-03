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
