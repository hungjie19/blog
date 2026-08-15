---
title: 'Obsidian MCPVault：讓 AI 自動查詢我的知識倉庫，形成跨對話長期記憶，打造第二大腦'
ogTitle: 'Obsidian MCPVault|讓 AI 自動查詢知識倉庫'
date: 2026-08-02T12:55:04+08:00
description: 'Obsidian MCP 讓 AI 助理能直接搜尋、讀取本機 Obsidian vault 裡的 Markdown 筆記全文，不必再手動回想關鍵字或指定資料夾。這篇記錄我為什麼選 MCPVault，以及它跟 OpenMemory、對話摘要三者怎麼分工。'
tags:
  - AI
  - MCP
  - Knowledge-Management
  - Markdown
---

> Obsidian MCP 是讓 AI 助理直接搜尋、讀取本機 Obsidian vault 裡 Markdown 筆記全文的橋接方式，不用先告訴 AI 去哪個資料夾找、用什麼關鍵字，它會自己翻。

一直以來，我都有一個習慣：每次和 AI 完成一段有價值的討論，就把過程整理成摘要存下來。我在〈[Session is Knowledge：把 AI 對話保存成自己的知識庫](/posts/session-is-knowledge/)〉寫過這個做法。

因為一個 session 結束後，我通常會問兩件事：剛剛解掉的問題，怎麼留下來變成知識？這次跑順的流程，怎麼下次直接重複使用？後者可以慢慢整理成 Skill；前者則先把對話、試錯和決策理由存成 Markdown，讓它不只留在某一個 AI 的對話窗裡。這篇要談的是前者。

但它有一個很手動的地方。我要先記得「好像以前討論過」，再想起可能放在哪個資料夾、該用什麼關鍵字，最後還得明確叫 AI 去那裡找。筆記已經存下來了，真正麻煩的是我得一直當那個指路的人。

