---
title: "OG Image：設計思路與 Build-time 生成"
ogTitle: "OG Image|設計思路與|Build-time 生成"
date: 2026-06-22T15:00:00+08:00
description: "LINE 分享截圖有圖才驚覺 OG image 必做。從規格研究、設計工具、safe zone 思路，到 Canvas API 踩的三個坑——build-time 自動生成的完整過程。"
tags:
  - og-image
  - astro
  - seo
  - 建站
---

在討論 meta tag 的時候，我問：「除了 og:image，還有 title 跟 description 可以用吧？」

然後看到了一張 LINE 分享截圖——有圖的預覽跟沒圖的預覽差距一目了然。

「Ok 我懂了，這個必做，而且要動態生成。」

---

## 規格研究：1200×630 與 safe zone

先查清楚規格，才能設計。

**標準尺寸**：1200×630px，長寬比 1.91:1，Facebook / X / LinkedIn / Discord / Slack 全採用同一個標準。

**Safe zone**：重要元素要放在中央的 1080×565px 範圍內（左右各 60px、上下各 ~33px 留空），避免各平台裁切時被切到。

**各平台裁切行為**不太一樣，要注意：

| 平台                          | 裁切方式                |
| ----------------------------- | ----------------------- |
| Facebook / LinkedIn / Discord | 完整顯示 1.91:1         |
| X (Twitter)                   | 上下裁成 16:9，左右完整 |
| iMessage lock screen          | **一定**裁成 1:1 正方形 |
| Slack mobile                  | 有時 square-crop        |

正方形裁切的場景（iMessage、Slack mobile），如果設計是橫版全幅，avatar 和底部元素很可能被切掉，只剩中央的標題字。這是取捨——主流平台沒問題，正方形場景就先放掉。

