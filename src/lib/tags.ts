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
