<script lang="ts">
	import type { Node as SvelteFlowNode } from '@xyflow/svelte';
	import { nodeRegistry } from '$lib/core/node-registry';
	import { canvasStore } from '$lib/stores/canvas.svelte';
	import type { NodePropertyDefinition } from '$lib/types';

	let { node }: { node: SvelteFlowNode } = $props();

	const nodeType = $derived((node.data.nodeType as string) ?? '');
	const typeVersion = $derived((node.data.typeVersion as number) ?? 1);
	const parameters = $derived((node.data.parameters as Record<string, unknown>) ?? {});
	const def = $derived(nodeRegistry.get(nodeType, typeVersion));
	const properties = $derived(def?.properties ?? []);

	function shouldShow(prop: NodePropertyDefinition): boolean {
		if (!prop.displayOptions?.show) return true;
		for (const [key, values] of Object.entries(prop.displayOptions.show)) {
			const current = parameters[key];
			if (!values.includes(current as string)) return false;
		}
		return true;
	}

	function updateParam(name: string, value: unknown) {
		const params = { ...parameters, [name]: value };
		node.data = { ...node.data, parameters: params };
		canvasStore.markDirty();
	}
</script>

<div class="space-y-4">
	{#each properties as prop}
		{#if shouldShow(prop)}
			<div>
				<label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
					{prop.displayName}
					{#if prop.required}<span class="text-red-400">*</span>{/if}
				</label>

				{#if prop.type === 'string' && prop.typeOptions?.password}
					<input
						type="password"
						value={parameters[prop.name] ?? prop.default ?? ''}
						oninput={(e) => updateParam(prop.name, (e.target as HTMLInputElement).value)}
						class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#252547]"
					/>
				{:else if prop.type === 'string'}
					<input
						type="text"
						value={parameters[prop.name] ?? prop.default ?? ''}
						oninput={(e) => updateParam(prop.name, (e.target as HTMLInputElement).value)}
						class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#252547]"
					/>
				{:else if prop.type === 'number'}
					<input
						type="number"
						value={parameters[prop.name] ?? prop.default ?? 0}
						oninput={(e) => updateParam(prop.name, Number((e.target as HTMLInputElement).value))}
						class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#252547]"
					/>
				{:else if prop.type === 'boolean'}
					<label class="flex items-center gap-2">
						<input
							type="checkbox"
							checked={!!parameters[prop.name] ?? !!prop.default}
							onchange={(e) => updateParam(prop.name, (e.target as HTMLInputElement).checked)}
							class="rounded"
						/>
						<span class="text-sm">{parameters[prop.name] ? 'On' : 'Off'}</span>
					</label>
				{:else if prop.type === 'options' && prop.options}
					<select
						value={parameters[prop.name] ?? prop.default ?? ''}
						onchange={(e) => updateParam(prop.name, (e.target as HTMLSelectElement).value)}
						class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#252547]"
					>
						{#each prop.options as opt}
							<option value={opt.value}>{opt.name}</option>
						{/each}
					</select>
				{:else if prop.type === 'json'}
					<textarea
						value={typeof parameters[prop.name] === 'string' ? parameters[prop.name] : JSON.stringify(parameters[prop.name] ?? prop.default ?? {}, null, 2)}
						oninput={(e) => updateParam(prop.name, (e.target as HTMLTextAreaElement).value)}
						class="w-full rounded border border-gray-200 px-2 py-1.5 font-mono text-xs dark:border-[#3a3a5c] dark:bg-[#252547]"
						rows="4"
					></textarea>
				{:else}
					<input
						type="text"
						value={String(parameters[prop.name] ?? prop.default ?? '')}
						oninput={(e) => updateParam(prop.name, (e.target as HTMLInputElement).value)}
						class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#252547]"
					/>
				{/if}
			</div>
		{/if}
	{/each}

	{#if properties.length === 0}
		<p class="text-sm text-gray-400">No configurable parameters.</p>
	{/if}
</div>
