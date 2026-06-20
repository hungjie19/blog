---
title: '為什麼選 Astro 來架 Blog'
date: 2026-06-21
description: '從框架選擇表到孤島架構、Vue 式語法、CSS scoping，一篇說清楚我為什麼不選 Next.js 的文章。'
tags:
  - astro
  - blog
  - 建站
---

開始架 blog 之前，我花了一點時間選框架。不是因為選擇困難，而是選錯了之後換掉的代價太高——slug 一旦上線就不能改（= URL 不能變），框架綁定的風格也很難中途轉換。

我之前用過 Hexo。它很好上手，台灣開發者圈幾乎人手一個 Hexo blog，theme 多、文件多、踩坑文多。但用久了開始覺得卡：想改一個細節要鑽進 theme 的 EJS template，想加一個功能要找對應的 plugin 是否還有人維護。2023 年後整個生態明顯停滯，我決定這次重新選。

## 現代 Blog 框架比較

主流選項大概就這幾個：

| 框架 | 語言/生態 | 預設 JS 輸出 | Markdown | GitHub Pages |
|------|-----------|------------|----------|-------------|
| **Astro** | JS/TS，任意 UI | Zero JS（island） | 原生 + MDX | ✅ CI/CD |
| **Hugo** | Go，無框架 | 零 | 原生，shortcode | ✅ 原生支援 |
| **Jekyll** | Ruby | 零 | 原生 | ✅ 原生免 CI |
| **Eleventy** | JS，無框架 | 零（手動加） | 原生 + Nunjucks | ✅ CI/CD |
| **VitePress** | Vue | Vue runtime | 原生（文件導向） | ✅ CI/CD |
| **Next.js** | React | React bundle | 需套件 | ✅ CI/CD |
| **Hexo** | Node.js | 零 | 原生 | ✅ 原生支援 |

幾個快速刷掉的理由：

- **Hexo**：曾經是最多台灣開發者的第一選擇（包括我），但 2023 年後活躍度明顯下降，theme 生態停滯，想客製化幾乎要自己翻 EJS template。如果你有 Hexo blog，這篇文章的讀者就是你。
- **Jekyll**：GitHub Pages 原生支援是好事，但 Ruby 環境在 Mac 上一直有點麻煩，社群動能也在走下坡。
- **Hugo**：Build 速度是所有框架裡最快的（毫秒級），但 Go template 語法不直覺，想客製化 UI 要多學一套東西。
- **Next.js**：太重。Blog 不需要 SSR、不需要 API routes，為什麼要帶一個 React runtime？

最後剩下 Astro 和 Eleventy。Eleventy 很乾淨，但它對 UI 框架沒有意見——彈性太高反而要自己做很多決定。Astro 有主張，而且主張跟 blog 場景剛好對齊。

## Astro 是什麼

