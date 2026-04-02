import { describe, it, expect } from 'vitest';
import { findExpressions, extractReferencedNodes } from './expression-parser.js';

describe('expression-parser', () => {
	describe('findExpressions', () => {
		it('finds $json references', () => {
			const refs = findExpressions('={{ $json.fieldName }}');
			expect(refs).toHaveLength(1);
			expect(refs[0].type).toBe('json');
			expect(refs[0].referencedField).toBe('fieldName');
		});

		it('finds $("NodeName") references', () => {
			const refs = findExpressions("={{ $('Build Compile Request').first().json }}");
			expect(refs).toHaveLength(1);
			expect(refs[0].type).toBe('node_ref');
			expect(refs[0].referencedNode).toBe('Build Compile Request');
		});

		it('finds $("NodeName").first().json.field references', () => {
			const refs = findExpressions("={{ $('MyNode').first().json.myField }}");
			expect(refs).toHaveLength(1);
			expect(refs[0].type).toBe('node_ref');
			expect(refs[0].referencedNode).toBe('MyNode');
			expect(refs[0].referencedField).toBe('myField');
		});

		it('finds $vars references', () => {
			const refs = findExpressions('={{ $vars.apiKey }}');
			expect(refs).toHaveLength(1);
			expect(refs[0].type).toBe('vars');
			expect(refs[0].referencedField).toBe('apiKey');
		});

		it('classifies $workflow references', () => {
			const refs = findExpressions('={{ $workflow.id }}');
			expect(refs).toHaveLength(1);
			expect(refs[0].type).toBe('workflow');
		});

		it('classifies $execution references', () => {
			const refs = findExpressions('={{ $execution.id }}');
			expect(refs).toHaveLength(1);
			expect(refs[0].type).toBe('execution');
		});

		it('classifies complex expressions', () => {
			const refs = findExpressions('={{ JSON.stringify($json) }}');
			expect(refs).toHaveLength(1);
			expect(refs[0].type).toBe('complex');
		});

		it('finds multiple expressions in one string', () => {
			const refs = findExpressions('Hello ={{ $json.name }} world ={{ $vars.key }}');
			expect(refs).toHaveLength(2);
			expect(refs[0].type).toBe('json');
			expect(refs[1].type).toBe('vars');
		});

		it('returns empty for non-string values', () => {
			expect(findExpressions(42)).toEqual([]);
			expect(findExpressions(null)).toEqual([]);
			expect(findExpressions(undefined)).toEqual([]);
			expect(findExpressions(true)).toEqual([]);
		});

		it('returns empty for strings without expressions', () => {
			expect(findExpressions('plain text')).toEqual([]);
			expect(findExpressions('')).toEqual([]);
		});

		it('recursively searches objects', () => {
			const refs = findExpressions({
				a: '={{ $json.x }}',
				b: { c: '={{ $vars.y }}' }
			});
			expect(refs).toHaveLength(2);
		});

		it('recursively searches arrays', () => {
			const refs = findExpressions(['={{ $json.a }}', '={{ $json.b }}']);
			expect(refs).toHaveLength(2);
		});

		it('finds expressions in real workflow parameters', () => {
			// From W1 "Compile Prompt Graph" node
			const params = {
				promptType: 'define',
				text: '={{ $json.compileUserPrompt }}',
				hasOutputParser: true,
				messages: {
					messageValues: [
						{
							message: '={{ $json.compileSystemPrompt }}',
							type: 'systemMessage'
						}
					]
				}
			};
			const refs = findExpressions(params);
			expect(refs).toHaveLength(2);
			expect(refs.every((r) => r.type === 'json')).toBe(true);
		});
	});

	describe('extractReferencedNodes', () => {
		it('extracts node names from parameters', () => {
			const params = {
				code: "return $('NodeA').first().json.value + $('NodeB').first().json.other;"
			};
			// Note: these are inside JS code strings, not ={{ }} expressions
			// extractReferencedNodes only finds ={{ }} patterns
			expect(extractReferencedNodes(params)).toEqual([]);
		});

		it('extracts node names from expression parameters', () => {
			const params = {
				value: "={{ $('Execute Sub-workflow Trigger').first().json.runId }}"
			};
			const nodes = extractReferencedNodes(params);
			expect(nodes).toEqual(['Execute Sub-workflow Trigger']);
		});

		it('deduplicates referenced nodes', () => {
			const params = {
				a: "={{ $('NodeA').first().json.x }}",
				b: "={{ $('NodeA').first().json.y }}"
			};
			const nodes = extractReferencedNodes(params);
			expect(nodes).toEqual(['NodeA']);
		});

		it('returns empty for parameters without node references', () => {
			const params = {
				value: '={{ $json.field }}',
				other: 'plain text'
			};
			expect(extractReferencedNodes(params)).toEqual([]);
		});
	});
});
