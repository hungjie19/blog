---
title: "買了 domain，才算是認真在做一件事"
date: 2026-06-20
description: "從 GitHub Pages 出發到個人品牌 domain 架設過程，還有那些走過才會遇到的坑。"
tags:
  - blog
  - cloudflare
  - 建站
---

用 GitHub Pages 架 blog 的人最後都會遇到同一個問題：`hungjie19.github.io/blog` 這串網址，免費是很佛心，但這不代表你——只代表你用的平台。換 custom domain 是遲早的事，只是在拖「我到底會不會繼續寫」這個問題。

決定開 blog 的當天，我把 domain 一起買了。

為什麼值得花這筆錢：

1. SEO 累積跟著 domain 走，不是跟 `github.io` 走——以後換平台，資產不歸零
2. 網址代表你這個人，不是你用的工具
3. 之後換架構、換 hosting、加功能，你說了算

## Domain 廠商比較

|                 | Cloudflare         | Namecheap            | GoDaddy                  |
| --------------- | ------------------ | -------------------- | ------------------------ |
| 價格            | 成本價，不加價     | 有時便宜，續費可能漲 | 第一年很便宜，之後不一定 |
| DNS             | 內建，全球最快之一 | 需另外設定           | 內建                     |
| CDN / Analytics | 免費附贈           | 無                   | 無                       |
| 介面            | 乾淨               | 普通                 | 稍微複雜                 |

:::tip
Cloudflare 的 domain 是以成本價賣，附贈 CDN 跟 Web Analytics，是非常不錯的選擇！
:::

## 設定步驟

### Step 1｜Cloudflare 買 domain

搜尋你喜歡的網域名稱，魔法小卡拿出來，結帳，完成。

### Step 2｜Cloudflare DNS 設定

1. 進 Cloudflare Dashboard → 選 `{your_domain}`
2. 左側 DNS → Records
3. 新增一筆：
   - Type：CNAME
   - Name：`@`（代表根域名）
   - Target：`your.github.io`
   - Proxy status：橘色雲（Proxied）✓

4. 再新增一筆 www redirect（可選但建議）：
   - Type：CNAME
   - Name：`www`
   - Target：`{your_domain}`
   - Proxy：橘色雲

### Step 3｜SSL/TLS 設成 Full

左側選單 SSL/TLS → Overview → 選 Full（不是 Full (strict)，不是 Flexible）

:::warning
Flexible 會讓 Cloudflare 跟 GitHub Pages 互相 redirect，瀏覽器直接炸 `ERR_TOO_MANY_REDIRECTS`。
:::

### Step 4｜GitHub Pages 填 custom domain

1. 進 GitHub repo → Settings → Pages
2. Custom domain 填 `{your_domain}` → Save
3. 等它 DNS check 跑完（幾秒到幾分鐘）
4. Enforce HTTPS 打勾

### Step 5｜Astro Blog 設定更新

#### 5-1. astro.config.mjs

```ts
export default defineConfig({
  site: '{your_domain}',
  ...
})
```

#### 5-2. src/layouts/BlogLayout.astro

```ts
const siteUrl = "{your_domain}";
```

#### 5-3. public/robots.txt

```txt
Sitemap: {your_domain}/sitemap-index.xml
```

## 結果

domain `jasperhung.dev` 是自己的。

退路少了一條，只剩下持續分享文章。