[Astro](https://astro.build) 是一個以「內容優先」為核心設計的現代靜態網站框架，[開源在 GitHub](https://github.com/withastro/astro)，目前有超過 48k stars。npm 每週下載量超過 50 萬次，被 Google、Cloudflare、NordVPN 等公司的文件或行銷網站採用。

它在 2021 年發布 beta，2022 年出 v1，成長速度非常快。State of JS 2023 調查裡，Astro 的開發者滿意度排名第一——超過 Next.js、Remix、SvelteKit。

> 不是小眾實驗品，是已經被驗證的選擇。

核心設計哲學只有一句話：**ship less JavaScript**。具體怎麼做到的，就是孤島架構。

## 孤島架構（Island Architecture）

Astro 最核心的設計哲學：**頁面預設是靜態 HTML，只有你標記 `client:*` 的元件才會下載 JS、才會 hydrate 成可互動的狀態。**

```astro
<!-- 這個完全不輸出 JS -->
<CommentSection />

<!-- 這個才會 -->
<CommentSection client:load />

<!-- 瀏覽器閒置才載入 -->
<CommentSection client:idle />

<!-- 進入 viewport 才載入（天生 lazy load） -->
<CommentSection client:visible />
```

`client:visible` 這個特別有意思——你不用自己寫 IntersectionObserver，框架幫你搞定。元件只有在使用者真的看到它的時候才會被下載。

對比 Next.js：每個頁面預設就帶 React runtime，就算頁面全靜態也一樣。你要手動 `'use client'` / `'use server'` 來標界線。

兩者的思路剛好相反：

- Next.js：**預設有 JS**，需要靜態才標記
- Astro：**預設無 JS**，需要互動才標記

Blog 是「內容為主、互動為輔」的場景。大部分頁面就是 HTML + CSS，偶爾才有個搜尋框或留言系統。Astro 的哲學天然吻合。

## 寫起來像 Vue

`.astro` 的語法熟悉又直覺。記住一件事就夠了：**`---` 是前後端的分水嶺。**

```astro
---
// ▲ SERVER（build time）
// 可以讀檔、call API、存 API key
// client 完全看不到這段
const { title } = Astro.props;
const posts = await getCollection('blog');  // 可以直接 await
---

<!-- ▼ HTML template，不需要 <template> 包 -->
<!-- 幾乎就是 Vue 的寫法，少一層 -->
<h1>{title}</h1>
{posts.map(p => (
  <a href={`/posts/${p.id}`}>{p.data.title}</a>
))}

<style>
  h1 { color: var(--text); }  /* 預設 scoped */
</style>

<script>
  // ▼ CLIENT（browser）
  // 可以操作 DOM、監聽事件
  // 但看不到上面 --- 的變數
  console.log('hello from browser');
</script>
```

兩個跟 Vue 不一樣的地方值得說一下：frontmatter 可以直接 `await`，不需要 `onMounted` 或 `useEffect`；而且整個框架沒有 reactivity——沒有 `ref`、沒有 `reactive`、沒有 `watch`。對 blog 來說這不是缺點，是少了一層複雜度。

### Props 怎麼傳

Component 化之後，資料從呼叫端傳進來，一樣在 frontmatter 接：

```astro
---
// 呼叫端：<AuthorCard name="Jasper" avatar="./photo.jpg" />

interface Props {
  name: string;
  avatar?: string;
}

const { name, avatar = '/default.jpg' } = Astro.props;
---

<div>
  <img src={avatar} alt={name} />
  <p>{name}</p>
</div>
```

沒有 `defineProps`、沒有 `withDefaults`，直接解構、直接用。

Build time Astro 把 props 填進 template，輸出靜態 HTML。瀏覽器收到的已經是填好值的頁面——不需要 server、不需要 runtime，文章標題、作者名、圖片路徑在 build 當下就全部燒進去了。

## CSS Scoping

`<style>` 預設 scoped，不用加任何 attribute：

```astro
<h1>Hello</h1>

<style>
  /* 只影響這個元件的 h1，不會外洩 */
  h1 { color: red; }
</style>
```

Build 後 Astro 自動加 hash：

```html
<h1 class="astro-abc123">Hello</h1>
<style>h1.astro-abc123 { color: red; }</style>
```

要跳脫 scope 影響子元件用 `:global()`：

```astro
<style>
  /* Markdown render 出來的 HTML 在 slot 裡，不在 scope 內 */
  /* 所以要用 :global() 才能樣式化 <h1>、<blockquote> 這些 */
  .article-body :global(h1) { font-size: 2rem; }
  .article-body :global(blockquote) { background: var(--surface); }
</style>
```

這個設計讓大型 component 樹不會有樣式污染問題，同時保留了「真的需要全域時」的逃生口。

## 一句話結論

如果你寫過 Vue、想架一個內容導向的 blog、不想為了偶爾一個互動元件而背負整個 React runtime——Astro 是目前最對的選擇。

它有主張，但主張剛好是對的。
