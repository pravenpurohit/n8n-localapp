<script lang="ts">
	let { open = $bindable(false), title = 'Confirm', message = 'Are you sure?', confirmLabel = 'Confirm', onconfirm, oncancel }: {
		open?: boolean;
		title?: string;
		message?: string;
		confirmLabel?: string;
		onconfirm: () => void;
		oncancel?: () => void;
	} = $props();

	function handleConfirm() {
		open = false;
		onconfirm();
	}

	function handleCancel() {
		open = false;
		oncancel?.();
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onclick={handleCancel}>
		<div class="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-[#252547]" onclick={(e) => e.stopPropagation()}>
			<h2 class="mb-2 text-lg font-semibold">{title}</h2>
			<p class="mb-6 text-sm text-gray-600 dark:text-gray-400">{message}</p>
			<div class="flex justify-end gap-3">
				<button
					onclick={handleCancel}
					class="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#3a3a5c]"
				>
					Cancel
				</button>
				<button
					onclick={handleConfirm}
					class="rounded bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
