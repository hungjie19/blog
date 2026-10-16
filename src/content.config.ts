import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogGlob = glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' });

const blog = defineCollection({
  // Drafts stay visible in `astro dev` but never enter the collection in a production build,
  // so every getCollection('blog') call site (pages, RSS, sitemap, OG, sidebar) skips them.
  loader: {
    name: 'blog-glob-without-drafts',
    load: async (context) => {
      await blogGlob.load(context);
      if (!import.meta.env.PROD) return;
      for (const [id, entry] of context.store.entries()) {
        if (entry.data.draft) context.store.delete(id);
      }
    },
  },
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
    image: z.string().optional(),
    ogTitle: z.string().optional(),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
