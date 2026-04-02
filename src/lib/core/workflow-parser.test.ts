import { describe, it, expect } from 'vitest';
import { parseWorkflowJson, serializeWorkflow, ParseError } from './workflow-parser.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadTestWorkflow(name: string): string {
	return readFileSync(resolve(process.cwd(), `test-data/workflows/${name}`), 'utf-8');
}

describe('workflow-parser', () => {
	describe('parseWorkflowJson', () => {
		it('parses W0_Compile_Then_Run.json without errors', () => {
			const json = loadTestWorkflow('W0_Compile_Then_Run.json');
			const result = parseWorkflowJson(json);

			expect(result.warnings).toEqual([]);
			expect(result.workflow.name).toBe('W0_Compile_Then_Run');
			expect(result.workflow.nodes).toHaveLength(5);
			expect(result.workflow.settings.executionOrder).toBe('v1');
		});

		it('parses W1_Compile_Source_Prompt.json with AI connections', () => {
			const json = loadTestWorkflow('W1_Compile_Source_Prompt.json');
			const result = parseWorkflowJson(json);

			expect(result.warnings).toEqual([]);
			expect(result.workflow.nodes).toHaveLength(10);

			// Verify AI connection types are preserved
			const connections = result.workflow.connections;
			expect(connections['Chat Model']).toBeDefined();
			expect(connections['Chat Model']['ai_languageModel']).toBeDefined();
			expect(connections['Compile Manifest Schema']['ai_outputParser']).toBeDefined();
		});

		it('parses all test workflows without errors', () => {
			const files = [
				'W0_Compile_Then_Run.json',
				'W1_Compile_Source_Prompt.json',
				'W2_Execute_Step.json',
				'W3_Run_Compiled_Graph.json'
			];

			for (const file of files) {
				const json = loadTestWorkflow(file);
				const result = parseWorkflowJson(json);
				expect(result.warnings).toEqual([]);
				expect(result.workflow.nodes.length).toBeGreaterThan(0);
			}
		});

		it('applies defaults for missing optional fields', () => {
			const json = JSON.stringify({
				nodes: [{ id: 'n1', name: 'Test', type: 'n8n-nodes-base.code', position: [0, 0] }],
				connections: {}
			});
			const result = parseWorkflowJson(json);

			expect(result.workflow.active).toBe(false);
			expect(result.workflow.settings).toEqual({});
			expect(result.workflow.tags).toEqual([]);
			expect(result.workflow.pinData).toEqual({});
		});

		it('throws ParseError for missing nodes array', () => {
			expect(() => parseWorkflowJson(JSON.stringify({ connections: {} }))).toThrow(ParseError);
		});

		it('throws ParseError for missing connections object', () => {
			expect(() => parseWorkflowJson(JSON.stringify({ nodes: [] }))).toThrow(ParseError);
		});

		it('throws ParseError for invalid JSON', () => {
			expect(() => parseWorkflowJson('not json')).toThrow(ParseError);
		});

		it('throws ParseError for node missing type', () => {
			const json = JSON.stringify({
				nodes: [{ name: 'Test' }],
				connections: {}
			});
			expect(() => parseWorkflowJson(json)).toThrow(ParseError);
		});

		it('warns on dangling connection source', () => {
			const json = JSON.stringify({
				nodes: [{ id: 'n1', name: 'A', type: 'test', position: [0, 0] }],
				connections: {
					NonExistent: { main: [[{ node: 'A', type: 'main', index: 0 }]] }
				}
			});
			const result = parseWorkflowJson(json);
			expect(result.warnings).toContain('Connection source "NonExistent" not found in nodes');
		});

		it('warns on dangling connection target', () => {
			const json = JSON.stringify({
				nodes: [{ id: 'n1', name: 'A', type: 'test', position: [0, 0] }],
				connections: {
					A: { main: [[{ node: 'Ghost', type: 'main', index: 0 }]] }
				}
			});
			const result = parseWorkflowJson(json);
			expect(result.warnings).toContain('Connection target "Ghost" not found in nodes');
		});
	});

	describe('serializeWorkflow', () => {
		it('produces valid JSON', () => {
			const json = loadTestWorkflow('W0_Compile_Then_Run.json');
			const { workflow } = parseWorkflowJson(json);
			const serialized = serializeWorkflow(workflow);
			expect(() => JSON.parse(serialized)).not.toThrow();
		});

		it('round-trips test workflows preserving key fields', () => {
			const files = [
				'W0_Compile_Then_Run.json',
				'W1_Compile_Source_Prompt.json',
				'W2_Execute_Step.json',
				'W3_Run_Compiled_Graph.json'
			];

			for (const file of files) {
				const json = loadTestWorkflow(file);
				const { workflow: w1 } = parseWorkflowJson(json);
				const serialized = serializeWorkflow(w1);
				const { workflow: w2 } = parseWorkflowJson(serialized);

				// Nodes match
				expect(w2.nodes.length).toBe(w1.nodes.length);
				for (let i = 0; i < w1.nodes.length; i++) {
					expect(w2.nodes[i].id).toBe(w1.nodes[i].id);
					expect(w2.nodes[i].name).toBe(w1.nodes[i].name);
					expect(w2.nodes[i].type).toBe(w1.nodes[i].type);
					expect(w2.nodes[i].typeVersion).toBe(w1.nodes[i].typeVersion);
					expect(w2.nodes[i].position).toEqual(w1.nodes[i].position);
					expect(w2.nodes[i].parameters).toEqual(w1.nodes[i].parameters);
				}

				// Connections match
				expect(w2.connections).toEqual(w1.connections);

				// Settings match
				expect(w2.settings).toEqual(w1.settings);
			}
		});
	});
});
