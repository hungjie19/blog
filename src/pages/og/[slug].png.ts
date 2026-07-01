import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderOgImage } from '../../lib/og-image';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.id },
    props: { title: post.data.ogTitle ?? post.data.title },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { title } = props as { title: string };

  return new Response(Uint8Array.from(renderOgImage(title, root)), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
