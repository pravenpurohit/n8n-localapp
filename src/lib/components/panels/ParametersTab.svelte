<script lang="ts">
	import type { Node as SvelteFlowNode } from '@xyflow/svelte';
	import { nodeRegistry } from '$lib/core/node-registry.svelte';
	import { canvasStore } from '$lib/stores/canvas.svelte';
	import { listCredentials } from '$lib/api/credentials';
	import ExpressionEditor from './ExpressionEditor.svelte';
	import type { NodePropertyDefinition, Credential } from '$lib/types';
	import { logger } from '$lib/core/logger';

	let { node }: { node: SvelteFlowNode } = $props();

	const nodeType = $derived((node.data.nodeType as string) ?? '');
	const typeVersion = $derived((node.data.typeVersion as number) ?? 1);
	const parameters = $derived((node.data.parameters as Record<string, unknown>) ?? {});
	const def = $derived(nodeRegistry.get(nodeType, typeVersion));
	const properties = $derived(def?.properties ?? []);
	const credentialDefs = $derived(def?.credentials ?? []);

	// Expression mode per field
	let expressionFields = $state<Set<string>>(new Set());

	// Credentials
	let availableCredentials = $state<Credential[]>([]);
	let credentialsLoaded = $state(false);

	$effect(() => {
		if (credentialDefs.length > 0 && !credentialsLoaded) {
			loadCredentials();
		}
	});

	async function loadCredentials() {
		try {
			const result = await listCredentials();
			availableCredentials = result.data;
			credentialsLoaded = true;
			logger.debug('params-tab', `Loaded ${availableCredentials.length} credentials`);
		} catch { /* ignore */ }
	}

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

	function updateCredential(credType: string, credId: string, credName: string) {
		const creds = { ...(node.data.credentials as Record<string, any> || {}), [credType]: { id: credId, name: credName } };
		node.data = { ...node.data, credentials: creds };
		canvasStore.markDirty();
	}

	function toggleExpression(fieldName: string) {
		const next = new Set(expressionFields);
		if (next.has(fieldName)) next.delete(fieldName); else next.add(fieldName);
		expressionFields = next;
	}
</script>

