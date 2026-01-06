// mdsvex.config.js
import { defineMDSveXConfig } from 'mdsvex';

const config = defineMDSveXConfig({
  extensions: ['.svelte.md', '.md', '.svx'],
  smartypants: {
    dashes: 'oldschool'
  },
  layout: {
    _: './src/lib/mdsvex.svelte' // default layout for all MD
  }
});

export default config;