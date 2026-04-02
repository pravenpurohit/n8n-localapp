import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests/e2e',
	outputDir: './test-results/artifacts',
	fullyParallel: false, // sequential — tests share n8n state
	retries: 0,
	timeout: 60_000,
	expect: {
		timeout: 10_000,
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.02, // 2% diff threshold
		},
	},
	use: {
		baseURL: 'http://localhost:5173', // SvelteKit dev server
		headless: false, // headed mode for visual debugging
		screenshot: 'on',
		trace: 'on-first-retry',
		video: 'retain-on-failure',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
	reporter: [
		['html', { outputFolder: 'test-results/visual-report', open: 'never' }],
		['list'],
	],
	/* Start SvelteKit dev server before tests */
	webServer: {
		command: 'npm run dev',
		url: 'http://localhost:5173',
		reuseExistingServer: true,
		timeout: 30_000,
	},
});
