<script lang="ts">
	import { themeStore } from '$lib/stores/theme.svelte';
	import { appStore } from '$lib/stores/app.svelte';
</script>

<div class="p-6">
	<h1 class="mb-6 text-2xl font-semibold">Preferences</h1>

	<div class="max-w-md space-y-6">
		<div>
			<label class="mb-2 block text-sm font-medium">Theme</label>
			<div class="flex gap-2">
				{#each ['light', 'dark', 'system'] as theme}
					<button
						onclick={() => themeStore.setTheme(theme as 'light' | 'dark' | 'system')}
						class="rounded-lg border px-4 py-2 text-sm capitalize"
						class:border-[#ff6d5a]={themeStore.theme === theme}
						class:bg-[#ff6d5a]/10={themeStore.theme === theme}
						class:text-[#ff6d5a]={themeStore.theme === theme}
						class:border-gray-200={themeStore.theme !== theme}
						class:dark:border-[#3a3a5c]={themeStore.theme !== theme}
					>
						{theme}
					</button>
				{/each}
			</div>
		</div>

		<div>
			<label class="mb-2 block text-sm font-medium">Connected Instance</label>
			<p class="rounded bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-[#252547] dark:text-gray-400">
				{appStore.config?.n8nBaseUrl ?? 'Not configured'}
			</p>
		</div>
	</div>
</div>
