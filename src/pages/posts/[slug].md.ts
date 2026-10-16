import { getCollection, type CollectionEntry } from 'astro:content';
import type { APIRoute } from 'astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.id },
    props: { post },
  }));
}

// KeyTakeaways is an MDX component; agents reading raw markdown only see noise,
// so turn its inline HTML into a plain blockquote summary.
function keyTakeawaysToMarkdown(body: string): string {
  return body.replace(/<KeyTakeaways>([\s\S]*?)<\/KeyTakeaways>/, (_, inner: string) => {
    const text = inner
      .replace(/<a\s+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, '[$2]($1)')
      .replace(/<\/?code>/g, '`')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<\/?p>/g, '')
      .trim();
    return text
      .split('\n')
      .map(line => `> ${line.trim()}`.trimEnd())
      .join('\n');
  });
}

export const GET: APIRoute = ({ site, props }) => {
  const { post } = props as { post: CollectionEntry<'blog'> };
  const { title, description, date, tags } = post.data;
  const url = new URL(`/posts/${post.id}/`, site).href;

  // JSON strings are valid YAML scalars, so JSON.stringify handles quoting safely.
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(title)}`,
    ...(description ? [`description: ${JSON.stringify(description)}`] : []),
    `url: ${url}`,
    `date: ${date.toISOString()}`,
    ...(tags.length ? [`tags: ${JSON.stringify(tags)}`] : []),
    '---',
  ].join('\n');

  const body = keyTakeawaysToMarkdown(post.body ?? '').trim();

  return new Response(`${frontmatter}\n\n# ${title}\n\n${body}\n`, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
