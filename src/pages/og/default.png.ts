import type { APIRoute } from 'astro';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderOgImage } from '../../lib/og-image';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

export const GET: APIRoute = async () => {
  return new Response(renderOgImage('Jasper Hung|Coworking|with AI', root), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
