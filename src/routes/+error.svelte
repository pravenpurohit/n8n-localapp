<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex h-full items-center justify-center p-6">
	<div class="text-center">
		<h1 class="mb-2 text-4xl font-bold text-gray-300">{$page.status}</h1>
		<p class="mb-4 text-gray-500">{$page.error?.message ?? 'Something went wrong'}</p>
		<a href="/overview" class="rounded bg-[#ff6d5a] px-4 py-2 text-sm font-medium text-white hover:bg-[#e55a48]">
			Go to Overview
		</a>
	</div>
</div>
