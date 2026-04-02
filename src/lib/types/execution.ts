import type { Workflow } from './workflow.js';

export type ExecutionStatus = 'success' | 'error' | 'canceled' | 'running' | 'waiting' | 'new';

export interface ExecutionError {
	message: string;
	stack?: string;
	name?: string;
}

export interface NodeExecutionResult {
	startTime: number;
	executionTime: number;
	data: { main: Array<Array<{ json: Record<string, unknown> }>> };
	error?: ExecutionError;
}

/** Per-node execution data */
export interface ExecutionData {
	resultData: {
		runData: Record<string, NodeExecutionResult[]>;
		error?: ExecutionError;
	};
}

/** Represents a workflow execution */
export interface Execution {
	id: string;
	workflowId: string;
	status: ExecutionStatus;
	startedAt: string;
	stoppedAt: string | null;
	finished: boolean;
	mode: 'manual' | 'trigger' | 'webhook' | 'retry';
	data?: ExecutionData;
	/** Workflow snapshot at execution time (for "Copy to Editor" feature) */
	workflowData?: Workflow;
	retryOf?: string;
	retrySuccessId?: string;
}
