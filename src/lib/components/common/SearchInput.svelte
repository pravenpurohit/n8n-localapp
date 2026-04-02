<script lang="ts">
	let { value = $bindable(''), placeholder = 'Search...', onchange }: {
		value?: string;
		placeholder?: string;
		onchange?: (value: string) => void;
	} = $props();

	let timeout: ReturnType<typeof setTimeout>;

	function handleInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		value = val;
		clearTimeout(timeout);
		timeout = setTimeout(() => onchange?.(val), 300);
	}
</script>

<div class="relative">
	<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
	<input
		type="text"
		{placeholder}
		{value}
		oninput={handleInput}
		class="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#ff6d5a] dark:border-[#3a3a5c] dark:bg-[#252547]"
	/>
</div>
