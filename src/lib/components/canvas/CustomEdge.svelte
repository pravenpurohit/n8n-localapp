<script lang="ts">
	import { BaseEdge, getBezierPath } from '@xyflow/svelte';

	let { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data } = $props<{
		id: string;
		sourceX: number;
		sourceY: number;
		targetX: number;
		targetY: number;
		sourcePosition: any;
		targetPosition: any;
		data?: Record<string, unknown>;
	}>();

	const connectionType = $derived((data?.connectionType as string) ?? 'main');
	const isAi = $derived(connectionType.startsWith('ai_'));

	const edgePath = $derived(
		getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition })
	);
</script>

<BaseEdge
	{id}
	path={edgePath[0]}
	style="stroke: {isAi ? '#a855f7' : '#94a3b8'}; stroke-width: {isAi ? 2 : 1.5};"
/>
