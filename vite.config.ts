import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
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
		strictPort: true,
		proxy: {
			// Proxy n8n API requests to bypass CORS in browser dev mode
			'/api/v1': {
				target: 'http://localhost:5678',
				changeOrigin: true,
			},
			'/rest': {
				target: 'http://localhost:5678',
				changeOrigin: true,
			},
		},
	}
});
