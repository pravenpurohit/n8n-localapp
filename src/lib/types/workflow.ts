/** Reference to a credential from a node */
export interface NodeCredentialRef {
	id: string;
	name: string;
}

/** A single node within a workflow */
export interface WorkflowNode {
	id: string;
	name: string;
	/** Node type identifier, e.g. "n8n-nodes-base.httpRequest" */
	type: string;
	typeVersion: number;
	/** [x, y] canvas coordinates */
	position: [number, number];
	parameters: Record<string, unknown>;
	credentials?: Record<string, NodeCredentialRef>;
	disabled?: boolean;
	notes?: string;
	retryOnFail?: boolean;
	continueOnFail?: boolean;
	alwaysOutputData?: boolean;
	executeOnce?: boolean;
}

/** Connection map: sourceNode → outputType → outputIndex → ConnectionTarget[] */
export type WorkflowConnections = Record<string, Record<string, ConnectionTarget[][]>>;

export interface ConnectionTarget {
	/** Target node name */
	node: string;
	/** Connection type: "main", "ai_languageModel", "ai_outputParser", etc. */
	type: string;
	/** Target input index */
	index: number;
}

/** Workflow-level settings */
export interface WorkflowSettings {
	executionOrder?: 'v0' | 'v1';
	errorWorkflow?: string;
	callerPolicy?: 'any' | 'none' | 'workflowsFromAList';
	callerIds?: string;
	timezone?: string;
	saveDataErrorExecution?: 'all' | 'none';
	saveDataSuccessExecution?: 'all' | 'none';
	saveManualExecutions?: boolean;
	saveExecutionProgress?: boolean;
	executionTimeout?: number;
	timeSavedUnit?: 'hours' | 'minutes' | 'seconds';
	timeSavedValue?: number;
}

/** Tag applied to workflows */
export interface Tag {
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}

/** Represents a complete n8n workflow */
export interface Workflow {
	id: string;
	name: string;
	active: boolean;
	/** Required for optimistic concurrency on PUT requests */
	versionId: string;
	nodes: WorkflowNode[];
	connections: WorkflowConnections;
	settings: WorkflowSettings;
	staticData: unknown | null;
	tags: Tag[];
	pinData: Record<string, unknown[]>;
	/** ISO 8601 timestamp */
	createdAt: string;
	/** ISO 8601 timestamp */
	updatedAt: string;
}
