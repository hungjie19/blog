import { getCollection } from 'astro:content';
import { seriesLabel } from '../lib/series';

// Index for the topbar search (src/components/Search.astro). Derived straight from the collection,
// in parallel with rss.xml / sitemap, so it can carry search-only fields like the KeyTakeaways text.

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };

function takeawaysText(body: string | undefined): string {
  const inner = body?.match(/<KeyTakeaways>([\s\S]*?)<\/KeyTakeaways>/)?.[1] ?? '';
  return inner
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, m => ENTITIES[m])
    .replace(/\s+/g, ' ')
    .trim();
}

export async function GET() {
  const posts = await getCollection('blog');
  const items = posts
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .map(post => ({
      title: post.data.title,
      description: post.data.description ?? '',
      takeaways: takeawaysText(post.body),
      tags: post.data.tags,
      // The post's own fact "which series I belong to", so a series name finds its posts even when
      // they never repeat it (e.g. 鐵人賽 posts only tag iThome-Ironman). Not series.json's posts array.
      series: post.data.series ? seriesLabel(post.data.series) : '',
      // Same formatting as the home feed, so a post shows the same date in both places
      date: post.data.date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'),
      url: `/posts/${post.id}/`,
      // The 480×360 list thumbnail (same file the home feed shows), not og.jpg: results render it at 72px
      thumb: post.data.cover ? `/images/posts/${post.id}/thumb.jpg` : null,
    }));

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
