# Blog Project — Claude Instructions

## 技術架構

- Framework：Astro (SSG)
- 部署：GitHub Pages（custom domain，無 base path）
- 網址：`https://jasperhung.dev`
- DNS：Cloudflare Registrar + Proxy，SSL/TLS Full
- Package manager：pnpm
- Analytics：Umami Cloud（只在 production 載入，script 在 `BlogLayout.astro`）。新增可點擊元素時加 `data-umami-event`，非點擊行為用 `window.umami?.track()`；JS 會攔截點擊的連結（燈箱、複製連結）也改用 `window.umami?.track()`，因為帶 `data-umami-event` 的 `<a>` 會被 Umami 直接導向 href；事件名 kebab-case `<動作>-<目標>[-<位置>]`，例如 `click-about-sidebar`、`copy-heading-link`

## CSS / Tailwind 樣式架構

- 新程式碼優先用 Tailwind utility class，不要新增 inline `style="..."`。
- Design tokens 定義在 `src/styles/global.css` 的 `@theme {}`，讓 Tailwind v4 產生 utility（例如 `text-muted`、`bg-surface`、`border-border`）。
- 顏色走 semantic token utility，不硬寫 hex，也避免 `style="color: var(--muted)"`。
- 重複 UI 樣式放在 `@layer components` 或局部 scoped class，例如 nav link、icon button、tag pill、post item。
- Markdown 文章內容的 typography 可保留在文章頁 scoped CSS，包含 `h1-h6`、`blockquote`、`table`、code、Expressive Code，但必須吃 token。
- Dark mode 透過 `html.dark` 覆蓋 token 變數，utility 自動跟著切，不逐一手寫 `dark:`。
- 字級以語意角色管理（article body、meta、code、sidebar、page title），不要在多個檔案散落同一用途的手寫 font-size。

## Sidebar / Topbar 響應式行為

`src/layouts/BlogLayout.astro` 的 layout chrome：top bar 是獨立於 sidebar 跟 content 之外、橫跨全寬、置頂常駐的一條 `<header>`（不隨 sidebar 開關被蓋住），下面才是 `#body-row`（sidebar + content 橫排）。斷點只有兩條，**768px** 跟 **1024px**：

| 寬度 | Sidebar 呈現方式 | Sidebar 收合機制 | Topbar 品牌 | Topbar 標題 |
|---|---|---|---|---|
| ≤768px（手機） | overlay（`position:absolute`，蓋在 content 上，有 backdrop） | `.open` class（`display:none↔flex`） | 顯示，佔滿剩餘寬度 | 隱藏（空間不足） |
| 769–1023px（iPad 直式） | overlay（同手機） | `.open` class（同手機） | 顯示 | 顯示，靠左（flex-1） |
| ≥1024px（iPad 橫式／桌面） | in-flow（佔真實版面寬度，推擠 content） | `.collapsed` class（`display:flex↔none`） | 顯示 | 顯示，絕對定位置中（`lg:absolute` + 40%／max 480px） |

- Topbar 順序固定：`[收合按鈕][品牌 logo+Jasper Hung][文章標題][icons]`，按鈕永遠最左。
- 收合按鈕只有一顆（`#sidebar-toggle-btn`），JS 用 `sidebarOverlayMedia = matchMedia('(max-width: 1023px)')` 判斷該切 `.open`（overlay）還是 `.collapsed`（in-flow）。
- Sidebar 自己內部**沒有**品牌列——topbar 常駐品牌後，sidebar 自己那排會變成永遠重複、永遠不可見的死代碼，已移除。
- Sidebar 寬度調整（`.sidebar-width-btn`，260↔500px，跟收合是不同功能）在所有尺寸都顯示；拖曳調寬（`.sidebar-resize-handle`）只在 ≥1024px。寬度上限用 `min(500, innerWidth)` 動態夾住，不留額外縫，因為收合按鈕在 overlay 外面、永遠點得到。
- 這條 1024px 分界是刻意選的：多數 iPad 橫向寬度落在 1024–1194px（12.9" 橫向 1366px 本來就 ≥1024 也一致），直向多落在 768–834px。

## 文章結構

每篇文章一個資料夾：

```
src/content/blog/
  [slug]/
    index.mdx   ← 文章本文（固定用 KeyTakeaways 摘要，**不需 import**，由 `[slug].astro` 的 MDX components prop 注入；一律 .mdx）
    image.png   ← 圖片放同層
```

