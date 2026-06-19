// @ts-check
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import { remarkAdmonitions } from './src/plugins/remark-admonitions.ts';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://jasperhung.dev',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'monokai',
    },
    remarkPlugins: [remarkDirective, remarkAdmonitions],
  },
  vite: {
    plugins: [tailwindcss()]
  }
});