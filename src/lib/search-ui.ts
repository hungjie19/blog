// Client for the site search box (src/components/SearchBox.astro, inside the popup in Search.astro):
// loads /search.json (posts) and /series.json (series cards) once, renders the result popup with JS,
// handles keyboard navigation, the clear button and Umami logging. Styles: `.search-*` in
// src/styles/global.css (global because the result nodes are created at runtime and never get
// Astro's scope attribute).
import { searchPosts, searchSeries, searchTerms, type SearchItem, type SeriesSearchItem } from './search';

// Every matching post is listed (the popup scrolls, thumbnails lazy-load); series cards are
// a shortcut to a topic, so only the best few.
const MAX_SERIES = 3;

interface Indexes {
  posts: SearchItem[];
  series: SeriesSearchItem[];
}

/** One rendered result, post or series card alike. */
interface Row {
  url: string;
  title: string;
  description: string;
  thumb: string | null;
  meta: string;
}

const getJson = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.json();
});

let indexes: Promise<Indexes> | null = null;

function loadIndexes() {
  indexes ??= Promise.all([
    getJson('/search.json'),
    // Series are extra: if their feed fails, posts still search
    getJson('/series.json').catch(() => []),
  ]).then(([posts, series]) => ({ posts, series }));
  indexes.catch(() => { indexes = null; });
  return indexes;
}

const hitsAny = (text: string, terms: string[]) => {
  const lower = text.toLowerCase();
  return terms.some(term => lower.includes(term));
};

// Every row shows *why* it matched: when the hit is only in the takeaways, the second line shows
// the takeaways instead of the description; a hit on the series name puts the name in the meta line.
const postRow = (item: SearchItem, terms: string[]): Row => ({
  url: item.url,
  title: item.title,
  description: !hitsAny(item.description, terms) && hitsAny(item.takeaways, terms) ? item.takeaways : item.description,
  thumb: item.thumb,
  meta: [
    item.date,
    ...(item.series && hitsAny(item.series, terms) ? [`系列：${item.series}`] : []),
    ...item.tags.map(tag => `#${tag}`),
  ].join('  '),
});

