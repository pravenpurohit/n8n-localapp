<script lang="ts">
	import { page } from '$app/stores';
	import { appStore } from '$lib/stores/app.svelte';

	let collapsed = $state(
		typeof localStorage !== 'undefined' ? localStorage.getItem('sidebar-collapsed') === 'true' : false
	);

	interface NavItem {
		label: string;
		href: string;
		icon: string;
		phase2?: boolean;
	}

	const navItems: NavItem[] = [
		{ label: 'Overview', href: '/overview', icon: '🏠' },
		{ label: 'Workflows', href: '/workflows', icon: '⚡' },
		{ label: 'Credentials', href: '/credentials', icon: '🔑' },
		{ label: 'Templates', href: '/templates', icon: '📋' },
		{ label: 'Data Tables', href: '/data-tables', icon: '📊' },
		{ label: 'Executions', href: '/executions', icon: '▶️' },
		{ label: 'Settings', href: '/settings', icon: '⚙️' },
		{ label: 'Variables', href: '/settings/variables', icon: '🔤', phase2: true },
		{ label: 'Insights', href: '/insights', icon: '📈', phase2: true },
		{ label: 'Projects', href: '/projects', icon: '📁', phase2: true },
	];

	function toggleCollapse() {
		collapsed = !collapsed;
		localStorage.setItem('sidebar-collapsed', String(collapsed));
	}

	function isActive(href: string): boolean {
		const path = $page.url.pathname;
		if (href === '/overview') return path === '/overview' || path === '/';
		return path.startsWith(href);
	}
</script>

<nav
	class="flex flex-col border-r border-gray-200 bg-gray-50 dark:border-[#3a3a5c] dark:bg-[#252547] transition-all"
	class:w-16={collapsed}
	class:w-56={!collapsed}
>
	<!-- Instance URL -->
	<div class="flex items-center gap-2 border-b border-gray-200 p-3 dark:border-[#3a3a5c]">
		{#if !collapsed}
			<span class="truncate text-xs text-gray-500 dark:text-gray-400">
				{appStore.config?.n8nBaseUrl ?? 'Not connected'}
			</span>
		{/if}
		<button
			onclick={toggleCollapse}
			class="ml-auto rounded p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-[#3a3a5c]"
			aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
		>
			{collapsed ? '→' : '←'}
		</button>
	</div>

	<!-- Nav items -->
	<div class="flex-1 overflow-y-auto py-2">
		{#each navItems as item}
			{#if item.phase2}
				<div
					class="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed"
					title="Enterprise feature — Phase 2"
				>
					<span class="text-lg">{item.icon}</span>
					{#if !collapsed}
						<span>{item.label}</span>
						<span class="ml-auto text-xs">🔒</span>
					{/if}
				</div>
			{:else}
				<a
					href={item.href}
					class="flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-gray-200 dark:hover:bg-[#3a3a5c]"
					class:bg-gray-200={isActive(item.href)}
					class:text-[#ff6d5a]={isActive(item.href)}
					class:font-medium={isActive(item.href)}
				>
					<span class="text-lg">{item.icon}</span>
					{#if !collapsed}
						<span>{item.label}</span>
					{/if}
				</a>
			{/if}
		{/each}
	</div>
</nav>
