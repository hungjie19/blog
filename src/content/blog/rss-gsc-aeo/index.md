---
title: "Blog 被找到的三種方式：RSS、GSC、AEO"
date: 2026-06-22T11:42:19+08:00
description: "寫了文章沒人看等於白做。RSS 讓讀者訂閱、GSC 送給 Google 索引、AEO 讓 AI crawler 讀懂你——三種設定，一次說清楚。"
tags:
  - rss
  - seo
  - aeo
  - 建站
---

網站部署了，但網路還不認識你。

網路爬蟲不會主動發現你，你必須主動告訴它們你在哪、你是誰、你的內容長什麼樣。讓 Google 知道你在哪、讓讀者訂閱你、讓 AI 讀懂你——這三件事，我們一起來實現：

1. **人找你** → RSS 訂閱
2. **Google 找你** → Search Console + Sitemap
3. **AI 找你** → raw markdown + AEO

各有各的協定，各做一次，之後就不用再管了。

## RSS：讓讀者訂閱，不靠演算法

RSS 是一種訂閱協定，概念很簡單：你的 blog 產出一個 XML 格式的 feed 檔案，讀者用 Feedly 之類的 RSS reader 訂閱這個 URL，之後每次你發新文章，他們的 reader 就會自動收到——不需要你去各平台發貼、不需要演算法幫你分發，讀者直接訂，安靜又可靠。

技術社群的讀者比一般人更習慣用 RSS，這是你的目標讀者群。做這個對的人很有用，跳過它就少了一個安靜但穩定的觸達管道。

### 在 Astro 裝 `@astrojs/rss`，建 `src/pages/rss.xml.ts`：

```ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog');
  return rss({
    title: 'Jasper cowork with AI',
    description: '與 AI 協作的實戰紀錄',
    site: context.site,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/posts/${post.id}/`,
    })),
  });
}
```

### 裝完還有一步：**RSS autodiscovery**。在 `<head>` 加一行：

```html
<link rel="alternate" type="application/rss+xml" title="你的 Blog" href="/rss.xml" />
```

RSS reader 只要貼入你的網址，就能自動找到 feed，不用用戶手動填路徑。

---

## Google Search Console：讓 Google 索引你

Domain [設定好之後](/posts/custom-domain-cloudflare/)，要主動把 sitemap 送給 Google，否則等自然爬取可能要等很久。

進 Google Search Console，新增 property，選 Domain 類型。Cloudflare DNS 的話，GSC 直接走 OAuth 授權自動加 TXT record，不用手動操作。

### Sitemap 提交：輸入框填入完整 **sitemap URL**：

```
https://jasperhung.dev/sitemap-index.xml
```

:::tip
送出後狀態顯示「無法擷取」是正常的——那是初始狀態，不是錯誤，等 Google 第一次去抓就會變成「成功」。
:::

---

## AEO：讓 AI crawler 讀懂你

做這個之前，我忽然想到一件事：這個時代應該有專門針對 AI 的 SEO 吧？於是跟 AI 討論了這個問題：

> GitHub 有個 Raw 按鈕，可以直接看到檔案的原始內容，不帶任何 HTML 包裝。如果我的 blog 也做類似的東西，讓 AI crawler 可以直接讀到乾淨的 markdown，而不是去解析整頁的 HTML + sidebar + header + script 標籤——這樣 AI 對文章的理解會不會更好？

答案是對的——這個概念有個名字：AEO（AI Engine Optimization），SEO 的下一層，針對的不是 Google，而是 Perplexity、ChatGPT 這類 AI 搜尋引擎。

AI 在爬你的文章時，讀到的是整個 HTML 頁面，裡面除了文章內容，還有導覽列、footer、dark mode script、CSS class 名稱……它必須自己辨別哪些是「真正的內容」。如果你提供一個乾淨的 markdown 版本，AI 直接讀那個，理解品質和引用準確度都會好很多。

:::tip
換句話說：只要你有針對 AI crawler 優化爬取體驗，就算是在做 AEO。
:::

做法兩步。

### Step 3-1 建 raw markdown endpoint：

```ts
// src/pages/posts/[slug].md.ts
export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.id },
    props: { body: post.body },
  }));
}

export const GET = ({ props }) =>
  new Response(props.body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
```

### Step 3-2 在 `<head>` 宣告這個 alternate 版本：

```html
<link rel="alternate" type="text/markdown" href="/posts/your-slug.md" />
```

這個 tag 就是告訴 AI crawler：「這篇文章有個乾淨的 markdown 版本，你去那裡讀。」Perplexity 已確認會優先使用這個 endpoint。

## FAQ

**新 blog 沒讀者，RSS 值得裝嗎？**
值得。RSS 是基礎建設，早裝和晚裝的成本一樣，但早裝的話，第一批關注你的人一開始就能訂閱——不用之後再補通知說「我加了 RSS」。

**Sitemap 一定要手動提交嗎？**
Google 最終還是會自然爬到，但新 blog 沒有外部連結時等待時間可能很長。手動提交大幅縮短這段等待。

**AEO 有辦法確認 AI 真的在讀 markdown 嗎？**
看 server log：AI crawler 的 user-agent 會是 `PerplexityBot`、`GPTBot` 等。如果這些 bot 有訪問 `/posts/*.md` 路徑，就代表有效。

---

三個設定裝完，blog 才算真正接上網路。讀者能訂、Google 能索引、AI 能讀懂——文章寫出來是第一步，讓人找得到才算開門。
