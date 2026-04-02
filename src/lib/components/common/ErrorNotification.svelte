<script lang="ts">
	interface Toast {
		id: string;
		severity: 'error' | 'warning' | 'info';
		message: string;
		retry?: () => void;
	}

	let toasts = $state<Toast[]>([]);

	const icons: Record<string, string> = { error: '❌', warning: '⚠️', info: 'ℹ️' };

	export function show(severity: Toast['severity'], message: string, retry?: () => void) {
		const id = crypto.randomUUID();
		toasts = [...toasts, { id, severity, message, retry }];
		if (severity !== 'error') {
			setTimeout(() => dismiss(id), 8000);
		}
	}

	function dismiss(id: string) {
		toasts = toasts.filter((t) => t.id !== id);
	}
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
	{#each toasts as toast (toast.id)}
		<div
			class="flex items-start gap-3 rounded-lg border bg-white p-4 shadow-lg dark:border-[#3a3a5c] dark:bg-[#252547]"
			class:border-red-200={toast.severity === 'error'}
			class:border-yellow-200={toast.severity === 'warning'}
			class:border-blue-200={toast.severity === 'info'}
		>
			<span>{icons[toast.severity]}</span>
			<p class="flex-1 text-sm">{toast.message}</p>
			{#if toast.retry}
				<button onclick={toast.retry} class="text-xs text-[#ff6d5a] hover:underline">Retry</button>
			{/if}
			<button onclick={() => dismiss(toast.id)} class="text-gray-400 hover:text-gray-600">✕</button>
		</div>
	{/each}
</div>
