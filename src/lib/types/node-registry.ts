export type NodeCategory =
	| 'Core'
	| 'Actions in an App'
	| 'Data transformation'
	| 'Flow'
	| 'Advanced AI'
	| 'Human in the loop';

export interface PortDefinition {
	/** Port type: "main", "ai_languageModel", "ai_outputParser", "ai_agent", etc. */
	type: string;
	displayName?: string;
	required?: boolean;
}

export interface NodePropertyDefinition {
	displayName: string;
	name: string;
	type: 'string' | 'number' | 'boolean' | 'options' | 'collection' | 'fixedCollection' | 'json' | 'code';
	default?: unknown;
	required?: boolean;
	description?: string;
	options?: Array<{ name: string; value: string | number | boolean }>;
	displayOptions?: { show?: Record<string, unknown[]> };
	typeOptions?: {
		editor?: 'code' | 'json';
		language?: 'javascript' | 'python';
		rows?: number;
		password?: boolean;
	};
}

/** Node type definition for rendering and configuration */
export interface NodeTypeDefinition {
	/** Node type identifier, e.g. "n8n-nodes-base.httpRequest" */
	type: string;
	displayName: string;
	/** Icon identifier or SVG path */
	icon: string;
	category: NodeCategory;
	version: number | number[];
	description: string;
	defaults: { name: string; color?: string };
	inputs: PortDefinition[];
	outputs: PortDefinition[];
	properties: NodePropertyDefinition[];
	credentials?: Array<{ name: string; required: boolean }>;
}
