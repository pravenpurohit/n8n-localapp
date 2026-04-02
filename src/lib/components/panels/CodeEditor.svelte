<script lang="ts">
	let { value = $bindable(''), language = $bindable('javascript'), onchange }: {
		value?: string;
		language?: 'javascript' | 'python';
		onchange?: (value: string) => void;
	} = $props();

	const lineCount = $derived(value.split('\n').length);

	function handleInput(e: Event) {
		value = (e.target as HTMLTextAreaElement).value;
		onchange?.(value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Tab') {
			e.preventDefault();
			const target = e.target as HTMLTextAreaElement;
			const start = target.selectionStart;
			const end = target.selectionEnd;
			value = value.substring(0, start) + '  ' + value.substring(end);
			onchange?.(value);
			requestAnimationFrame(() => {
				target.selectionStart = target.selectionEnd = start + 2;
			});
		}
	}
</script>

<div class="rounded border border-gray-200 dark:border-[#3a3a5c]">
	<!-- Language toggle -->
	<div class="flex border-b border-gray-200 px-2 py-1 dark:border-[#3a3a5c]">
		<button
			onclick={() => language = 'javascript'}
			class="px-2 py-0.5 text-xs"
			class:text-[#ff6d5a]={language === 'javascript'}
			class:font-medium={language === 'javascript'}
		>
			JavaScript
		</button>
		<button
			onclick={() => language = 'python'}
			class="px-2 py-0.5 text-xs"
			class:text-[#ff6d5a]={language === 'python'}
			class:font-medium={language === 'python'}
		>
			Python
		</button>
	</div>

	<!-- Editor -->
	<div class="flex">
		<!-- Line numbers -->
		<div class="select-none border-r border-gray-200 bg-gray-50 px-2 py-2 text-right font-mono text-xs text-gray-400 dark:border-[#3a3a5c] dark:bg-[#252547]">
			{#each Array(lineCount) as _, i}
				<div>{i + 1}</div>
			{/each}
		</div>

		<!-- Code area -->
		<textarea
			{value}
			oninput={handleInput}
			onkeydown={handleKeydown}
			spellcheck="false"
			class="flex-1 resize-none bg-gray-900 p-2 font-mono text-sm text-green-400 outline-none"
			rows={Math.max(lineCount, 10)}
		></textarea>
	</div>
</div>
