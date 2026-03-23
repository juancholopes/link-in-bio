// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
	adapter: vercel(),
	output: 'static',
	server: {
		host: '127.0.0.1',
		port: 4321,
	},
});