<div class="space-y-4">
	<!-- Credential selectors -->
	{#if credentialDefs.length > 0}
		<div class="rounded border border-gray-200 p-3 dark:border-[#3a3a5c]">
			<div class="mb-2 text-xs font-medium text-gray-500">Credentials</div>
			{#each credentialDefs as credDef}
				{@const currentCred = (node.data.credentials as Record<string, any>)?.[credDef.name]}
				{@const matchingCreds = availableCredentials.filter(c => c.type === credDef.name)}
				<div class="mb-2">
					<label class="mb-1 block text-xs text-gray-600 dark:text-gray-400">
						{credDef.name} {credDef.required ? '*' : ''}
					</label>
					<select
						value={currentCred?.id ?? ''}
						onchange={(e) => {
							const selected = matchingCreds.find(c => c.id === (e.target as HTMLSelectElement).value);
							if (selected) updateCredential(credDef.name, selected.id, selected.name);
						}}
						class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#252547]"
					>
						<option value="">Select credential...</option>
						{#each matchingCreds as cred}
							<option value={cred.id}>{cred.name}</option>
						{/each}
					</select>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Parameter fields -->
	{#each properties as prop}
		{#if shouldShow(prop)}
			<div>
				<div class="mb-1 flex items-center justify-between">
					<label class="text-xs font-medium text-gray-600 dark:text-gray-400">
						{prop.displayName}
						{#if prop.required}<span class="text-red-400">*</span>{/if}
					</label>
					<!-- Expression mode toggle -->
					{#if prop.type === 'string' || prop.type === 'number'}
						<button
							onclick={() => toggleExpression(prop.name)}
							class="rounded px-1 text-xs"
							class:text-[#ff6d5a]={expressionFields.has(prop.name)}
							class:text-gray-400={!expressionFields.has(prop.name)}
							title="Toggle expression mode"
						>
							{'{{ }}'}
						</button>
					{/if}
				</div>

				{#if expressionFields.has(prop.name)}
					<!-- Expression mode -->
					<ExpressionEditor
						value={String(parameters[prop.name] ?? prop.default ?? '')}
						onchange={(v) => updateParam(prop.name, v)}
					/>
				{:else if prop.type === 'string' && prop.typeOptions?.password}
					<input type="password" value={parameters[prop.name] ?? prop.default ?? ''}
						oninput={(e) => updateParam(prop.name, (e.target as HTMLInputElement).value)}
						class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#252547]" />
				{:else if prop.type === 'string' && prop.typeOptions?.editor === 'code'}
					<textarea value={parameters[prop.name] ?? prop.default ?? ''}
						oninput={(e) => updateParam(prop.name, (e.target as HTMLTextAreaElement).value)}
						class="w-full rounded border border-gray-200 px-2 py-1.5 font-mono text-xs dark:border-[#3a3a5c] dark:bg-[#252547]"
						rows="6" spellcheck="false"></textarea>
				{:else if prop.type === 'string'}
					<input type="text" value={parameters[prop.name] ?? prop.default ?? ''}
						oninput={(e) => updateParam(prop.name, (e.target as HTMLInputElement).value)}
						class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#252547]" />
				{:else if prop.type === 'number'}
					<input type="number" value={parameters[prop.name] ?? prop.default ?? 0}
						oninput={(e) => updateParam(prop.name, Number((e.target as HTMLInputElement).value))}
						class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#252547]" />
				{:else if prop.type === 'boolean'}
					<label class="flex items-center gap-2">
						<input type="checkbox" checked={!!(parameters[prop.name] ?? prop.default)}
							onchange={(e) => updateParam(prop.name, (e.target as HTMLInputElement).checked)} class="rounded" />
						<span class="text-sm">{parameters[prop.name] ? 'On' : 'Off'}</span>
					</label>
				{:else if prop.type === 'options' && prop.options}
					<select value={parameters[prop.name] ?? prop.default ?? ''}
						onchange={(e) => updateParam(prop.name, (e.target as HTMLSelectElement).value)}
						class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#252547]">
						{#each prop.options as opt}
							<option value={opt.value}>{opt.name}</option>
						{/each}
					</select>
				{:else if prop.type === 'collection' || prop.type === 'fixedCollection'}
					<!-- Collection/FixedCollection: render as expandable JSON editor -->
					<details class="rounded border border-gray-200 dark:border-[#3a3a5c]">
						<summary class="cursor-pointer px-2 py-1.5 text-xs text-gray-500">{prop.type} — click to edit</summary>
						<textarea
							value={JSON.stringify(parameters[prop.name] ?? prop.default ?? {}, null, 2)}
							oninput={(e) => {
								try { updateParam(prop.name, JSON.parse((e.target as HTMLTextAreaElement).value)); } catch {}
							}}
							class="w-full border-t border-gray-200 px-2 py-1.5 font-mono text-xs dark:border-[#3a3a5c] dark:bg-[#252547]"
							rows="4" spellcheck="false"
						></textarea>
					</details>
				{:else if prop.type === 'json'}
					<textarea
						value={typeof parameters[prop.name] === 'string' ? parameters[prop.name] : JSON.stringify(parameters[prop.name] ?? prop.default ?? {}, null, 2)}
						oninput={(e) => updateParam(prop.name, (e.target as HTMLTextAreaElement).value)}
						class="w-full rounded border border-gray-200 px-2 py-1.5 font-mono text-xs dark:border-[#3a3a5c] dark:bg-[#252547]"
						rows="4"></textarea>
				{:else}
					<input type="text" value={String(parameters[prop.name] ?? prop.default ?? '')}
						oninput={(e) => updateParam(prop.name, (e.target as HTMLInputElement).value)}
						class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#252547]" />
				{/if}
			</div>
		{/if}
	{/each}

	{#if properties.length === 0 && credentialDefs.length === 0}
		<p class="text-sm text-gray-400">No configurable parameters.</p>
	{/if}
</div>
