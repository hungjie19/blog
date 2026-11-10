// Plain substring search over /search.json (posts) and /series.json (series cards). No tokenizer:
// includes() already matches Chinese without word segmentation. Swap this module for BM25 later if
// ranking turns out to be the problem; the index shapes stay the same.

export interface SearchItem {
  title: string;
  description: string;
  takeaways: string;
  tags: string[];
  /** Title of the series the post belongs to, '' when none. Matched like description text. */
  series: string;
  date: string;
  url: string;
  thumb: string | null;
}

/** The fields of /series.json the search reads; `posts` only gives the count, it is never matched. */
export interface SeriesSearchItem {
  id: string;
  title: string;
  description: string;
  type: 'series' | 'collection';
  cover: string | null;
  url: string;
  posts: unknown[];
}

// Where a term hit decides its weight: title > tag > description / takeaways / series name.
const TITLE = 3;
const TAG = 2;
const TEXT = 1;

interface Fields {
  title: string;
  tags: string[];
  text: string;
}

export function searchTerms(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * Every term must hit somewhere (AND). Score = sum of each term's best field weight;
 * ties keep the input order (both indexes come newest / site order first).
 */
function rank<T>(items: T[], query: string, fields: (item: T) => Fields): T[] {
  const terms = searchTerms(query);
  if (terms.length === 0) return [];

  const scored: { item: T; score: number; index: number }[] = [];
  items.forEach((item, index) => {
    const f = fields(item);
    const title = f.title.toLowerCase();
    const tags = f.tags.map(tag => tag.toLowerCase());
    const text = f.text.toLowerCase();
    let score = 0;
    for (const term of terms) {
      const weight = title.includes(term) ? TITLE
        : tags.some(tag => tag.includes(term)) ? TAG
        : text.includes(term) ? TEXT
        : 0;
      if (weight === 0) return;
      score += weight;
    }
    scored.push({ item, score, index });
  });

  return scored
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(entry => entry.item);
}

export function searchPosts(items: SearchItem[], query: string): SearchItem[] {
  return rank(items, query, item => ({
    title: item.title,
    tags: item.tags,
    text: `${item.description}\n${item.takeaways}\n${item.series}`,
  }));
}

export function searchSeries(items: SeriesSearchItem[], query: string): SeriesSearchItem[] {
  return rank(items, query, item => ({ title: item.title, tags: [], text: item.description }));
}
