import { apiClient } from '$lib/api/client';

class ConnectionStore {
	status = $state<'connected' | 'disconnected' | 'checking'>('checking');
	lastSuccessfulCheck = $state<string | null>(null);
	retryCount = $state<number>(0);
	private retryInterval: ReturnType<typeof setInterval> | null = null;

	isConnected = $derived(this.status === 'connected');

	async checkConnection(): Promise<boolean> {
		this.status = 'checking';
		try {
			await apiClient.get('/workflows?limit=1');
			this.status = 'connected';
			this.lastSuccessfulCheck = new Date().toISOString();
			this.retryCount = 0;
			this.stopRetry();
			return true;
		} catch {
			this.status = 'disconnected';
			this.retryCount++;
			this.startRetry();
			return false;
		}
	}

	private startRetry(): void {
		if (this.retryInterval) return;
		this.retryInterval = setInterval(() => this.checkConnection(), 10_000);
	}

	stopRetry(): void {
		if (this.retryInterval) {
			clearInterval(this.retryInterval);
			this.retryInterval = null;
		}
	}
}

export const connectionStore = new ConnectionStore();
