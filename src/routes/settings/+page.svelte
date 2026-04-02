<script lang="ts">
	const settingsLinks = [
		{ label: 'Preferences', href: '/settings/preferences', icon: '🎨', description: 'Theme and display settings' },
		{ label: 'Connection', href: '/settings/connection', icon: '🔗', description: 'n8n instance connection' },
		{ label: 'Tags', href: '/settings/tags', icon: '🏷️', description: 'Manage workflow tags' },
		{ label: 'Security Audit', href: '/settings/audit', icon: '🛡️', description: 'Run security audit' },
	];

	const phase2Links = [
		{ label: 'Users', icon: '👥' },
		{ label: 'LDAP', icon: '📂' },
		{ label: 'SAML/SSO', icon: '🔐' },
		{ label: 'Log Streaming', icon: '📡' },
		{ label: 'External Secrets', icon: '🗝️' },
		{ label: 'Source Control', icon: '📦' },
	];
</script>

<div class="p-6">
	<h1 class="mb-6 text-2xl font-semibold">Settings</h1>

	<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
		{#each settingsLinks as link}
			<a
				href={link.href}
				class="rounded-lg border border-gray-200 p-4 hover:shadow-md dark:border-[#3a3a5c]"
			>
				<div class="flex items-center gap-3">
					<span class="text-2xl">{link.icon}</span>
					<div>
						<div class="text-sm font-medium">{link.label}</div>
						<div class="text-xs text-gray-400">{link.description}</div>
					</div>
				</div>
			</a>
		{/each}

		{#each phase2Links as link}
			<div class="rounded-lg border border-gray-200 p-4 opacity-50 dark:border-[#3a3a5c]">
				<div class="flex items-center gap-3">
					<span class="text-2xl">{link.icon}</span>
					<div>
						<div class="text-sm font-medium">{link.label}</div>
						<div class="text-xs text-gray-400">Enterprise feature — Phase 2</div>
					</div>
					<span class="ml-auto">🔒</span>
				</div>
			</div>
		{/each}
	</div>
</div>
