/**
 * Playwright global setup: runs once before all test files.
 * Cleans stale artifacts from previous runs so test-results/ only contains current run data.
 */

import { rmSync, mkdirSync } from 'fs';

export default function globalSetup() {
	// Clean stale failure artifacts
	rmSync('test-results/artifacts', { recursive: true, force: true });
	mkdirSync('test-results/artifacts', { recursive: true });

	// Clean old screenshots
	rmSync('test-results/screenshots', { recursive: true, force: true });
	mkdirSync('test-results/screenshots', { recursive: true });

	// Clean old HTML report
	rmSync('test-results/visual-report', { recursive: true, force: true });

	console.log('Cleaned stale test artifacts from previous runs');
}
