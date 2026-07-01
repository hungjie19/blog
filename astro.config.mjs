// @ts-check
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import { remarkAdmonitions } from './src/plugins/remark-admonitions.ts';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://jasperhung.dev',
  integrations: [
    expressiveCode({
      themes: ['monokai', 'github-light'],
      useDarkModeMediaQuery: false,
      plugins: [pluginLineNumbers()],
      defaultProps: {
        showLineNumbers: true,
      },
      styleOverrides: {
        borderRadius: '8px',
        borderColor: 'var(--border)',
        frames: {
          frameBoxShadowCssValue: 'none',
        },
      },
    }),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [remarkDirective, remarkAdmonitions],
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
