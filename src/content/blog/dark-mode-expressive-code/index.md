---
title: "讀起來更舒服：Dark Mode 切完，才發現 Code Block 沒跟上"
date: 2026-06-22T13:10:35+08:00
description: "Dark Mode 切好了，但 code block 還是黑的。從 CSS class-based 架構、防閃爍 FOUC，到換掉手刻 code block——讓整個 blog 讀起來真正舒服。"
tags:
  - dark-mode
  - expressive-code
  - astro
  - 建站
---

現在不管是 App 還是作業系統，幾乎都有 dark mode。工程師族群尤其習慣開著深色模式工作——長時間盯著螢幕，眼睛比較不累。

既然自己也是這樣用的，blog 當然也需要有這個功能。於是我跟 AI 一起來實作。

沒有這個習慣的使用者，則可以保持白底介面，不影響原本的閱讀習慣。

實作起來沒有想像中複雜，主要是 CSS 這邊的調整就可以搞定。但做完第一版、切到 light mode 之後，我發現 code block 沒有跟著變——它還是深色的。這才開始了一系列的討論，去找真正的解決方案。

這篇記錄的就是這個過程：Dark/Light mode 切換的實作，以及後來發現 code block 需要另外處理——才能真正完成一套完整的主題切換體驗。

--- 

## CSS 架構：從 media query 改成 class-based

最直觀的做法是用 `@media (prefers-color-scheme: dark)` 跟著系統走。但這樣沒有辦法手動切換——使用者按了 toggle，沒有任何地方可以寫入「我要覆蓋系統設定」。

改成 class-based 是標準解法：

```css
/* 淺色（預設） */
:root {
  --bg: #ffffff;
  --text: #111111;
}

/* 深色：html 加上 .dark class 就切換 */
html.dark {
  --bg: #111111;
  --text: #f0f0f0;
}
```

Toggle 按下去，JS 在 `<html>` 加或移除 `.dark`，整頁顏色跟著 CSS 變數走。

---

### 防閃爍：UX 細節，但讀者感受得到

做完 dark mode 之後，還有一個細節要處理。

如果你選了 dark mode，每次重新整理頁面，它會先閃一下淺色再切回去——只有零點幾秒，但對長期用深色模式的人來說，那一閃會很突兀，像螢幕突然打了你一下。

這個問題叫 FOUC（Flash of Unstyled Content）。解法是在 `<head>` 最早的位置放一段 inline script，在任何 CSS 執行之前就把 class 設好：

```js
const saved = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = saved ?? (prefersDark ? 'dark' : 'light');
document.documentElement.classList.add(theme);
```

這段要在所有 `<link>` 和 `<style>` 之前執行，否則還是會閃。

---

## Code Block 也要跟著 Theme 走

白色背景有了、可以手動切換了，但在白色背景下 code block 卻還是黑色的一塊——整體不一致，看起來很突兀。

於是跟 AI 討論：

> 「Code block 要有行號跟複製按鈕吧？另外，幫我評估一下，可不可以讓它跟著 dark/light mode 換 theme？」

AI 開始動手：CSS counter 做行號、JS 寫 copy 邏輯，然後去爬 light mode 的 CSS 準備手動塞進去……

我直覺這種東西應該是改 config 就能做到，方向不對，馬上按 Esc 把 AI 叫停：

> 「不可能連行號和複製按鈕都要自己刻吧？GitHub 上一定有更完整的 code block 套件，幫我找。」

AI 找回來的答案是 **Expressive Code**（`astro-expressive-code`）——Astro 生態系最成熟的 code block 套件，Starlight 文件網站也是用它。內建複製按鈕（有「已複製」的狀態回饋）、行號（穩定不跑位）、frame title（標示 code 在哪個檔案）。原來真的有，而且功能比預期的還完整。

```bash
pnpm add astro-expressive-code @expressive-code/plugin-line-numbers
```

`astro.config.mjs` 加上：

```ts
import expressiveCode from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

export default defineConfig({
  integrations: [
    expressiveCode({
      plugins: [pluginLineNumbers()],
      themes: ['monokai', 'github-light'],
    }),
  ],
});
```

:::tip
`pluginLineNumbers` 是 named export，不是 default export。寫成 `import pluginLineNumbers from ...` 不會報錯，但行號不會出現——這個坑很多人會踩。
:::

換完之後，手刻的行號 CSS、copy button script 全部拔掉，code block 的 UX 反而比之前好。

---

## 兩個系統，一個你沒預料到的連結

設定 Expressive Code 雙 theme 時，加了 `themes: ['monokai', 'github-light']`，以為 `html.dark` / `html.light` class 就會控制切換。

Build 完打開 light mode，code block 還是深色。

去看 build 出來的 CSS，才發現 EC 完全不看 CSS class——它用的是 `data-theme` attribute：

```css
/* Monokai：預設，:root 就套 */
:root { --ec-codeBg: #272822; }

/* GitHub Light：要 <html data-theme="github-light"> 才觸發 */
:root[data-theme='github-light'] .expressive-code {
  --ec-codeBg: #ffffff;
}
```

文件沒有說清楚這件事，要看 build output 才能發現。

所以 toggle JS 除了換 class，還要同步 set 和 remove `data-theme`：

```js
function setTheme(theme) {
  document.documentElement.classList.remove('dark', 'light');
  document.documentElement.classList.add(theme);

  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'github-light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  localStorage.setItem('theme', theme);
}
```

防閃爍的 inline script 也要同步加上 `data-theme` 設定，否則頁面載入時 code block 仍然會閃。

---

## 心得

Dark mode 跟 code block 看起來是兩件獨立的事，但它們最後在同一個 toggle function 裡交會。做完之後，讀者切換主題的那一秒，整頁——包括 code block——同步切換，UX 體驗大升級，這些細節很值得。
