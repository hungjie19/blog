import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.id },
    props: { body: post.body },
  }));
}

export const GET: APIRoute = ({ props }) => {
  return new Response(props.body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
