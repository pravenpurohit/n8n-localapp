<script lang="ts">
	import { createCredential, getCredentialSchema } from '$lib/api/credentials';
	import { credentialsStore } from '$lib/stores/credentials.svelte';
	import type { CredentialSchemaField } from '$lib/types';

	let { open = $bindable(true) }: { open?: boolean } = $props();

	let name = $state('');
	let type = $state('');
	let schema = $state<CredentialSchemaField[]>([]);
	let values = $state<Record<string, unknown>>({});
	let testResult = $state<{ success: boolean } | null>(null);
	let loading = $state(false);

	async function loadSchema() {
		if (!type) return;
		try {
			const s = await getCredentialSchema(type);
			schema = s.properties;
			values = {};
			for (const field of schema) {
				if (field.default !== undefined) values[field.name] = field.default;
			}
		} catch {
			schema = [];
		}
	}

	async function handleSave() {
		loading = true;
		try {
			await createCredential({ name, type, data: values });
			await credentialsStore.load();
			open = false;
		} finally {
			loading = false;
		}
	}

	async function handleTest() {
		testResult = null;
		// Test requires an existing credential — save first if needed
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onclick={() => open = false}>
		<div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-[#252547]" onclick|stopPropagation>
			<h2 class="mb-4 text-lg font-semibold">New Credential</h2>

			<div class="mb-3">
				<label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Name</label>
				<input bind:value={name} class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#1a1a2e]" />
			</div>

			<div class="mb-3">
				<label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Type</label>
				<input
					bind:value={type}
					onblur={loadSchema}
					placeholder="e.g. httpBasicAuth"
					class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#1a1a2e]"
				/>
			</div>

			{#each schema as field}
				<div class="mb-3">
					<label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
						{field.displayName}
						{#if field.required}<span class="text-red-400">*</span>{/if}
					</label>
					{#if field.typeOptions?.password}
						<input type="password" bind:value={values[field.name]} class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#1a1a2e]" />
					{:else}
						<input type="text" bind:value={values[field.name]} class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-[#3a3a5c] dark:bg-[#1a1a2e]" />
					{/if}
				</div>
			{/each}

			<div class="mt-4 flex justify-end gap-3">
				<button onclick={() => open = false} class="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400">Cancel</button>
				<button onclick={handleSave} disabled={loading} class="rounded bg-[#ff6d5a] px-4 py-2 text-sm font-medium text-white hover:bg-[#e55a48] disabled:opacity-50">
					{loading ? 'Saving...' : 'Save'}
				</button>
			</div>
		</div>
	</div>
{/if}
