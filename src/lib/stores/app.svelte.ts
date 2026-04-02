import { apiClient } from '$lib/api/client';
import { connectionStore } from './connection.svelte';
import { nodeRegistry } from '$lib/core/node-registry';
import { logger } from '$lib/core/logger';
import type { AppConfig } from '$lib/types';

class AppStore {
	config = $state<AppConfig | null>(null);
	initialized = $state<boolean>(false);
	debug = $state<boolean>(false);
	error = $state<string | null>(null);

	async initialize(): Promise<void> {
		try {
			await apiClient.initialize();
			this.config = {
				n8nBaseUrl: '',
				n8nApiKey: '',
				debug: false
			};

			// Read env config for debug flag
			const { invoke } = await import('@tauri-apps/api/core');
			const envConfig = await invoke<AppConfig>('read_env_config');
			this.config = envConfig;
			this.debug = envConfig.debug;
			logger.setDebug(envConfig.debug);

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
