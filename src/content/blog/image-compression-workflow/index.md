---
title: "搞定 Blog 圖片的三件事：管理、引用、壓縮"
date: 2026-06-22T14:13:00+08:00
description: "Markdown 插圖的兩個痛點：1. 路徑太長：用資料夾結構 + 相對路徑解決管理；2. 體積太重：用 macOS 內建 sips 解決壓縮，一行指令壓掉 90%，不用裝任何東西。"
tags:
  - workflow
  - image-compression
  - 建站
---

用 Markdown 寫部落格，插入圖片這件事一直讓我有點煩躁。

第一個問題是管理。圖片要放哪？路徑要怎麼寫？如果只是隨手丟一個資料夾，之後要刪文章的時候，還得回去找圖在哪——這種事情應該有更好的方式處理。

第二個問題是體積。截圖、AI 生成的圖、流程示意圖，通通是 PNG，一張動輒 1.8–1.9MB。部落格不需要這麼精細的圖，但直接上傳的話，幾張圖下去頁面就超重了，得先壓縮才能用。

兩個問題都跟 AI 討論了一遍，看看有沒有更乾淨的做法。

---

## 圖片放哪：與文章同層管理

Astro 文件最直接的推薦做法是把圖片丟進 `public/` 資料夾，這樣圖片就有固定的網址可以連結——但這是我最怕的管理方式。圖片跟文章分開放，看不出哪張圖屬於哪篇文章，刪文章的時候也不知道圖還要不要一起清。

於是請 AI 去查官方文件跟其他 blog 的做法，看看有沒有別種選擇。查回來發現 Astro 其實支援另一種結構：每篇文章一個資料夾，就像寫 React component 的習慣——一個元件一個資料夾，相關的東西全部放在一起。這樣看起來就非常好懂了。

把 blog 改成這個結構：

```
src/content/blog/
  image-compression-workflow/
    index.md        ← 文章
    screenshot.jpg  ← 圖片放同層
```

這樣一篇文章就是一個資料夾，圖片跟文章在一起，搬移或刪除都不會漏掉。

---

## 插入 Markdown：Relative path

圖片放同層之後，插入的時候也簡單了——直接用 `./` 相對路徑就好，不用從根目錄一路把網址拼完：

```markdown
![截圖說明](./screenshot.jpg)
```

簡單、好用、好管理，圖片跟文章放在一起，引用也跟著在一起。

---

## sips：macOS 內建的圖片處理工具

（Scriptable Image Processing System）macOS 內建就有，不用另外安裝，開 Terminal 直接用。

最基本的壓縮：

```bash
sips -s format jpeg -s formatOptions 75 input.png --out output.jpg
```

`-s formatOptions 75` 是 JPEG 品質（0–100）。75 對 blog 用途是個很好的甜蜜點：視覺上幾乎看不出差異，但體積差距很明顯。

我的實際結果：**1.9MB PNG → 200KB JPG，縮了 90%**。

---

## 常用組合

```bash
# 單檔壓縮
sips -s format jpeg -s formatOptions 75 input.png --out output.jpg

# 縮小尺寸（等比例，最大寬度 1200px）
sips -Z 1200 input.jpg --out output.jpg

# 先縮尺寸再壓縮
sips -Z 1200 -s format jpeg -s formatOptions 75 input.png --out output.jpg

# 批次：資料夾內所有 PNG 轉 JPG
for f in *.png; do
  sips -s format jpeg -s formatOptions 75 "$f" --out "${f%.png}.jpg"
done
```

`-Z` 是等比縮放，只需要指定最長邊的像素值，不用算寬高比。

---

## sips 的限制

知道限制，才能判斷什麼時候要換工具：

- **只有 macOS**：Linux / Windows 沒有，CI 環境要用 ImageMagick 或 Sharp
- **不支援輸出 WebP**：可以讀 WebP，但輸出只能是 JPEG / PNG / TIFF 等傳統格式
- **沒有自動優化**：不會像 Squoosh 那樣試各種參數找最佳值，你要自己決定品質數字

對於 blog 這種人工處理、每次幾張圖的場景，這三個限制都不痛。

---

## 讓系統記住規則，不靠記憶

處理完圖片之後，我做了一件事：把壓縮規則寫進 `~/blog/CLAUDE.md`。

```markdown
## 圖片

新增圖片前先壓縮。macOS 用 sips：
sips -s format jpeg -s formatOptions 75 input.png --out output.jpg
```

這樣做的原因不是怕忘記——而是讓 AI 在進 blog 目錄時自動知道這條規則，不用每次重說。

寫進 CLAUDE.md 這個動作本身，就是「機械規則標準化」的示範：把你已經決定的事情固化成系統規則，往後不用靠記憶，也不用靠溝通。

---

## 心得

這次解決的兩件事，方向其實一樣：不是找更複雜的工具，而是找更合適的做法。

圖片管理的問題，解法是結構——資料夾+相對路徑，讓圖片跟文章永遠在一起，不用額外記在哪、刪的時候也不用再找。

壓縮的問題，解法是 macOS 內建就有的東西——一行指令、零依賴、90% 壓縮率，完全夠用。