規格參考：[OG Image Size Guide 2026](https://www.krumzi.com/blog/open-graph-image-sizes-for-social-media-the-complete-2026-guide)、[OpenGraph Image Sizes 2026](https://env.dev/guides/opengraph-image-sizes)

**測試工具**，這六個都值得收藏：

1. [metatags.io](https://metatags.io/) — 一次看 Google、Twitter、Facebook、LinkedIn、Slack、Discord，最推薦
2. [opengraph.xyz](https://www.opengraph.xyz/) — 貼 URL 直接預覽，快
3. [Facebook Debugger](https://developers.facebook.com/tools/debug/) — 官方工具，可強制清快取重抓
4. [Twitter Card Validator](https://cards-dev.twitter.com/validator) — X/Twitter 官方驗證
5. [socialsharepreview.com](https://socialsharepreview.com/) — 多平台 side-by-side 比較
6. [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) — LinkedIn 官方驗證

推薦流程：本地設計 → deploy → metatags.io 一次確認 → 有問題用 Facebook Debugger 強制清快取。

---

## 逆向工程反推測試

查規格只是第一步，光看文件不夠——我習慣用 LINE Keep 存社群上滑到的 repo 和文章連結，所以剛好有一批現成的 LINE 分享截圖可以直接拿來觀察。

仔細看了一遍，跟網路上查到的「LINE 手機顯示正方形」有些出入。測試起來大概是**左右各截掉約 60px**，圖片比例大致完整，底部內容也看得到。可能 LINE 的 preview 因手機型號或版本不同而有差異，我也不確定；這只是我從截圖裡觀察到的樣子。

不過這個觀察讓設計寬鬆了一些——版面不用把所有東西全擠到最中央，只要在 safe zone 範圍內都安全。

另一個收穫是設計靈感。存的連結裡大多是 GitHub repo，OG image 底部有一條顏色條，那是語言比例的視覺化。但在 OG image 裡整塊顯示起來，變成一條橫跨底部的色帶，有點像腰帶，把整張圖做了個收尾，意外地乾淨好看。

於是用 Python PIL 量了 GitHub OG image：那條線是 25px，顏色 `rgb(222, 165, 132)`。我們用 blog 的藍色 `#60a5fa` 做了 24px 的底線，靈感就是從這裡來的。

---

## 設計工具：og-template.html

AI 一開始說可以用 Canvas 生成圖片，但我想——Canvas 不就是 HTML 裡的東西嗎？直接用一個本地 HTML 頁面來討論版面結構，需要什麼元素、放哪裡、大小多少，在瀏覽器裡調好之後存 PNG，不就是最簡單的做法？

於是做了 `og-template.html`：放在 repo 根目錄，瀏覽器直接開，avatar 用 base64 內嵌，離線可用。每次換標題就改一行，其他結構不動，變成一個討論 OG 版面的視覺工具。

版面結構定下來之後：

```
#card (1200×630)
├── .safe-zone (left 60, right 60, top 33, bottom 57)
│   ├── .header（avatar + blog name）
│   ├── .title-wrapper（標題，上下置中）
│   └── .url（jasperhung.dev，置中）
└── .bottom-bar（全寬 24px，#60a5fa）
```

Safe zone 的 bottom 是 57px：33px margin + 24px 底線，底線故意延伸到 safe zone 外全寬，跟 GitHub 色線同一個概念。

後來 AI 根據這份 HTML 的設計，把每個 CSS 屬性逐一翻譯成 Canvas API 的畫法，把 Astro 的 build-time 生成接上來。原本只是要當生成工具的 HTML 頁，最後變成了跟 AI 的設計討論工具，再由 AI 反推回程式碼——這個轉折我真的沒想到。

---

## Safe zone 的做法

一開始用 padding 計算「左右 40px 防切邊」，每次調 layout 都要重新算一遍。

跟 AI 討論之後，換了一個更直觀的思路：先在 HTML 裡把預期會被切掉的邊距框出來，中間那個 div 就是我們真正的畫布。之後所有討論——padding 多少、元素往左一點——都以這個 div 為基準，不再管外面的整張圖：

```css
.safe-zone {
  position: absolute;
  left: 60px;
  right: 60px;
  top: 33px;
  bottom: 57px;
}
```

這樣調 layout 的心智模型變得很清楚：在 safe zone 裡面做事，切邊的問題不用再想。

---

## Build-time 生成：為什麼不手動

兩條路：
- **手動**：HTML tool → Download PNG → 壓縮 → 放進文章資料夾
- **Build-time**：Astro endpoint 自動生成

選 build-time。設計改了、文章標題改了，push 後 GitHub Actions 自動重新生成全部 OG image，不用手動跑任何工具。


`src/pages/og/[slug].png.ts` 在 build 時為每篇文章輸出 `dist/og/[slug].png`，`BlogLayout.astro` 的 meta tag 指向生成的 URL：

```html
<meta property="og:image" content="https://jasperhung.dev/og/{slug}.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://jasperhung.dev/og/{slug}.png" />
```

:::caution
og:image 的 URL 必須是完整的絕對路徑（`https://`開頭），不能用相對路徑（`/og/slug.png`）。相對路徑在瀏覽器正常運作，但社群平台的爬蟲不知道你的 domain，圖就不會出現。
:::

---

## Canvas API 踩的三個坑

HTML/CSS 翻譯成 Canvas API，遇到幾個 CSS 理所當然、但 Canvas 要手寫的東西。

**坑 1：Avatar 沒有 object-fit: cover**

直接 `ctx.drawImage(img, x, y, 72, 72)` 會把非正方形圖片壓扁。要自己計算 crop 區域：

```ts
const srcSize = Math.min(img.width, img.height);
const srcX = (img.width - srcSize) / 2;
const srcY = (img.height - srcSize) / 2;
ctx.drawImage(img, srcX, srcY, srcSize, srcSize, ax, ay, 72, 72);
```

**坑 2：中文折行**

按空格斷詞的折行邏輯遇到中文連續字串就失效——「domain，才算是認真在做一件事」這種句子整行無法斷開，直接溢出。

改成逐字元迭代，讓每個 CJK 字之間都可以作為斷行點：

```ts
for (const char of text) {
  const test = current + char;
  if (ctx.measureText(test).width > maxWidth && current) {
    lines.push(current.trimEnd());
    current = char === ' ' ? '' : char;
  } else {
    current += char;
  }
}
```

**坑 3：中文字體**

Geist 只有 Latin，中文會顯示為方塊字（tofu）。解法是雙字體 fallback：

```ts
const cjkPaths = [
  '/System/Library/Fonts/STHeiti Medium.ttc',    // macOS 本地
  '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', // Linux CI
];
for (const p of cjkPaths) {
  if (existsSync(p)) { GlobalFonts.registerFromPath(p, 'CJK'); break; }
}
```

GitHub Actions 在 build 前先跑 `apt-get install fonts-noto-cjk`，本地開發吃 macOS 系統字體，兩邊各自 fallback。

---

## Astro 生態系有沒有現成的 OG Image 產生器？

也順手查了一下，Astro 生態系有沒有人做好 OG image 產生器。找回來幾個 repo：

| Repo                                                                  | Stars |
| --------------------------------------------------------------------- | ----- |
| [delucis/astro-og-canvas](https://github.com/delucis/astro-og-canvas) | 266 ⭐ |
| [fabian-hiller/og-img](https://github.com/fabian-hiller/og-img)       | 126 ⭐ |

星星最多的是 `astro-og-canvas`，底層一樣是 Canvas，但包成 library，上面給你一個 `OGImageRoute()` API：

```js
export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'route',
  pages,
  getImageOptions: (path, page) => ({
    title: page.title,
    description: page.description,
    logo: { path: './src/logo.png' },
  }),
});
```

傳入 `title + description + logo` build time 自動生成，不用自己寫 Canvas 程式碼。

:::tip
方便快速，但版面是固定模板，不能改結構。沒有客製需求的話，裝這個比自己寫 Canvas 快很多；如果想完全控制設計，就只能自己來。
:::

---

## 有沒有人已經做好 OG 相關的 AI Skill？

規格查完、實作完，突然想到：網路行銷這塊，應該早就有人做成 Skill 了吧？請 AI 去 GitHub 找找看。

找回來三個 repo：

| Repo                                                                                  | Stars |
| ------------------------------------------------------------------------------------- | ----- |
| [kostja94/marketing-skills](https://github.com/kostja94/marketing-skills)             | 637 ⭐ |
| [OpenClaudia/openclaudia-skills](https://github.com/OpenClaudia/openclaudia-skills)   | 490 ⭐ |
| [thatrebeccarae/claude-marketing](https://github.com/thatrebeccarae/claude-marketing) | 59 ⭐  |

拿星星最多的進去翻，找到一個 [`skills/seo/on-page/open-graph/SKILL.md`](https://github.com/kostja94/marketing-skills/tree/main/skills/seo/on-page/open-graph)。

讀完之後發現：跟我們自己查到的規格差不多，就是把 og:title / og:image / safe zone / 測試工具整理好放在 skill 裡，下次問 AI 相關問題時自動帶入這些知識。

**但圖片怎麼生出來，skill 不負責。** Skill 告訴你規格是什麼、tag 怎麼寫、去哪裡測試——實際產生圖片，還是要自己用 Canvas API、Satori 或 Puppeteer 解決。這部分沒有捷徑。

---

## 心得

OG image 是社群分享的第一印象，但它又完全隱形——讀者永遠不會直接看到這個檔案，只有在分享的那一刻才出現。

之前比較少接觸這塊領域，做這功能只能靠基本功：查文件搞清楚規格、從 LINE Keep 存下來的截圖裡逆向工程觀察實際行為、從 GitHub 的 OG image 裡找設計靈感。純靠這些，就把一個原本完全不懂的功能做出來了——這個過程蠻有趣的，意外摸到了很多平常不會碰的東西。

不需要客製版面的話，直接裝 `astro-og-canvas` 就好。

不想從頭查規格，也有現成的 [open-graph Skill](https://github.com/kostja94/marketing-skills/tree/main/skills/seo/on-page/open-graph) 可以用。
