<script lang="ts">
	import type { ExecutionStatus } from '$lib/types';

	let { status }: { status: ExecutionStatus } = $props();

	const config: Record<ExecutionStatus, { label: string; color: string; bg: string }> = {
		success: { label: 'Success', color: '#17bf63', bg: '#17bf6320' },
		error: { label: 'Error', color: '#ff4757', bg: '#ff475720' },
		running: { label: 'Running', color: '#ffa502', bg: '#ffa50220' },
		waiting: { label: 'Waiting', color: '#3498db', bg: '#3498db20' },
		canceled: { label: 'Canceled', color: '#95a5a6', bg: '#95a5a620' },
		new: { label: 'New', color: '#9b59b6', bg: '#9b59b620' },
	};

	const c = $derived(config[status] ?? config.new);
</script>

<span
	class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
	style="background-color: {c.bg}; color: {c.color};"
>
	{c.label}
</span>