/** Appends `text` to `el`, wrapping every case-insensitive occurrence of a term in <mark>. */
function appendHighlighted(el: HTMLElement, text: string, terms: string[]) {
  const lower = text.toLowerCase();
  const ranges: [number, number][] = [];
  for (const term of terms) {
    for (let at = lower.indexOf(term); at !== -1; at = lower.indexOf(term, at + term.length)) {
      ranges.push([at, at + term.length]);
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  let pos = 0;
  for (const [start, end] of ranges) {
    if (end <= pos) continue; // overlaps a mark already placed
    const from = Math.max(start, pos);
    if (from > pos) el.append(text.slice(pos, from));
    const mark = document.createElement('mark');
    mark.textContent = text.slice(from, end);
    el.append(mark);
    pos = end;
  }
  el.append(text.slice(pos));
}

const seriesRow = (item: SeriesSearchItem): Row => ({
  url: item.url,
  title: item.title,
  description: item.description,
  thumb: item.cover,
  meta: `${item.type === 'collection' ? '合集' : '系列'} · ${item.posts.length} 篇文章`,
});

/**
 * Escape hides the popup, blurs the input and dispatches `search:escape` on the root,
 * so a wrapper (the topbar panel) can close itself.
 */
export function mountSearchBox(root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>('[data-search-input]')!;
  const clear = root.querySelector<HTMLButtonElement>('[data-search-clear]')!;
  const popup = root.querySelector<HTMLDivElement>('[data-search-popup]')!;
  const list = root.querySelector<HTMLUListElement>('[data-search-results]')!;
  const status = root.querySelector<HTMLParagraphElement>('[data-search-status]')!;

  // Visible rows in display order (series group first), what arrow keys and Enter walk through
  let rows: Row[] = [];
  let terms: string[] = [];
  let matched = { posts: 0, series: 0 };
  let active = -1;
  // One `search-query` event per distinct query, sent when the reader acts on it
  // (Enter / click / clear / leaving), never per keystroke. The one exception is a
  // zero-result query left untouched for PAUSE_MS ('pause'): live results make readers
  // rewrite a miss instead of pressing Enter, and the rewritten miss is what we want to log.
  let lastTracked = '';
  let composing = false; // 注音／拼音 candidate picking: the text is not a query yet
  let pauseTimer: number | undefined;
  const PAUSE_MS = 1000;

  function schedulePause() {
    window.clearTimeout(pauseTimer);
    const q = input.value.trim();
    if (!q || composing || rows.length > 0) return;
    pauseTimer = window.setTimeout(() => {
      if (input.value.trim() === q && !composing && rows.length === 0) track('pause');
    }, PAUSE_MS);
  }

  function track(action: 'enter' | 'click' | 'dismiss' | 'pause', destination?: string) {
    const q = input.value.trim();
    if (!q || q === lastTracked) return;
    lastTracked = q;
    window.umami?.track('search-query', {
      q,
      results: matched.posts + matched.series,
      series: matched.series,
      action,
      // Read at send time: the popup sets it to the entry point that opened it
      location: root.dataset.location ?? 'unknown',
      ...(destination ? { destination } : {}),
    });
  }

  function syncPopup() {
    const hasContent = list.childElementCount > 0 || Boolean(status.textContent);
    popup.hidden = !(hasContent && root.contains(document.activeElement));
    root.toggleAttribute('data-has-value', input.value.length > 0);
  }

  function hidePopup() {
    track('dismiss');
    popup.hidden = true;
  }

  function setStatus(text: string) {
    status.textContent = text;
    status.hidden = !text;
  }

  // Zero results is not a dead end: offer the two browse pages
  function showNoResults(q: string) {
    status.replaceChildren(`找不到「${q}」相關的文章，換個關鍵字，或從這裡逛：`);
    [['全部系列', '/series/'], ['全部 Tag', '/tags/']].forEach(([label, href], i) => {
      const link = document.createElement('a');
      link.href = href;
      link.className = 'search-status-link';
      link.textContent = label;
      link.addEventListener('click', () => track('click', href));
      status.append(i ? ' · ' : ' ', link);
    });
    status.hidden = false;
  }

  // Keyboard and pointer share one selection: hovering an option makes it the one Enter /
  // arrow keys continue from, so two rows are never highlighted at once.
  function setActive(next: number, { scroll = true } = {}) {
    const options = list.querySelectorAll<HTMLLIElement>('[role="option"]');
    active = next < options.length ? next : -1;
    options.forEach((option, i) => option.setAttribute('aria-selected', String(i === active)));
    if (active >= 0) {
      input.setAttribute('aria-activedescendant', options[active].id);
      if (scroll) options[active].scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  function renderGroupLabel(text: string) {
    const label = document.createElement('li');
    label.className = 'search-group-label';
    label.setAttribute('role', 'presentation');
    label.textContent = text;
    return label;
  }

  function renderOption(row: Row, i: number) {
    const option = document.createElement('li');
    option.id = `${list.id}-${i}`;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', 'false');
    // pointermove, not mouseenter: arrow keys scroll rows under a resting cursor, and
    // mouseenter would then steal the keyboard selection
    option.addEventListener('pointermove', () => {
      if (active !== i) setActive(i, { scroll: false });
    });

    const link = document.createElement('a');
    link.href = row.url;
    link.className = 'search-result';
    link.tabIndex = -1;
    link.addEventListener('click', () => track('click', row.url));

    // Rows without a cover keep an empty slot so every row's text lines up
    const thumb = document.createElement(row.thumb ? 'img' : 'span');
    thumb.className = 'search-result-thumb';
    if (thumb instanceof HTMLImageElement && row.thumb) {
      thumb.src = row.thumb;
      thumb.alt = '';
      thumb.width = 128; // intrinsic hint only; CSS sizes it (72px phone, 128px desktop)
      thumb.height = 96;
      thumb.loading = 'lazy';
      thumb.decoding = 'async';
    }
    link.append(thumb);

    const text = document.createElement('span');
    text.className = 'search-result-text';

    const title = document.createElement('span');
    title.className = 'search-result-title';
    appendHighlighted(title, row.title, terms);
    text.append(title);

    if (row.description) {
      const description = document.createElement('span');
      description.className = 'search-result-description';
      appendHighlighted(description, row.description, terms);
      text.append(description);
    }

    const meta = document.createElement('span');
    meta.className = 'search-result-meta';
    appendHighlighted(meta, row.meta, terms);
    text.append(meta);

    link.append(text);
    option.append(link);
    return option;
  }

  async function update() {
    window.clearTimeout(pauseTimer);
    const q = input.value.trim();
    if (!q) {
      rows = [];
      matched = { posts: 0, series: 0 };
      list.replaceChildren();
      input.setAttribute('aria-expanded', 'false');
      setActive(-1);
      setStatus('');
      syncPopup();
      return;
    }

    let index: Indexes;
    try {
      index = await loadIndexes();
    } catch {
      setStatus('搜尋索引載入失敗，請重新整理再試一次');
      syncPopup();
      return;
    }
    if (input.value.trim() !== q) return; // a newer keystroke already took over

    terms = searchTerms(q);
    const posts = searchPosts(index.posts, q);
    const series = searchSeries(index.series, q);
    matched = { posts: posts.length, series: series.length };
    const seriesRows = series.slice(0, MAX_SERIES).map(seriesRow);
    const postRows = posts.map(item => postRow(item, terms));
    rows = [...seriesRows, ...postRows];

    // Each non-empty group gets a heading carrying its match count
    const options = rows.map(renderOption);
    list.replaceChildren(
      ...(seriesRows.length ? [renderGroupLabel(`系列 · ${series.length}`)] : []),
      ...options.slice(0, seriesRows.length),
      ...(postRows.length ? [renderGroupLabel(`文章 · ${posts.length}`)] : []),
      ...options.slice(seriesRows.length),
    );
    list.scrollTop = 0;
    input.setAttribute('aria-expanded', String(rows.length > 0));
    setActive(-1);
    if (rows.length === 0) showNoResults(q);
    else setStatus('');
    syncPopup();
    schedulePause();
  }

  function go(i: number) {
    const row = rows[i];
    track('enter', row?.url); // zero-result Enters are the most useful queries to log
    if (row) window.location.assign(row.url);
  }

  input.addEventListener('input', () => {
    root.toggleAttribute('data-has-value', input.value.length > 0);
    void update();
  });
  input.addEventListener('compositionstart', () => {
    composing = true;
    window.clearTimeout(pauseTimer);
  });
  // Browsers disagree on whether the last `input` comes before or after this, so re-arm here too
  input.addEventListener('compositionend', () => {
    composing = false;
    schedulePause();
  });
  input.addEventListener('focus', () => {
    syncPopup();
    void loadIndexes().catch(() => {});
  });

  input.addEventListener('keydown', event => {
    // Enter while an IME (注音／拼音) is composing only confirms the candidate
    if (event.isComposing || event.keyCode === 229) return;
    const visible = rows.length;
    if (event.key === 'ArrowDown' && visible) {
      event.preventDefault();
      setActive(active + 1 >= visible ? 0 : active + 1);
    } else if (event.key === 'ArrowUp' && visible) {
      event.preventDefault();
      setActive(active <= 0 ? visible - 1 : active - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(active >= 0 ? active : 0);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      hidePopup();
      input.blur();
      root.dispatchEvent(new CustomEvent('search:escape', { bubbles: true }));
    }
  });

  // Clearing a typed query counts as giving up on it
  clear.addEventListener('click', () => {
    track('dismiss');
    input.value = '';
    void update();
    input.focus();
  });

  // Pointer outside, not focusout: a tapped result link may never take focus on iOS,
  // so blur would close the popup before the tap lands
  document.addEventListener('pointerdown', event => {
    if (!root.contains(event.target as Node)) hidePopup();
  });
  root.addEventListener('focusout', event => {
    const next = event.relatedTarget as Node | null;
    if (next && !root.contains(next)) hidePopup(); // Tab moved focus elsewhere
  });

  // The popup closed from outside the box (⌘K / `/` toggle): log the query now, not on the next tap
  root.addEventListener('search:close', () => track('dismiss'));

  // Typed a query and left the page some other way: still worth knowing what they looked for.
  // `hidden` covers tab / app switches and phone lock, where iOS often never fires pagehide.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') track('dismiss');
  });
  window.addEventListener('pagehide', () => track('dismiss'));
}
