// @ts-check
import { defineConfig } from 'astro/config';
import { remarkAdmonitions } from './src/plugins/remark-admonitions.ts';
import { rehypeFigureCaption } from './src/plugins/rehype-figure-caption.ts';
import { rehypeWrapTables } from './src/plugins/rehype-wrap-tables.ts';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

import tailwindcss from '@tailwindcss/vite';
import { readPosts, countTags } from './scripts/lib/post-tags.mjs';
import { MIN_INDEXED_TAG_POSTS } from './src/lib/tags.ts';

// Tag pages below the threshold are `noindex` (src/pages/tags/[tag].astro); keep them out of the
// sitemap too, so the sitemap never lists a URL the page itself asks not to index.
const thinTagPaths = new Set(
  [...countTags(readPosts())]
    .filter(([, n]) => n < MIN_INDEXED_TAG_POSTS)
    .map(([tag]) => `/tags/${tag}/`),
);

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
    sitemap({
      filter: (page) => !thinTagPaths.has(decodeURIComponent(new URL(page).pathname)),
    }),
  ],
  markdown: {
    remarkPlugins: [remarkAdmonitions],
    rehypePlugins: [rehypeFigureCaption, rehypeWrapTables],
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
