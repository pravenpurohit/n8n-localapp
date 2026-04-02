/**
 * E2E Test: All Phase 1 Pages
 * Navigates to every page and screenshots it.
 */

import { test, expect } from '@playwright/test';
import { screenshot } from './helpers';

const PAGES = [
	{ path: '/overview', name: 'overview' },
	{ path: '/executions', name: 'executions' },
	{ path: '/credentials', name: 'credentials' },
	{ path: '/templates', name: 'templates' },
	{ path: '/data-tables', name: 'data-tables' },
	{ path: '/settings', name: 'settings-index' },
	{ path: '/settings/preferences', name: 'settings-preferences' },
	{ path: '/settings/connection', name: 'settings-connection' },
	{ path: '/settings/tags', name: 'settings-tags' },
	{ path: '/settings/audit', name: 'settings-audit' },
	{ path: '/workflows/new', name: 'workflow-new' },
	// Phase 2 stubs
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
	for (const { path, name } of PAGES) {
		test(`renders ${name} (${path})`, async ({ page }) => {
			await page.goto(path);
			await page.waitForLoadState('networkidle');
			await page.waitForTimeout(1000);
			await screenshot(page, `page-${name}`);

			// Page should not show an unhandled error
			const errorText = await page.locator('text=Something went wrong').isVisible().catch(() => false);
			expect(errorText).toBeFalsy();
		});
	}
});
