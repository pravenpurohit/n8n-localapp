/** Represents a single expression reference found in a value */
export interface ExpressionRef {
	/** Full expression text including ={{ }} */
	raw: string;
	/** Expression body without ={{ }} */
	inner: string;
	/** Classification of the expression */
	type: 'json' | 'node_ref' | 'vars' | 'workflow' | 'execution' | 'complex';
	/** For $('NodeName') references */
	referencedNode?: string;
	/** For .json.fieldName or $vars.key references */
	referencedField?: string;
}

const EXPRESSION_REGEX = /=\{\{(.+?)\}\}/gs;
const JSON_REF_REGEX = /^\s*\$json\.(\w+)\s*$/;
const NODE_REF_REGEX = /^\s*\$\('([^']+)'\)\.first\(\)\.json(?:\.(\w+))?\s*$/;
const VARS_REF_REGEX = /^\s*\$vars\.(\w+)\s*$/;
const WORKFLOW_REF_REGEX = /^\s*\$workflow\b/;
const EXECUTION_REF_REGEX = /^\s*\$execution\b/;

/**
 * Find all ={{ ... }} expressions in a value.
 * Recursively searches strings, arrays, and objects.
 */
export function findExpressions(value: unknown): ExpressionRef[] {
	if (typeof value === 'string') {
		return findExpressionsInString(value);
	}
	if (Array.isArray(value)) {
		return value.flatMap((v) => findExpressions(v));
	}
	if (value && typeof value === 'object') {
		return Object.values(value).flatMap((v) => findExpressions(v));
	}
	return [];
}

function findExpressionsInString(str: string): ExpressionRef[] {
	const refs: ExpressionRef[] = [];
	// Reset lastIndex since we use the 'g' flag
	EXPRESSION_REGEX.lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = EXPRESSION_REGEX.exec(str)) !== null) {
		const inner = match[1].trim();
		refs.push(classifyExpression(match[0], inner));
	}
	return refs;
}

function classifyExpression(raw: string, inner: string): ExpressionRef {
	let m: RegExpExecArray | null;

	if ((m = JSON_REF_REGEX.exec(inner))) {
		return { raw, inner, type: 'json', referencedField: m[1] };
	}
	if ((m = NODE_REF_REGEX.exec(inner))) {
		return { raw, inner, type: 'node_ref', referencedNode: m[1], referencedField: m[2] };
	}
	if ((m = VARS_REF_REGEX.exec(inner))) {
		return { raw, inner, type: 'vars', referencedField: m[1] };
	}
	if (WORKFLOW_REF_REGEX.test(inner)) {
		return { raw, inner, type: 'workflow' };
	}
	if (EXECUTION_REF_REGEX.test(inner)) {
		return { raw, inner, type: 'execution' };
	}
	return { raw, inner, type: 'complex' };
}

/**
 * Walk all parameter values recursively and collect unique referenced node names
 * from $('NodeName') expression patterns.
 */
export function extractReferencedNodes(parameters: Record<string, unknown>): string[] {
	const nodes = new Set<string>();

	function walk(value: unknown): void {
		if (typeof value === 'string') {
			for (const ref of findExpressionsInString(value)) {
				if (ref.referencedNode) nodes.add(ref.referencedNode);
			}
		} else if (Array.isArray(value)) {
			value.forEach(walk);
		} else if (value && typeof value === 'object') {
			Object.values(value).forEach(walk);
		}
	}

	walk(parameters);
	return [...nodes];
}
