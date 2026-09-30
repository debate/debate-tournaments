import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		threads: true,
		globals: true,
		// The API always runs in UTC (see the dev script and Dockerfile)
		env: { TZ: 'UTC' },
		setupFiles: './tests/setup.js',
		globalSetup: './tests/globalTestSetup.js',
		coverage: {
			include: ['api/**/*.{js,ts,tsx}'],
			exclude: ['**/data/models/**'],
			cleanOnRerun: false,
		},
	},
});
