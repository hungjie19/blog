---
title: "Blog 個人識別層：從 favicon 到 AuthorCard 到 About 頁"
date: 2026-06-22T14:30:00+08:00
description: "搭建個人識別系統，從 favicon 延伸 AuthorCard 再到 About 頁。AI 生成圖選圖、About 文案怎麼寫，還有 iOS Safari 的 100dvh bug 一次說完。"
tags:
  - astro
  - component
  - 建站
---

在構思還有什麼是 blog 新增元件的時候，第一個想到的就是作者卡片這個元件，因為 Medium 把作者欄發揮很成功，讓我覺得這個東西是必須的。

滑到文章最下面，乾淨的版面裡只出現一個精準的作者欄：大頭貼、簡短介紹、追蹤按鈕。讀者剛讀完文章、情緒在最高點，往下一滑就遇到你——這個設計讓「閱讀完畢 → 認識作者 → 追蹤」變成一個無縫的動作。Medium 是第一個把這個做成功的平台，也定義了之後所有 blog 的標準。

所以在規劃 blog 功能的時候，AuthorCard 是第一個想到的元件。作者欄之外，還需要一個 About 頁讓人能去更完整地認識你——兩個功能一起做，概念上是同一件事。

另外還有一個細節要先處理掉：瀏覽器標籤頁的 favicon。總不能讓人看到一個灰色的地球 icon 一直在那邊，不夠乾淨也沒有識別感。

---

## 第一版：先用 favicon 佔位

favicon 和 AuthorCard 都需要一張「代表自己的圖」，但那張圖還沒有。正在想要不要去找圖庫或生成器的時候，AI 直接說：「我用 SVG 做一個就好，建議用 J 當符號。」

favicon 做好之後，AuthorCard 的頭像還沒著落。靈機一動——favicon 是 SVG，拿來套 `border-radius: 50%` 不就是圓形頭像了？

意外地好看。J monogram 在圓框裡很乾淨，整個 AuthorCard 可以先上線，之後換圖只需要改一行路徑，不影響其他結構。

這個「先佔位、結構不動、後換內容」的思路，跟 React component 的設計邏輯是一樣的。

---

## 生成一張數位識別圖

favicon 做好之後，開始討論 AuthorCard 和 About 頁要用什麼圖——個人照片、不同風格的插圖，還是做一個 logo？

AI 建議走「數位分身」的方向：生成一個有自己風格的虛擬形象，比照片更有品牌感，也不用真的對著鏡頭。選圖和生成的過程另外有一篇文章，這裡只說結果：最後用 ChatGPT 生成的兩張圖做為識別。

後來我把這段過程另外整理成 [〈打造數位分身：為什麼圖片生成 AI 很難駕馭？〉](/posts/image-generation-digital-avatar/)。那篇主要記錄實際踩坑：同一個意圖丟給 Gemini 和 ChatGPT，為什麼一開始很有生命力，越加規格卻越失控；以及為什麼「用文字駕馭圖片」比想像中更像一個工程問題。

---

## About 頁：從名片排版到 Hero

About 頁需要一段自介文案。突發奇想：AI 同時連著我的 OpenMemory 和 Obsidian 筆記，它到底認識我到什麼程度？不如讓它直接從記憶和筆記裡推論，幫我生一版看看。

生出來的確很認識我——但全部都是公司專案的內容，不適合拿來做公開的個人介紹。還是手動寫了一個草稿，再請 AI 潤稿。

版面的部分，原本是傳統的小頭像 + 名字 + 職稱排版。有了生成圖之後改成：

```
[場景圖，全寬橫幅]
Jasper Hung
Software Engineer，從前端出發...
...bio...
GitHub
```

讓圖片佔滿整個寬度，文字接在下方——比名片排版更有個人品牌感，也更像你在認識一個人，而不是在看履歷。

---

## iOS Safari 捲動 Bug

AuthorCard 加完上手機測試，發現頁面無法往下捲動，author card 被截斷。

根本原因：`body` 用了 `height: 100vh`，但 iOS Safari 的 `100vh` 計算包含 browser toolbar 高度，`<main>` 的可捲動區域就被 toolbar 擠掉了。

修法一行：`100vh` → `100dvh`（dynamic viewport height，動態排除 browser toolbar）。

之後凡是需要全高版面，直接用 `100dvh`。

---

## 心得

搭建自己的 blog，其實跟開發一個系統很像——先找到最基礎的共同元件，把那個問題解決掉，後面就會很順。favicon 就是那個起點：有了 J monogram，AuthorCard 拿去用，About 頁再從 AuthorCard 延伸出去。一步一步搭起來，每一步都不大，但加起來就是一個完整的個人識別系統。

About 頁的文案那段也是，讓 AI 試著從我的記憶裡推論出自介，雖然最後還是自己手動寫，但這個過程蠻有趣的——有點像照鏡子，看看 AI 眼中的你長什麼樣子。
