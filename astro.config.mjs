// @ts-check
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import { remarkAdmonitions } from './src/plugins/remark-admonitions.ts';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://hungjie19.github.io',
  base: '/blog',
  markdown: {
    shikiConfig: {
      theme: 'monokai',
      defaultProps: {
        showLineNumbers: true,
      },
    },
    remarkPlugins: [remarkDirective, remarkAdmonitions],
  },
  vite: {
    plugins: [tailwindcss()]
  }
});