- Slug 命名：英文 kebab-case，不加日期前綴（e.g. `cloudflare-dns-setup`）
- 圖片在 markdown 裡用相對路徑引用：`![說明](./image.jpg)`
- Slug 發布後不要改（= URL 不能變）
- 站內文章連結一律帶結尾斜線：`[標題](/posts/slug/)`。少了斜線，GitHub Pages 會先 301 導到 `/posts/slug/`，多一次往返，也會讓 GSC 多出「頁面會重新導向」。
- **圖片壓縮**：放入文章前先壓縮，目標 200KB 以下。用 `sips` 轉成 JPEG 75%：
  ```bash
  sips -s format jpeg -s formatOptions 75 原檔.png --out 輸出.jpg
  ```
  壓完刪掉原始 PNG，markdown 引用 `.jpg`。
- **圖片浮水印**：任何要放進文章的 raster 圖片（截圖、照片、生成圖）都要先燒入右下角 `jasperhung.dev` 浮水印，再引用輸出的檔案；不要只用 CSS 疊字。從 repo root 執行 `pnpm watermark <image> --out <正式檔案路徑>`，把已加浮水印的圖片輸出成乾淨的語意檔名；直接省略 `--out` 時才會產生同層的 `-watermarked` 預設檔名。需要固定顏色時用 `--tone light` 或 `--tone dark`；確認原圖可被取代時才用 `--overwrite`。
- **封面圖**：每篇文章一張生成主圖，從 repo root 執行 `pnpm cover <主圖> --slug <slug>`，產出 `public/images/posts/<slug>/og.jpg`（1200×630，OG／文章頁 hero／首頁卡片）與 `thumb.jpg`（480×360，列表縮圖），並在 frontmatter 補上 `cover: true`。主圖生成時已燒入浮水印的（16:9 生成圖常見）加 `--baked-watermark`：改從底部裁切保住浮水印，不再燒第二個。生圖構圖：主角、產品 logo、文字放在中央 70% 寬度內（4:3 縮圖的範圍），上下各 4% 不放重點；兩側只放氛圍。
- **圖片說明（選填）**：圖片語法後緊接一行 `<p class="image-caption">圖：說明文字</p>`（class name 固定，不可改），例如：
  ```markdown
  ![alt text](./image.jpg)

  <p class="image-caption">圖：說明文字。</p>
  ```
  build time 由 `src/plugins/rehype-figure-caption.ts`（rehype plugin，註冊在 `astro.config.mjs`）自動把「圖片段落 + 緊接的 `.image-caption` 段落」合併成 `<figure><img>...<figcaption></figure>`，不用改寫作習慣。文章頁的 lightbox（PhotoSwipe + dynamic-caption-plugin，邏輯在 `src/pages/posts/[slug].astro`）會從 `figcaption` 讀取說明文字顯示在放大圖片下方；沒寫這行則 fallback 用 alt text。
  - **alt 與 caption 分工**：alt 寫「畫面上有什麼」（給螢幕閱讀器、圖片搜尋、AI），caption 寫「這張圖代表什麼」（給讀者）。兩者不要寫成同一句，有 figcaption 時螢幕閱讀器會兩段都念。
  - **caption 只能是純文字**：不放反引號、`<code>`、連結、粗體，也不寫裸網址（`http://…` 會被 GFM 自動轉成連結）。需要標示指令或名稱時用「」。違反時 build 會失敗並指出是哪段 caption。

## Frontmatter 格式

```yaml
---
title: '文章標題'
ogTitle: 'OG Image|手動換行標題'
date: 2026-06-22T13:00:00+08:00
description: '一句話摘要，給 SEO meta description 用'
tags:
  - Astro
  - Site-Building
  - Dark-Mode
cover: true
series: openmemory
seriesOrder: 1
---
```

- `date`：ISO 8601，寫完文章 commit 前跑 `date +"%Y-%m-%dT%H:%M:%S+08:00"` 取當下時間填入；同一天多篇靠時間排序；排序與 JSON-LD `datePublished` 都靠這個
- `description`：必填，OG / Twitter Card / JSON-LD 都會用到
- `tags`：必填，描述性 tag 3–7 個（系列必帶 tag 另計），Title Case kebab-case 英文。選法、大小寫例外、黑名單都在 `tag-system/index.md`（writer 入口），不要憑範本或記憶選。`pnpm build` 前會先跑 `pnpm tags:check`，違規就 build 失敗。
- `cover`：有封面圖時為 `true`，由 `pnpm cover` 自動補上（見「封面圖」），每篇新文章都應該有
- `ogTitle`：選填，只給 OG image 排版用；用 `|` 指定手動換行，不影響文章 H1 / SEO title / RSS
- `series` + `seriesOrder`：選填。系列文章填相同的 `series` ID（英文 kebab-case）與顯示排序用的 `seriesOrder`；它可用於有序系列，也可用於 collection 的穩定排序。**開新系列或變更系列型別，要在 `src/lib/series.ts` 的 `seriesLists` 註冊 ID、顯示名稱與 `type`**。文章底部自動列出全系列，按 `seriesOrder` 排序；collection 仍顯示無編號的圓點清單。`seriesOrder` 按 `date` 由舊到新編 1–N，但 series 與 collection 在系列頁與文章底部都**倒序顯示**（最新、編號最大的在上）。系列頁每篇都顯示日期。
- `draft`：選填，預設 `false`。設 `true` 時文章只在 `pnpm dev` 看得到，production build 完全不產生（文章頁、`.md`、OG、首頁、RSS、sitemap、tag／series 頁、sidebar 都沒有），只用於下架已發布文章或測試頁。過濾做在 `src/content.config.ts` 的 loader 層，所有 `getCollection('blog')` 自動生效，不要在各頁另寫 filter。`markdown-style-test` 即以此排除。
  - 新文章 frontmatter 只寫上方範本列出的欄位，commit 後即上線；使用者明說「先不要發」或「下架」時才加 `draft`。（曾有 10 篇起草時被標成 draft，上線後 404 好幾天才發現。）
