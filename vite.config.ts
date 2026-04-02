import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		passWithNoTests: true,
		setupFiles: ['src/lib/test/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			include: ['src/lib/**/*.ts'],
			exclude: ['src/lib/test/**', 'src/lib/types/**']
		}
	},
	server: {
		port: 1420,
		strictPort: true
	}
});
