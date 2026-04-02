<script lang="ts">
	let { name, color = '#ff6d5a' }: { name: string; color?: string } = $props();
</script>

<span
	class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
	style="background-color: {color}20; color: {color};"
>
	{name}
</span>
