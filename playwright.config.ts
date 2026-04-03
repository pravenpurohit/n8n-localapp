import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

// Load .env for n8n API key
config();

export default defineConfig({
	testDir: './tests/e2e',
	outputDir: './test-results/artifacts',
	globalSetup: './tests/e2e/global-setup.ts',
	fullyParallel: false,
	workers: 1, // sequential — tests share n8n state
	retries: 0,
	timeout: 60_000,
	expect: {
		timeout: 10_000,
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.02,
		},
	},
	use: {
		baseURL: 'http://localhost:1420',
		headless: false,
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
	webServer: {
		command: 'npm run dev',
		url: 'http://localhost:1420',
		reuseExistingServer: true,
		timeout: 30_000,
	},
});
