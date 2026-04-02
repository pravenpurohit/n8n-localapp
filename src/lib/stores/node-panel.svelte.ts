import type { Node as SvelteFlowNode } from '@xyflow/svelte';

type PanelTab = 'parameters' | 'settings' | 'input' | 'output';

class NodePanelStore {
	selectedNode = $state<SvelteFlowNode | null>(null);
	activeTab = $state<PanelTab>('parameters');

	open(node: SvelteFlowNode): void {
		this.selectedNode = node;
		this.activeTab = 'parameters';
	}

	close(): void {
		this.selectedNode = null;
	}

	setTab(tab: PanelTab): void {
		this.activeTab = tab;
	}
}

export const nodePanelStore = new NodePanelStore();
