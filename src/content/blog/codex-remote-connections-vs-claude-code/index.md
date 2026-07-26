---
title: 'Codex Remote 為什麼比 Claude Code Remote Control 更順？'
date: 2026-07-24T22:31:35+08:00
description: '實際用手機接手 AI 工作後，我發現 Codex Remote 對我的 workflow 更順：隨時回到任一專案或對話，而不是只能接住一條預先開放的 session。'
tags:
  - Codex
  - Claude-Code
  - Remote-Control
  - AI-Workflow
series: remote-control
seriesOrder: 4
---

我第一次從手機用 Codex 接著處理一段工作，回到 Mac 前卻愣了一下：原本打開的桌面對話還停在剛剛的地方，手機上新增的內容沒有立刻出現在眼前。

一開始我以為是同步沒做好。因為我剛用過 [Claude Code Remote Control](/posts/claude-code-remote-control-mac/)，它的感覺很直覺：手機接進去的，就是 terminal 裡那條正在跑的對話。後來才發現，我是拿 Claude 的使用模型在理解 Codex；兩者雖然都叫遠端控制，接的其實不是同一件事。

而理解這件事之後，我反而覺得 Codex 對我的工作方式更順。

## Claude 開的是一條正在工作的 session

Claude Code 的 Remote Control 是以 **session** 為中心。你在 Claude Code CLI 的某一條對話裡輸入 `/remote-control` 或 `/rc`，就是把這條正在 Mac 上執行的 session 延伸到手機或瀏覽器。

手機、terminal 與瀏覽器因此看的是同一段工作。你從手機補一句指令，回到電腦時，原本那個 CLI session 仍然是同一個現場。這很像把一張正在工作的桌子，暫時搬到手機上。

[Claude 官方文件](https://code.claude.com/docs/en/remote-control)對這件事的描述也很直接：Remote Control 連到本機執行中的 Claude Code session，對話會在裝置之間同步。

## Codex 開的是一台 host 的工作庫

Codex 的做法不同。它的 **Remote connections** 是先連到執行 ChatGPT desktop app 的那台 host，再從那台電腦的 project 與 chat 歷史裡，開新 chat 或繼續既有 chat。

官方文件寫得很清楚：遠端工作會使用 connected host 的 projects、files、credentials、permissions、plugins 與 local tools；手機端也可以在 host 的 projects 裡開始或延續既有 chat。[Codex Remote connections 官方文件](https://learn.chatgpt.com/docs/remote-connections)

所以 Codex 的重點不是「把這條 terminal session 曝露出來」，而是「讓手機進入這台電腦管理的工作庫」。它比較像你回到一間有很多專案資料夾與歷史紀錄的工作室，再挑一個 thread 繼續。

```text
Claude Code Remote Control
  手機 → 這一條 live session

Codex Remote connections
  手機 → 這台 host → project / chat history → 選一條繼續
```

## 我想回哪一條，就回哪一條

這也解釋了我最初的困惑。我期待手機續聊後，桌面原本打開的 Codex 對話視窗會像 Claude CLI 一樣立刻往下長；但 Codex 的資料組織本來就更接近 project 與 chat history。

我實際看到的是：手機可以把工作接著做下去，但回到電腦時，原本開著的 terminal view 不會自動長出手機新增的內容。我要先離開眼前這個 terminal，再回到 Codex 的 project/history 裡找到那條 chat、重新 resume，才會看到手機上的後續對話。

這是 Codex 很明確的缺點：多了一步。官方文件沒有承諾既開 view 的即時刷新行為，所以我不把它當成 bug，也不把它當成固定規則；但如果你的期待是「回到電腦，原本那扇 terminal 就是完整最新現場」，Claude 的體驗確實比較直接。

而這個操作方式，我其實很喜歡。Codex 會依工作資料夾把歷史展開成樹狀結構；我可以先從專案位置找，也可以看每條對話的短摘要與最後一段內容，快速找到想接回去的工作。要延續任一既有對話可以，要以某個資料夾重新開一條新工作也可以。它不是只把「現在這條」交給手機，而是把我的工作脈絡整體變成可選的入口。

## 在 App Store 找不到 Codex，並不是找錯

第一次設定時還有一個很幽默的地方：我在 App Store 搜尋 Codex，卻找不到一個可下載的 Codex 手機 App。後來才知道，手機端用的是原生的 **ChatGPT App**；進入裡面的 **Remote／遠端** 分頁，才能連回電腦上的 Codex 工作。

這個命名確實變過。2026 年 5 月剛推出時，官方稱它為「Codex remote access from the ChatGPT mobile app」；目前的說明則使用 ChatGPT mobile 的「Remote tab」，並明確表示 Codex 不能在手機上直接選取，只能透過 Remote 存取支援的桌面 Codex chats。[ChatGPT Release Notes](https://help.openai.com/en/articles/6825453-how-chatgpt-uses-sources)與[官方 FAQ](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex)剛好把這段演變說得很清楚。

手機端雖然是 ChatGPT App，真正工作的仍是桌面 host。因此桌面上的 Codex（現在整合在 ChatGPT desktop app 裡）必須保持開啟，電腦也必須醒著、連著網路；它關掉或睡著，手機端的 Remote 就沒有可以接回去的工作現場。[官方 release note](https://help.openai.com/en/articles/6825453-how-chatgpt-uses-sources)也明確把「host 保持 awake、online、running Codex」列為遠端持續可用的條件。

## 對我來說，Codex 反而更順

Claude 的強項是「我現在這條工作，不要斷」。它適合你已經在 terminal 裡跑了一段，出門後只想從手機接著指揮。

Codex 的強項則是「我想從這台主機的工作紀錄裡，挑一條回來」。配對完成後，不需要先替每一條工作開遠端入口；你進到 host，再找 project 和既有 chat 就好。

| 問題 | Claude Code Remote Control | Codex Remote |
|---|---|---|
| 手機接手前要動作嗎？ | 要，在目標 session 輸入 `/remote-control` 或 `/rc` | 不用，host 配對完成後可直接進入 |
| 電腦要開著 Desktop App 嗎？ | 不用，CLI session 本身就是 host | 要，Codex Desktop App 必須開啟且 host 在線 |
| 手機看得到哪些工作？ | 只有已執行 `/rc` 的那條 session | host 上可遠端存取的 projects 與既有 chats |
| 回到電腦時 | 原本 terminal session 仍是完整現場 | 要從 Codex 的 project/history 找到該 chat 再 resume |

所以我的結論很簡單：對我來說，Codex Remote 反而更準、更順。我要接回任一條舊對話、從特定資料夾開一條新工作，或只是在手機上快速找回上次停在哪裡，都比先判斷「我是不是有替那條 Claude session 開 Remote Control」更直接。

原本讓我困惑的畫面，最後反而變成我更偏好 Codex 的原因：Claude 交出的是一條 live session；Codex 交出的是一台 host 的工作庫。我更常需要的是後者。
