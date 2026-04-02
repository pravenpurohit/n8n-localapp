import * as tagsApi from '$lib/api/tags';
import type { Tag } from '$lib/types';

class TagsStore {
	tags = $state<Tag[]>([]);

	async load(): Promise<void> {
		this.tags = await tagsApi.listTags();
	}

	async create(name: string): Promise<Tag> {
		const tag = await tagsApi.createTag(name);
		this.tags = [...this.tags, tag];
		return tag;
	}

	async update(id: string, name: string): Promise<void> {
		const updated = await tagsApi.updateTag(id, name);
		this.tags = this.tags.map((t) => (t.id === id ? updated : t));
	}

	async remove(id: string): Promise<void> {
		await tagsApi.deleteTag(id);
		this.tags = this.tags.filter((t) => t.id !== id);
	}
}

export const tagsStore = new TagsStore();
