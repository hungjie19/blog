# Blog Project — Claude Instructions

## 技術架構

- Framework：Astro (SSG)
- 部署：GitHub Pages（custom domain，無 base path）
- 網址：`https://jasperhung.dev`
- DNS：Cloudflare Registrar + Proxy，SSL/TLS Full
- Package manager：pnpm

## 文章結構

每篇文章一個資料夾：

```
src/content/blog/
  [slug]/
    index.md    ← 文章本文
    image.png   ← 圖片放同層
```

- Slug 命名：英文 kebab-case，不加日期前綴（e.g. `cloudflare-dns-setup`）
- 圖片在 markdown 裡用相對路徑引用：`![說明](./image.png)`
- Slug 發布後不要改（= URL 不能變）

## Frontmatter 格式

```yaml
---
title: '文章標題'
date: 2026-06-20
description: '一句話摘要，給 SEO meta description 用'
tags:
  - tag1
  - tag2
---
```

- `date`：發布日期，排序與 JSON-LD `datePublished` 都靠這個
- `description`：必填，OG / Twitter Card / JSON-LD 都會用到

## SEO / AEO

已實作（不要重複加）：

- `<title>`、`<meta description>`、canonical、OG、Twitter Card、JSON-LD
- `<link rel="alternate" type="text/markdown">` — raw markdown endpoint for AI crawlers
- sitemap：`@astrojs/sitemap`，build 後產生 `sitemap-index.xml`
- `robots.txt`：已設定，指向 sitemap

Raw markdown endpoint：`/posts/[slug].md`（`src/pages/posts/[slug].md.ts`）

## 已完成基礎建設

- Cloudflare domain + DNS：`jasperhung.dev` 上線（2026-06-20）
- Google Search Console：sitemap 已送出（2026-06-20）
- Sidebar About 連結：sidebar nav 最上方（2026-06-21）

## 待做

- OG image：dynamic generation（先放著）
- 系列文章 prev/next 導航：handoff 已記，等有系列文再做
