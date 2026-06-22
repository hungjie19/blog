---
title: "Blog 設計語言：從 AI Desktop 借來的 Layout"
date: 2026-06-22T16:00:00+08:00
description: "Blog 的 layout 從開始就決定了：跟 Claude、ChatGPT、Cursor 長一樣。不是巧合，是刻意的——既然內容是 AI cowork 記錄，形式本身就應該呼應這件事。"
tags:
  - design
  - astro
  - 建站
---

開始構思 blog 的時候查了很多模板——經典的、簡約的，設計都很好。但那些模板有自己的原意，不一定是我想說的話。

又是 AI 時代，前端也是熟悉的領域，決定安裝最基礎的版本，從頭設計 Layout。這樣每一個設計決定都是自己的。

---

## 構想：AI Desktop 作為 Layout 設計語言

Blog 的版面結構是這樣的：

- **左側 Sidebar**：文章列表、導航、About
- **右側主區域**：文章內容

這個佈局一看就很眼熟。Claude web、ChatGPT、Perplexity、Cursor——全都是這個結構：左邊是 chat list，右邊是對話內容。

對應關係很直接：chat 紀錄變成文章列表，對話窗變成文章本體。

行動版也一樣的邏輯——只保留 header 和必要按鈕，sidebar 藏進漢堡選單。介面不複雜，讀者注意力只在內容上。

這不是「sidebar 剛好適合放導航」這種實用理由，是刻意的。

---

## 形式呼應內容

這個 blog 寫的東西，是我跟 AI 協作做開發的過程記錄。

概念是借鏡 IG：IG 是分享相簿，那這個 blog 就是分享 AI cowork 的過程。既然內容是 AI cowork，形式本身就應該呼應這件事。

讀者進來的第一秒，不需要任何文字說明，介面本身就在傳達：這是一個跟 AI 協作的記錄本。

Marshall McLuhan 有一句話：the medium is the message。Layout 本身就是主題的一部分，不只是裝內容的容器。

---

## 認知零成本

AI Desktop 的 UI pattern，2024–2026 年已經是 de facto 標準。

大部分開發者每天在用這個介面——開 Claude 寫程式、開 Cursor 看建議、開 ChatGPT 查東西。這個左 sidebar + 右內容的結構，已經是肌肉記憶了。

用這個 pattern 做 blog layout 的好處是：讀者不需要學。進來就知道左邊是「可以選的東西」、右邊是「現在看的東西」。沒有認知摩擦，注意力可以直接放在內容上。

:::tip
de facto 源自拉丁文，英文寫作 de facto standard，意思是「事實上的標準」——沒有人明文規定，但大家都長一樣。
:::

---

## 心得

這是這個系列裡最晚寫的一篇，但寫的是最早決定的事。

這個 layout 從第一天就定了，從來沒有改過，也從來沒有被當成一個「決策」記下來——因為太顯而易見了，就像魚不知道水的存在。

直到討論系列文章的順序，才突然意識到：欸，這件事根本沒存到任何地方。

顯而易見的決定，最容易忘記記下來。
