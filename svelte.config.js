import adapter from '@sveltejs/adapter-node'; // Use Node adapter for WebSocket support
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	extensions: ['.svelte', '.md'],
	preprocess: [mdsvex(mdsvexConfig)],

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		alias: {
			$lib: path.resolve('./src/lib'),
			$client: path.resolve('./src/lib/client'),
			$components: 'src/lib/components',
			$stores: 'src/lib/stores',
			$utils: 'src/lib/utils',
			$types: 'src/lib/types',
			$assets: 'src/lib/assets',
			$routes: 'src/routes',
			$mocks: 'src/lib/mocks',
		}
	}
};

export default config;