- 文章底部另有全站「上一篇/下一篇」導航：純按 `date` 時間排序、跨所有文章（上一篇 = 較舊），與系列正交、互不干擾

## SEO / AEO

已實作（不要重複加）：

- `<title>`、`<meta description>`、canonical、OG、Twitter Card、JSON-LD
- `<link rel="alternate" type="text/markdown">` — raw markdown endpoint for AI crawlers
- sitemap：`@astrojs/sitemap`，build 後產生 `sitemap-index.xml`
- `robots.txt`：已設定，指向 sitemap

Raw markdown endpoint：`/posts/[slug].md`（`src/pages/posts/[slug].md.ts`）

## OG Image

### 設計工具
`og-template.html` — 本地設計預覽用，用瀏覽器直接開啟。輸入 title → Download PNG 確認效果。
不部署、不 serve，純討論設計用。預設值需對齊 production：Sans CJK、weight 600、中下 JH、底部 24px 藍色腰帶。

### Build-time 生成
- `src/pages/og/[slug].png.ts` — Astro build 時自動為每篇文章生成 `/og/[slug].png`
- `src/pages/og/default.png.ts` — 首頁、About、Tags 等非文章頁的 fallback OG image
- `src/lib/og-image.ts` — 共用 Canvas renderer，文章 OG 與 default OG 都走這裡

Production 規格：
- 1200×630，黑底
- 標題：Noto Sans CJK TC Medium（repo 內建 `src/assets/fonts/NotoSansCJKtc-Medium.otf`），canvas 使用 600
- 文章圖：文章標題為主，支援 `ogTitle` 的 `|` 手動換行；沒有 `ogTitle` 時自動 balanced wrap
- 通用圖：`Jasper Hung|Coworking|with AI`
- 中下 JH mark：60px
- 底部藍色腰帶：`#60a5fa`，24px，只放底部
- 不放 avatar、作者名、網址；平台 link preview 會自動畫 favicon、domain、title

Metadata：
- 文章頁：有 `cover: true` 用 `/images/posts/{slug}/og.jpg`（`[slug].astro` 傳 `ogImageUrl`），否則用 `/og/{slug}.png`
- 非文章頁使用 `/og/default.png`
- 所有頁面都使用 `twitter:card = summary_large_image`

## 寫作 Checklist

寫新文章時（使用者說「寫 blog」、「起草文章」），自動對照：

**內容 SEO**
- [ ] Title：關鍵字在前半段 + 故事鉤（技術 SEO 由 Astro layout 自動處理）
- [ ] 開頭 100 字：關鍵字自然出現
- [ ] `description` frontmatter：120–155 字元，寫給點擊率
- [ ] H2/H3：放關鍵字變體，用完整陳述或問句
- [ ] 內部連結：連到同系列其他篇
- [ ] 圖片 alt text：描述圖片內容
- [ ] Tags：照 `tag-system/index.md` 先盲寫再比對；文章主角是具名產品／工具時一定要掛；跑過 `pnpm tags:check`

**AEO（AI 搜尋引擎優化）**
- [ ] 開頭有明確定義（「X 是什麼」）
- [ ] 第一人稱真實經驗：保留，AEO 加分項

**敘事結構**
- [ ] 情境 → 問題 → 解法 → 為什麼這個解法好
- [ ] 結語只談這篇，不做系列總結
- [ ] 篇幅：依主題需要寫完整；現有文章正文中位數約 3,000 字，不為符合字數壓短或灌水

## Blog Writing Workflow

When creating a new blog post from notes, summaries, session context, or rough ideas, use the `to-blog` skill.

When substantially rewriting an existing post, consider `to-blog` if the task involves restructuring narrative, extracting a thesis, generating frontmatter, or turning raw notes into publishable prose.

For light proofreading, typo fixes, title/description tuning, or targeted edits, do not force the skill; edit directly.
