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

// 只對 code fence 以外的區段套用轉換，避免改到文章裡示範用的 markdown／HTML。
function transformOutsideCode(body: string, transform: (chunk: string) => string): string {
  const out: string[] = [];
  let chunk: string[] = [];
  let fence: string | null = null;
  const flush = () => {
    if (chunk.length) out.push(fence ? chunk.join('\n') : transform(chunk.join('\n')));
    chunk = [];
  };
  for (const line of body.split('\n')) {
    const marker = line.trimStart().match(/^(`{3,}|~{3,})/)?.[1];
    if (!fence && marker) {
      flush();
      fence = marker;
    }
    chunk.push(line);
    if (fence && marker && chunk.length > 1 && marker.startsWith(fence)) {
      flush();
      fence = null;
    }
  }
  flush();
  return out.join('\n');
}

const plainText = (text: string) => text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const withFigurePrefix = (text: string) => (/^圖[：:]/.test(text) ? text : `圖：${text}`);

// 原稿的 ./image.jpg 在網站上不存在（Astro 會轉成 /_astro/<hash>.webp），agent 拿到會 404；
// 圖片改成文字描述：caption 寫意義、alt 寫畫面，兩者都留。
function imagesToText(chunk: string): string {
  return chunk
    .replace(
      /^!\[([^\]]*)\]\([^)]*\)[ \t]*\n(?:[ \t]*\n)*<p class="image-caption">([\s\S]*?)<\/p>/gm,
      (_, alt: string, caption: string) => {
        const scene = plainText(alt).replace(/[。.]$/, '');
        const meaning = withFigurePrefix(plainText(caption));
        return scene ? `${meaning}\n（畫面：${scene}）` : meaning;
      },
    )
    .replace(/^!\[([^\]]*)\]\([^)]*\)[ \t]*$/gm, (_, alt: string) => withFigurePrefix(plainText(alt)));
}

// 站內連結補成絕對網址，內容被貼到別處時仍能看出出處。
function absolutizeLinks(chunk: string, site: URL | undefined): string {
  if (!site) return chunk;
  return chunk.replace(/\]\((\/(?!\/)[^)\s]*)/g, (_, path: string) => `](${new URL(path, site).href}`);
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

  const body = transformOutsideCode(keyTakeawaysToMarkdown(post.body ?? ''), (chunk) =>
    absolutizeLinks(imagesToText(chunk), site),
  ).trim();

  return new Response(`${frontmatter}\n\n# ${title}\n\n${body}\n`, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
