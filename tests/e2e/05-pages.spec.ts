import { test, expect } from '@playwright/test';
import { screenshot, gotoWithAuth } from './helpers';

const PAGES: Array<{ path: string; name: string; skip?: boolean }> = [
	{ path: '/overview', name: 'overview' },
	{ path: '/executions', name: 'executions' },
	{ path: '/credentials', name: 'credentials' },
	{ path: '/templates', name: 'templates', skip: true }, // External API (n8n.io) — may fail in CI
	{ path: '/data-tables', name: 'data-tables' },
	{ path: '/settings', name: 'settings-index' },
	{ path: '/settings/preferences', name: 'settings-preferences' },
	{ path: '/settings/connection', name: 'settings-connection' },
	{ path: '/settings/tags', name: 'settings-tags' },
	{ path: '/settings/audit', name: 'settings-audit' },
	{ path: '/workflows/new', name: 'workflow-new' },
	{ path: '/insights', name: 'stub-insights' },
	{ path: '/projects', name: 'stub-projects' },
	{ path: '/settings/variables', name: 'stub-variables' },
	{ path: '/settings/users', name: 'stub-users' },
	{ path: '/settings/ldap', name: 'stub-ldap' },
	{ path: '/settings/saml', name: 'stub-saml' },
	{ path: '/settings/log-streaming', name: 'stub-log-streaming' },
	{ path: '/settings/external-secrets', name: 'stub-external-secrets' },
	{ path: '/settings/source-control', name: 'stub-source-control' },
];

test.describe('All Pages', () => {
	for (const { path, name, skip } of PAGES) {
		test(`renders ${name} (${path})`, async ({ page }) => {
			if (skip) { test.skip(); return; }
			await gotoWithAuth(page, path);
			await page.waitForTimeout(1000);
			await screenshot(page, `page-${name}`);
		});
	}
});