後來我在網路上一直看到「第二大腦」和 [Obsidian](https://obsidian.md/) 這個名字，才開始研究：它到底是什麼，為什麼會有這麼多人用？

## Obsidian 迷人的地方，是筆記沒有被關在 App 裡

研究 [Obsidian](https://obsidian.md/) 時，我先遇到的是它的 CEO Steph Ango 提出的 [File over app](https://stephango.com/file-over-app) 理念：App 一定會隨時間變遷，真正值得留下的是使用者自己掌控、能隨時取回與閱讀的檔案。他自己的規則也刻意避開非標準 Markdown；這不是因為 Markdown 很潮，而是純文字格式不需要把未來綁在某一個 App 上。

Obsidian 正好把這個想法落到工具上：它是用來閱讀、編輯 Markdown 筆記的 App，但 vault 本身就是你電腦上的檔案。你可以用它整理連結、看 Graph、慢慢讀長文；即使不打開 App，資料也仍然是一份你自己拿得到的 Markdown 筆記庫。

我後來才理解它受歡迎的原因不只是 Graph 視覺很漂亮，而是它把核心資料留在本機文字檔，再讓社群把不同的使用方法往外長。撰文時，Obsidian 官方社群列出超過 6,260 個 plugins，其中 715 個在 AI 分類；這不代表每個人都該裝一堆外掛，反而說明了同一份 vault 可以長成很多不同的工作方式。[Obsidian Community](https://community.obsidian.md/)

我需要的那一種不是「在 Obsidian 裡多開一個 AI 面板」，而是讓我平常使用的 AI 能讀到筆記原文。這正好是 MCP（Model Context Protocol）能補上的位置。

## 手動查找、AI memory 與 Obsidian MCP，差在哪裡？

| 做法                   | 資料留下什麼                 | 找資料時誰要帶路             | 是否保留原始脈絡                       | 適合什麼情況                       |
| ---------------------- | ---------------------------- | ---------------------------- | -------------------------------------- | ---------------------------------- |
| 對話摘要手動查找       | 一份份 Markdown 摘要         | 我得記得可能的關鍵字與資料夾 | 可以                                   | 想回看某次明確知道存在的討論       |
| OpenMemory（記憶引擎） | 壓縮後的偏好、結論與記憶片段 | AI 先用語意回想              | 不一定；表格、流程與完整推理可能被壓縮 | 想快速找回「我平常怎麼做」         |
| Obsidian MCP           | 同一份本機 Markdown 原文     | AI 依當下問題自行搜尋、讀取  | 可以                                   | 需要找全文、上下文、表格或決策理由 |

## Obsidian MCP 不只一種，我為什麼選 MCPVault？

開始找 MCP 時，才發現「讓 AI 讀 Obsidian」不是單一方案。有人透過 Obsidian plugin 把 App 的功能接出去，也有人讓 MCP server 直接讀 vault 的檔案。我挑的是後者，因為我最在意的是 AI 能找回筆記，不是要讓 AI 遙控 Obsidian 的介面。

| 方案                                                                                            | GitHub ⭐ | 要開 App 嗎？ | 要裝 plugin 嗎？ | 適合情況                                                     |
| ----------------------------------------------------------------------------------------------- | -------: | ------------- | ---------------- | ------------------------------------------------------------ |
| [MCPVault](https://github.com/bitbonsai/mcpvault)                                               |    1,581 | ❌             | ❌                | 想讓 AI 搜尋、讀取 Markdown，並保留乾淨的設定                |
| [obsidian-mcp](https://github.com/StevenStavrakis/obsidian-mcp)                                 |      719 | ❌             | ❌                | 願意自行 clone、build，再把本機程式接進 AI client            |
| [官方 Filesystem MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem) |        — | ❌             | ❌                | 想最快把 vault 當一般檔案系統交給 AI 存取                    |
| [obsidian-mcp-server](https://github.com/cyanheads/obsidian-mcp-server) + Local REST API        |      646 | ✅             | ✅                | 除了讀寫筆記，也希望觸發 Obsidian UI 或 Command Palette 動作 |

真正符合「不開 App、不裝 plugin、直接讀檔」的，是前面三個方案。官方 Filesystem MCP 的設定最快，但它是通用檔案系統工具，不知道 frontmatter、標籤或筆記間連結的語意；`obsidian-mcp-server` 則明確要求 Local REST API plugin，所以放在表中是為了對照它能換來的 App 功能，而不是把它當成同條件選擇。

MCPVault 是我使用的橋接工具。它是一個開放原始碼的 MCP server，直接連接 vault，讓支援 MCP 的 AI 助理搜尋、讀取或在授權下寫入筆記。我選它不是因為它是唯一的 MCP，而是它剛好符合這次的邊界：可用 `npx` 直接執行、無須裝 Obsidian plugin、能安全處理 frontmatter，並且有適合筆記搜尋的 BM25 排序。[MCPVault GitHub](https://github.com/bitbonsai/mcpvault)

這不是三選一。我保留對話摘要，因為它把一次對話沉澱成可讀的紀錄；[OpenMemory](/posts/openmemory-local-ai-memory/) 則是我的記憶引擎，適合先叫回一小段可能相關的線索。Obsidian 是知識倉庫，保存能重讀、能驗證的全文、格式與脈絡；Obsidian MCP 的工作，是讓 AI 拿著記憶引擎找回的線索，回到這個倉庫取用原文。

## 第一次設定 MCP，之後就不用每次帶路

第一次需要做的事不多：準備一個存放 Markdown 的 Obsidian vault、安裝 Node.js，再把 MCPVault 加到你使用的 AI 工具設定中。MCPVault 官方文件提供各種 AI client 的設定方式；下面是最小概念，`/path/to/your/vault` 換成自己的筆記庫路徑即可。

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": ["@bitbonsai/mcpvault@latest", "/path/to/your/vault"]
    }
  }
}
```

這不是要把 Obsidian App 常駐開著，也不是要在 Obsidian 裡裝外掛。MCPVault 直接讀取 vault 裡的檔案；設定完成後，重新啟動 AI 工具並用一句「列出我的筆記庫檔案」驗證即可。完整的安裝與各平台設定可看 [MCPVault Quick Start](https://github.com/bitbonsai/mcpvault#quick-start-5-minutes)。

:::caution
MCP 代表 AI 能接觸你的檔案。首次設定時只指向你願意讓 AI 使用的 vault；若不需要寫入，就優先採取唯讀的操作習慣，也不要把敏感資料夾一起放進範圍。
:::

## 從「幫我查這個資料夾」變成自然地繼續討論

設定前，我的問題通常長得像這樣：「我印象中之前有寫過對話摘要，請到某個資料夾搜尋某個詞。」問題本身已經夾帶了一半的搜尋工作。

設定後，我只需要照平常的方式說：「我們之前為什麼決定這個流程？」「幫我找上次討論過的架構取捨。」「這個決定有沒有舊紀錄可以佐證？」AI 會先從 memory 找可能的片段，再依需要用 MCP 搜尋筆記庫、讀取相符的全文，最後帶著找到的脈絡繼續討論。

這條路也讓 [OpenMemory 記憶策略](/posts/openmemory-memory-strategy/) 有了更清楚的位置：OpenMemory 不需要裝成全文資料庫，它是記憶引擎，負責快速喚回線索；Obsidian 是知識倉庫，負責保留可以驗證、可以重讀的原文。兩者接起來，手動回想與指定搜尋路徑的工作就自然交給 AI 了。

我最喜歡的不是 AI 多了一個工具，而是對話終於能順著問題往前走。以前要先證明自己記得哪裡有資料；現在我只要把問題說清楚，剩下的交給它去翻筆記。

換帳號、換 AI，不變的是我的知識庫。今天不管換成什麼工具，AI 都能沿著同一條路回去找資料；我累積下來的知識與脈絡，不需要跟著某個 App 或帳號重新開始。
