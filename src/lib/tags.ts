import type { CollectionEntry } from 'astro:content';

export type Tag = { label: string; count: number };

/**
 * 掃一遍文章算每個 tag 的次數，回傳依次數大→小
 * （同次數用名稱字典序）排好的 tag 陣列，每個 tag 自帶 count。
 */
export function getTags(posts: CollectionEntry<'blog'>[]): Tag[] {
  const counts = posts.flatMap(p => p.data.tags).reduce((m, t) => {
    m[t] = (m[t] || 0) + 1;
    return m;
  }, {} as Record<string, number>);

  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** How many of the newest posts feed the sidebar's "what I'm writing about lately" tags. */
export const RECENT_TAG_POSTS = 5;

/**
 * Tags from the newest `RECENT_TAG_POSTS` posts, de-duplicated: newest post first, each post's tags
 * in frontmatter order. Recomputed on every build, so the sidebar follows what was published lately
 * instead of the all-time counts (where a 31-post series pins the same tags forever).
 * `posts` must already be sorted newest first.
 */
export function getRecentTags(posts: CollectionEntry<'blog'>[], postCount = RECENT_TAG_POSTS): string[] {
  return [...new Set(posts.slice(0, postCount).flatMap(p => p.data.tags))];
}
