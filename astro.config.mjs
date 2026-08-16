// @ts-check
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import { remarkAdmonitions } from './src/plugins/remark-admonitions.ts';
import { rehypeFigureCaption } from './src/plugins/rehype-figure-caption.ts';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://jasperhung.dev',
  server: {
    host: true,
  },
  build: {
    inlineStylesheets: 'always',
  },
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
    mdx(),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [remarkDirective, remarkAdmonitions],
    rehypePlugins: [rehypeFigureCaption],
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
