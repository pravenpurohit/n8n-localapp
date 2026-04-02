/**
 * Generate LLM provider variants of W1 and W2 test workflows.
 *
 * Usage: npx tsx scripts/generate-llm-variants.ts
 *
 * Creates variants for: OpenAI (original), Gemini, Claude, Groq
 * Only W1 and W2 contain LLM nodes. W0 and W3 are orchestrators with no LLM nodes.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface LlmProvider {
	suffix: string;
	nodeType: string;
	modelParam: Record<string, unknown>;
	credentialName: string;
	idPrefix: string;
}

const providers: LlmProvider[] = [
	{
		suffix: 'Gemini',
		nodeType: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
		modelParam: { modelName: 'models/gemini-1.5-pro', options: {} },
		credentialName: 'googleGeminiApi',
		idPrefix: 'g',
	},
	{
		suffix: 'Claude',
		nodeType: '@n8n/n8n-nodes-langchain.lmChatAnthropic',
		modelParam: { model: 'claude-sonnet-4-20250514', options: {} },
		credentialName: 'anthropicApi',
		idPrefix: 'c',
	},
	{
		suffix: 'Groq',
		nodeType: '@n8n/n8n-nodes-langchain.lmChatGroq',
		modelParam: { model: 'llama-3.3-70b-versatile', options: {} },
		credentialName: 'groqApi',
		idPrefix: 'q',
	},
];

const workflowDir = join(import.meta.dirname ?? '.', '..', 'test-data', 'workflows');

function generateVariant(sourceFile: string, provider: LlmProvider): void {
	const source = JSON.parse(readFileSync(join(workflowDir, sourceFile), 'utf-8'));
	const baseName = source.name;

	// Update workflow name
	source.name = `${baseName}_${provider.suffix}`;

	// Update node IDs to avoid collisions
	const idMap = new Map<string, string>();
	for (const node of source.nodes) {
		const oldId = node.id;
		const newId = oldId.replace(/^(w\d+)-/, `$1${provider.idPrefix}-`);
		idMap.set(oldId, newId);
		node.id = newId;
	}

	// Find and replace the Chat Model node
	for (const node of source.nodes) {
		if (node.type === '@n8n/n8n-nodes-langchain.lmChatOpenAi') {
			node.type = provider.nodeType;
			node.parameters = { ...provider.modelParam };
			node.name = `Chat Model (${provider.suffix})`;
		}
	}

	// Update connection references for renamed Chat Model
	const connections = source.connections;
	if (connections['Chat Model']) {
		connections[`Chat Model (${provider.suffix})`] = connections['Chat Model'];
		delete connections['Chat Model'];
	}

	const outName = sourceFile.replace('.json', `_${provider.suffix}.json`);
	writeFileSync(join(workflowDir, outName), JSON.stringify(source, null, 2) + '\n');
	console.log(`  Created ${outName}`);
}

// Generate variants for W1 and W2
for (const file of ['W1_Compile_Source_Prompt.json', 'W2_Execute_Step.json']) {
	console.log(`Generating variants for ${file}:`);
	for (const provider of providers) {
		generateVariant(file, provider);
	}
}

console.log('\nDone. 6 variant files created.');
