<script lang="ts">
	import { nodePanelStore } from '$lib/stores/node-panel.svelte';
	import ParametersTab from './ParametersTab.svelte';
	import SettingsTab from './SettingsTab.svelte';
	import InputOutputTab from './InputOutputTab.svelte';

	const node = $derived(nodePanelStore.selectedNode);
	const label = $derived((node?.data?.label as string) ?? 'Node');
	const nodeType = $derived((node?.data?.nodeType as string) ?? '');

	const tabs = ['parameters', 'settings', 'input', 'output'] as const;
</script>

{#if node}
	<div class="absolute right-0 top-0 z-10 flex h-full w-96 flex-col border-l border-gray-200 bg-white shadow-lg dark:border-[#3a3a5c] dark:bg-[#1a1a2e]">
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-gray-200 p-3 dark:border-[#3a3a5c]">
			<div>
				<div class="text-sm font-medium">{label}</div>
				<div class="text-xs text-gray-400">{nodeType.split('.').pop()}</div>
			</div>
			<button onclick={() => nodePanelStore.close()} class="text-gray-400 hover:text-gray-600">✕</button>
		</div>

		<!-- Tabs -->
		<div class="flex border-b border-gray-200 dark:border-[#3a3a5c]">
			{#each tabs as tab}
				<button
					onclick={() => nodePanelStore.setTab(tab)}
					class="flex-1 px-2 py-2 text-xs font-medium capitalize"
					class:text-[#ff6d5a]={nodePanelStore.activeTab === tab}
					class:border-b-2={nodePanelStore.activeTab === tab}
					class:border-[#ff6d5a]={nodePanelStore.activeTab === tab}
					class:text-gray-500={nodePanelStore.activeTab !== tab}
				>
					{tab}
				</button>
			{/each}
		</div>

		<!-- Tab content -->
		<div class="flex-1 overflow-y-auto p-3">
			{#if nodePanelStore.activeTab === 'parameters'}
				<ParametersTab {node} />
			{:else if nodePanelStore.activeTab === 'settings'}
				<SettingsTab {node} />
			{:else if nodePanelStore.activeTab === 'input'}
				<InputOutputTab {node} mode="input" />
			{:else}
				<InputOutputTab {node} mode="output" />
			{/if}
		</div>
	</div>
{/if}
