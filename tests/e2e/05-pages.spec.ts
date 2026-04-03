/**
 * Req 5: Global Executions Page
 * Req 7: Credentials Management
 * Req 8: Templates Page
 * Req 12: Local App Settings (theme)
 * Req 14: Connection Status
 * Req 23: Tags Management
 * Req 24: Data Tables Management
 * Req 26: Security Audit
 * Req 29: Left Sidebar Navigation
 * Req 30: Responsive Layout & Theming
 * Phase 2 stubs: Req 9,10,11,13,15,16,17,18,20,22,27,28
 */
import { test, expect } from '@playwright/test';
import { screenshot, gotoWithAuth } from './helpers';

const PAGES: Array<{ path: string; name: string; req: string; skip?: boolean }> = [
	{ path: '/overview', name: 'overview', req: 'Req 2' },
	{ path: '/executions', name: 'executions', req: 'Req 5' },
	{ path: '/credentials', name: 'credentials', req: 'Req 7' },
	{ path: '/templates', name: 'templates', req: 'Req 8', skip: true },
	{ path: '/data-tables', name: 'data-tables', req: 'Req 24' },
	{ path: '/settings', name: 'settings-index', req: 'Req 29' },
	{ path: '/settings/preferences', name: 'settings-preferences', req: 'Req 12' },
	{ path: '/settings/connection', name: 'settings-connection', req: 'Req 14' },
	{ path: '/settings/tags', name: 'settings-tags', req: 'Req 23' },
	{ path: '/settings/audit', name: 'settings-audit', req: 'Req 26' },
	{ path: '/workflows/new', name: 'workflow-new', req: 'Req 37' },
	{ path: '/insights', name: 'stub-insights', req: 'Req 10 (Phase 2)' },
	{ path: '/projects', name: 'stub-projects', req: 'Req 11 (Phase 2)' },
	{ path: '/settings/variables', name: 'stub-variables', req: 'Req 9 (Phase 2)' },
	{ path: '/settings/users', name: 'stub-users', req: 'Req 13 (Phase 2)' },
	{ path: '/settings/ldap', name: 'stub-ldap', req: 'Req 15 (Phase 2)' },
	{ path: '/settings/saml', name: 'stub-saml', req: 'Req 16 (Phase 2)' },
	{ path: '/settings/log-streaming', name: 'stub-log-streaming', req: 'Req 17 (Phase 2)' },
	{ path: '/settings/external-secrets', name: 'stub-external-secrets', req: 'Req 18 (Phase 2)' },
	{ path: '/settings/source-control', name: 'stub-source-control', req: 'Req 20 (Phase 2)' },
];

test.describe('All Pages Render', () => {
	for (const { path, name, req, skip } of PAGES) {
		test(`${req}: ${name} (${path})`, async ({ page }) => {
			if (skip) { test.skip(); return; }
			await gotoWithAuth(page, path);
			await page.waitForTimeout(1000);
			await screenshot(page, `page-${name}`);
		});
	}
});
