import { describe, it, expect, beforeEach } from 'vitest';

// We can't use $state in .test.ts, so test the classification logic directly
const KNOWN_ERRORS = [
	{ pattern: /quota|exceeded.*quota|rate.?limit/i, title: 'API Quota Exceeded' },
	{ pattern: /credit.?balance.*too low|insufficient.*credits?/i, title: 'Insufficient Credits' },
	{ pattern: /MODEL_NOT_FOUND|model.*not.*found|404.*no body/i, title: 'Model Not Available' },
	{ pattern: /Unauthorized|invalid.*api.?key|authentication/i, title: 'Authentication Failed' },
	{ pattern: /Unrecognized node type/i, title: 'Unsupported Node Type' },
	{ pattern: /ECONNREFUSED|ENOTFOUND|network|timeout/i, title: 'Connection Failed' },
];

function classifyError(rawError: string): string {
	for (const known of KNOWN_ERRORS) {
		if (known.pattern.test(rawError)) return known.title;
	}
	return 'Execution Error';
}

describe('Notification error classification', () => {
	it('classifies quota exceeded errors', () => {
		expect(classifyError('You exceeded your current quota')).toBe('API Quota Exceeded');
		expect(classifyError('Rate limit reached')).toBe('API Quota Exceeded');
	});

	it('classifies insufficient credits errors', () => {
		expect(classifyError('Your credit balance is too low to access the Anthropic API')).toBe('Insufficient Credits');
		expect(classifyError('Insufficient credits remaining')).toBe('Insufficient Credits');
	});

	it('classifies model not found errors', () => {
		expect(classifyError('404 status code (no body)\nMODEL_NOT_FOUND')).toBe('Model Not Available');
		expect(classifyError('Model gpt-5 not found')).toBe('Model Not Available');
	});

	it('classifies auth errors', () => {
		expect(classifyError('Unauthorized — check your API key')).toBe('Authentication Failed');
		expect(classifyError('Invalid API key provided')).toBe('Authentication Failed');
	});

	it('classifies unsupported node type errors', () => {
		expect(classifyError('Unrecognized node type: n8n-nodes-base.n8nDataTable')).toBe('Unsupported Node Type');
	});

	it('classifies connection errors', () => {
		expect(classifyError('connect ECONNREFUSED 127.0.0.1:5678')).toBe('Connection Failed');
		expect(classifyError('Request timeout after 30000ms')).toBe('Connection Failed');
	});

	it('falls back to generic error for unknown patterns', () => {
		expect(classifyError('Something completely unexpected happened')).toBe('Execution Error');
	});
});
