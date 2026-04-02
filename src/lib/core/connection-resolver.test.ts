import { describe, it, expect } from 'vitest';
import { validateConnections, getConnectionType } from './connection-resolver.js';
import type { WorkflowNode, WorkflowConnections } from '$lib/types';

function makeNode(name: string, type = 'n8n-nodes-base.code'): WorkflowNode {
	return {
		id: name,
		name,
		type,
		typeVersion: 1,
		position: [0, 0],
		parameters: {}
	};
}

describe('connection-resolver', () => {
	describe('validateConnections', () => {
		it('returns valid for correct connections', () => {
			const nodes = [makeNode('A'), makeNode('B')];
			const connections: WorkflowConnections = {
				A: { main: [[{ node: 'B', type: 'main', index: 0 }]] }
			};
			const result = validateConnections(nodes, connections);
			expect(result.valid).toBe(true);
			expect(result.warnings).toEqual([]);
		});

		it('warns on dangling source', () => {
			const nodes = [makeNode('A')];
			const connections: WorkflowConnections = {
				Ghost: { main: [[{ node: 'A', type: 'main', index: 0 }]] }
			};
			const result = validateConnections(nodes, connections);
			expect(result.valid).toBe(false);
			expect(result.warnings).toContain('Connection source "Ghost" not found in nodes');
		});

		it('warns on dangling target', () => {
			const nodes = [makeNode('A')];
			const connections: WorkflowConnections = {
				A: { main: [[{ node: 'Ghost', type: 'main', index: 0 }]] }
			};
			const result = validateConnections(nodes, connections);
			expect(result.valid).toBe(false);
			expect(result.warnings.some((w) => w.includes('Ghost'))).toBe(true);
		});

		it('warns on unknown connection type', () => {
			const nodes = [makeNode('A'), makeNode('B')];
			const connections: WorkflowConnections = {
				A: { unknown_type: [[{ node: 'B', type: 'unknown_type', index: 0 }]] }
			};
			const result = validateConnections(nodes, connections);
			expect(result.warnings.some((w) => w.includes('Unknown connection type'))).toBe(true);
		});

		it('validates AI connection types', () => {
			const nodes = [
				makeNode('Model', '@n8n/n8n-nodes-langchain.lmChatOpenAi'),
				makeNode('Chain', '@n8n/n8n-nodes-langchain.chainLlm')
			];
			const connections: WorkflowConnections = {
				Model: {
					ai_languageModel: [[{ node: 'Chain', type: 'ai_languageModel', index: 0 }]]
				}
			};
			const result = validateConnections(nodes, connections);
			expect(result.valid).toBe(true);
		});

		it('handles empty connections', () => {
			const nodes = [makeNode('A')];
			const result = validateConnections(nodes, {});
			expect(result.valid).toBe(true);
		});
	});

	describe('getConnectionType', () => {
		it('returns ai_languageModel for chat model sources', () => {
			expect(
				getConnectionType(
					'@n8n/n8n-nodes-langchain.lmChatOpenAi',
					'@n8n/n8n-nodes-langchain.chainLlm'
				)
			).toBe('ai_languageModel');
		});

		it('returns ai_outputParser for output parser sources', () => {
			expect(
				getConnectionType(
					'@n8n/n8n-nodes-langchain.outputParserStructured',
					'@n8n/n8n-nodes-langchain.chainLlm'
				)
			).toBe('ai_outputParser');
		});

		it('returns main for standard node connections', () => {
			expect(getConnectionType('n8n-nodes-base.code', 'n8n-nodes-base.set')).toBe('main');
		});
	});
});
