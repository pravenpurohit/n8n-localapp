import type { NodeTypeDefinition, NodeCategory } from '$lib/types';
import { logger } from './logger.js';
import staticRegistryData from '../../static/node-registry.json';

const staticRegistry = staticRegistryData as unknown as NodeTypeDefinition[];

/**
 * Registry of n8n node type definitions.
 * Loads bundled static JSON first, then optionally fetches from a running n8n instance.
 * Uses Svelte 5 runes for reactivity.
 */
class NodeTypeRegistry {
	private types = $state<Map<string, NodeTypeDefinition>>(new Map());
	private _loaded = $state<boolean>(false);

	get loaded(): boolean {
		return this._loaded;
	}

	/**
	 * Initialize the registry: load bundled static JSON first,
	 * then attempt to fetch from /rest/nodes on the n8n instance.
	 */
	async initialize(fetchFn?: () => Promise<NodeTypeDefinition[]>): Promise<void> {
		// Load bundled static registry
		for (const def of staticRegistry) {
			const versions = Array.isArray(def.version) ? def.version : [def.version];
			for (const v of versions) {
				this.types.set(this.key(def.type, v), def);
			}
		}
		this._loaded = true;

		// Attempt to fetch from n8n instance for latest definitions
		if (fetchFn) {
			try {
				const response = await fetchFn();
				for (const def of response) {
					const versions = Array.isArray(def.version) ? def.version : [def.version];
					for (const v of versions) {
						this.types.set(this.key(def.type, v), def);
					}
				}
				logger.info('node-registry', `Loaded ${response.length} node types from n8n instance`);
			} catch {
				logger.warn(
					'node-registry',
					'Could not fetch node types from n8n instance, using bundled registry'
				);
			}
		}
	}

	/**
	 * Look up a node type definition by type identifier and optional version.
	 * If no version specified, returns the highest version available.
	 */
	get(type: string, version?: number): NodeTypeDefinition | undefined {
		if (version !== undefined) {
			return this.types.get(this.key(type, version));
		}
		// Find highest version for this type
		let best: NodeTypeDefinition | undefined;
		let bestVersion = -1;
		for (const def of this.types.values()) {
			if (def.type === type) {
				const v = Array.isArray(def.version) ? Math.max(...def.version) : def.version;
				if (v > bestVersion) {
					best = def;
					bestVersion = v;
				}
			}
		}
		return best;
	}

	/** Filter node types by category */
	getByCategory(category: NodeCategory): NodeTypeDefinition[] {
		const seen = new Set<string>();
		const results: NodeTypeDefinition[] = [];
		for (const def of this.types.values()) {
			if (def.category === category && !seen.has(def.type)) {
				seen.add(def.type);
				results.push(def);
			}
		}
		return results;
	}

	/** Fuzzy search on displayName and type identifier */
	search(query: string): NodeTypeDefinition[] {
		const q = query.toLowerCase();
		const seen = new Set<string>();
		const results: NodeTypeDefinition[] = [];
		for (const def of this.types.values()) {
			if (
				!seen.has(def.type) &&
				(def.displayName.toLowerCase().includes(q) || def.type.toLowerCase().includes(q))
			) {
				seen.add(def.type);
				results.push(def);
			}
		}
		return results;
	}

	private key(type: string, version: number): string {
		return `${type}@${version}`;
	}
}

export const nodeRegistry = new NodeTypeRegistry();
export { NodeTypeRegistry };
