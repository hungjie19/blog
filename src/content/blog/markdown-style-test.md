---
title: Markdown 樣式全測試
date: 2026-06-19
tags: [test, markdown, style]
description: 測試所有 Markdown 元素的渲染效果
---

# H1 標題

## H2 標題

### H3 標題

#### H4 標題

---

## 文字樣式

普通文字。**粗體**，*斜體*，~~刪除線~~，`inline code`，**_粗體斜體_**。

這是一段比較長的段落，用來測試行距與最大寬度的設定是否舒適。工程師的 blog 最重要的是閱讀體驗，文字不能太擠也不能太散，行高約 1.75 是比較舒服的數值。

---

## 連結

[外部連結](https://astro.build)，[相對連結](#h2-標題)。

---

## 清單

### 無序清單

- 第一項
- 第二項
  - 巢狀項目 A
  - 巢狀項目 B
    - 更深一層
- 第三項

### 有序清單

1. 第一步
2. 第二步
3. 第三步

### Task List

- [x] 建立 Astro 專案
- [x] 設定 GitHub Actions
- [ ] 刻 Claude UI layout
- [ ] 上線第一篇文章

---

## Blockquote

> 這是一段引言。AI 不是來取代你的，而是來放大你的能力。

> 多行引言第一行
>
> 第二行，中間有空行。

---

## 程式碼區塊

### TypeScript

```typescript
interface Post {
  title: string;
  date: Date;
  tags: string[];
}

async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog');
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
```

### Bash

```bash
pnpm create astro@latest blog -- --template minimal
cd blog && pnpm install
git push origin main
```

### JSON

```json
{
  "name": "blog",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build"
  }
}
```

### 無語言標記

```
純文字 code block
沒有 syntax highlight
```

---

## 表格

| 工具 | 用途 | 費用 |
|------|------|------|
| Astro | 靜態網站生成 | 免費 |
| GitHub Pages | 部署 | 免費 |
| Cloudflare | DNS + Analytics | 免費 |
| Umami Cloud | 進階 Analytics | 免費（基本） |

---

## 圖片

![Astro Logo](https://astro.build/assets/press/astro-icon-dark.png)

---

## 水平線

上方

---

下方

---

## 長程式碼（測試橫向捲動）

```typescript
const result = await Promise.all(posts.map(async (post) => ({ slug: post.slug, title: post.data.title, date: post.data.date, tags: post.data.tags })));
```
