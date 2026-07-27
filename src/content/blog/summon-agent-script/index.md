---
title: 'summon script：把輪詢式 Skill 拆成可直接使用的啟動指令'
ogTitle: 'summon script：把輪詢式 Skill|拆成可直接使用的啟動指令'
date: 2026-07-26T23:53:26+08:00
description: '當我已經知道要叫誰、用哪個帳號時，不必再讓 Skill 一題一題問。把 cmux 啟動流程抽成 summon script 後，能直接使用，也能讓 Skill 少帶一大段操作細節。'
tags:
  - AI
  - Agent
  - Claude
  - Codex
  - Workflow
series: summon-agent
seriesOrder: 2
---

我原本用 Skill 召喚 Agent。它會先問我要找誰，選完再問要用哪個帳號，接著還要問在哪裡開。這個流程沒有錯，但每一題都是一次新的來回：我回答一次，context 多一段；它再追問一次，context 又多一段。

有些時候，這種引導很有用；但更多時候，我早就知道自己要叫 CASE、要用哪個帳號、也知道要另開 workspace。這時候讓 AI 一題一題問，不是在幫我思考，只是在替一個明確指令加上對話成本。

所以我突發奇想：既然選項都已經定義好了，能不能把它串成一支 script？我自己輸入參數，直接把對應的 Agent 叫出來。後來的 `summon`，就是從這個念頭長出來的。

## 輪詢還在，但不必交給 LLM 執行機械步驟

Skill 的輪詢式設計沒有錯，也不該拿掉。選 Agent、帳號與工作位置，本來就是每次召喚都需要做的選擇。

我想省下的，是讓 LLM 每次重新理解一大段條件、逐題追問，再把 cmux 指令拼出來的成本。這些步驟沒有判斷價值，本質上是固定的機械操作；既然選項已經定義好，就該由 script 封裝，而不是讓 Skill 臨場推測怎麼做。

`summon` script 於是保留同一套輪詢，但把它搬到終端機選單：

```text
召喚哪個 Agent？

1) JARVIS     Infra｜AWS/Terraform/Docker/CI-CD
2) TARS       React/TypeScript｜FE 實作
3) KAY        Android/KMP｜實作
4) CASE       QA/review｜不改 source
5) RAPHAEL    策略顧問｜規劃/討論
6) VERA       思考夥伴｜模糊問題
7) EVE        調查/證據蒐集｜read-only

選擇 [1-7]: 1

帳號
1) Claude（personal）
2) Claude（company）
3) Codex
4) Claude + 遠端控制（personal，手機/瀏覽器接管）

選擇 [1/2/3/4, Enter=personal]: 1

開在哪裡？
1) 這個 terminal
2) 新 workspace

選擇 [1/2, Enter=1]:
```

它也保留帶參數的直接用法：

```sh
summon CASE personal workspace
```

這不是為了少打幾個字，而是把不需要 AI 參與的操作移出對話。Agent 決定這次找誰協作；帳號只決定登入身分、可用模型與額度；workspace 則決定工作從哪個目錄開始。它們可以自由組合，沒有哪個 Agent 天生只能配某個帳號。

## Skill 負責讓 Agent 看懂，script 負責真的啟動

把選擇移到 script 之後，我才回頭看 summon Skill 本身。早期我把不少 cmux 操作細節寫在裡面，等於每次要召喚時，Skill 都得帶著一大段「怎麼開 workspace」的說明。這很彆扭：Skill 是給 AI 讀的工作說明，script 才是應該負責機械步驟的執行層。

| Skill | summon script |
| --- | --- |
| 說明有哪些 Agent、各自適合什麼任務 | 建立 workspace、啟動 runtime、設定名稱與顏色 |
| 幫 AI 判斷該派誰 | 接收已決定的參數並執行 |
| 隨 Agent 的工作規格演進 | 處理 cmux 與終端機細節 |

這個分工讓 Skill 不必預載一大段操作手冊。AI 只要決定「要派哪種工作角色」，就呼叫對應的 `summon` 指令；至於 workspace 怎麼建立、指令送到哪個 terminal，交給 script 處理。當我已經知道答案時，更可以完全略過 AI，自己直接下同一行指令。

## 新增 Agent，不該變成修改五份清單

script 變得好用後，下一個問題反而更明顯：Agent 名稱、顏色、能力描述與帳號 label 原本散在 script 與 Skill 裡。新增一位 Agent，就得記得改好幾個地方；少改一處，選單與實際設定就開始分岔。

所以後來又把名單收進 registry。選單的順序、顯示名稱與能力描述各自有清楚的資料來源；script 讀 registry 產生選單，Skill 也指向同一份資料。這樣新增 Agent 時，改的是 roster，不是到處搜尋字串。

例如新增一位前端實作 Agent，只需要在 registry 加上一筆：

```yaml
agents:
  frontend-implementer:
    role: React / TypeScript 前端實作
    color: '#eab308'
    default_account: personal
    capabilities: [frontend, react, typescript]
    excludes: [android, kmp]
```

這裡最重要的不是 YAML 或 zsh 本身，而是界線：**資料定義一次，執行流程才可以多個地方使用。**

## cmux：在旁邊開 pane，或另開一個 workspace

cmux 一開始的設計是 split pane：我留在左邊，新的 Agent 在右邊，兩個 terminal 可以並排看。要從目前的 pane 往右或往左切開，指令分別是：

```sh
cmux new-split right --focus true
cmux new-split left --focus true
```

這適合需要一邊工作、一邊盯著 Agent 的過程。但右側 pane 有時會被 cmux 的對話面板收折，工作畫面就跟著被擠壞；後來我不再把每個新 Agent 放成同一張桌面上的分割窗格。

現在預設改成新 workspace：它會在左側 workspace 列多一個 tab，每位 Agent 有自己完整的工作現場。

```sh
cmux new-workspace --name "frontend-implementer Claude" --command "claude --agent frontend-implementer" --focus true
```

### 指令要送到 pane，還是 workspace？

split pane 裡的新 terminal 是可見的，可以對它的 surface 送指令；但單 terminal per workspace 的配置裡，未選中的 surface 對 cmux 來說可能是 hidden。這時用 `--surface` 送指令會失敗，應該改成指定 workspace：

```sh
cmux send --workspace workspace:14 "請開始處理這個任務"
```

這也是我把「新 workspace」保留成預設的原因。它不只是整理桌面，而是替新 Agent 建一個明確、可追蹤的工作現場；之後要回去看它用了哪個帳號、正在做什麼，也不必靠記憶猜。

## summon 不是另一個 AI，而是一個乾淨的派工入口

回頭看，這支 script 沒有讓 Agent 變得更聰明。它只是把本來散落在選單、Skill、終端機與自己腦中的啟動流程，收斂成一次可重複的選擇。

但這種小小的收斂很有感。以前要先想「我等等要輸入哪些東西」；現在只要先想「這件事該找誰做」。剩下的，就讓 summon 把工作現場搭起來。
