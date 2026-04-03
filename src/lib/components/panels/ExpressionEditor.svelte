<script lang="ts">
	import { findExpressions } from '$lib/core/expression-parser';

	let { value = $bindable(''), onchange }: {
		value?: string;
		onchange?: (value: string) => void;
	} = $props();

	const expressions = $derived(findExpressions(value));
	const hasError = $derived(
		value.includes('={{') && !value.includes('}}')
	);

	const suggestions = [
		'$json.',
		"$('NodeName').first().json.",
		'$vars.',
		'$workflow.',
		'$execution.',
	];

	let showSuggestions = $state(false);

	function handleInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		value = val;
		showSuggestions = val.includes('={{') && val.endsWith('.');
		onchange?.(val);
	}

	function insertSuggestion(s: string) {
		const idx = value.lastIndexOf('={{');
		if (idx >= 0) {
			value = value.substring(0, idx) + '={{ ' + s + ' }}';
		}
		showSuggestions = false;
		onchange?.(value);
	}
</script>

<div class="relative">
	<input
		type="text"
		{value}
		oninput={handleInput}
		onfocus={() => showSuggestions = value.includes('={{')}
		onblur={() => setTimeout(() => showSuggestions = false, 200)}
		class="w-full rounded border px-2 py-1.5 font-mono text-sm dark:bg-[#252547] {hasError ? 'border-red-400' : 'border-gray-200 dark:border-[#3a3a5c]'}"
		placeholder={'={{ $json.field }}'}
	/>

	{#if expressions.length > 0}
		<div class="mt-1 text-xs text-gray-400">
			{expressions.length} expression{expressions.length > 1 ? 's' : ''} found
		</div>
	{/if}

	{#if showSuggestions}
		<div class="absolute left-0 top-full z-10 mt-1 w-full rounded border border-gray-200 bg-white shadow-lg dark:border-[#3a3a5c] dark:bg-[#252547]">
			{#each suggestions as s}
				<button
					onclick={() => insertSuggestion(s)}
					class="block w-full px-3 py-1.5 text-left font-mono text-xs hover:bg-gray-100 dark:hover:bg-[#3a3a5c]"
				>
					{s}
				</button>
			{/each}
		</div>
	{/if}
</div>
