---
title: 'Claude Dispatch：從手機派工到 Cowork 或 Claude Code'
date: 2026-07-24T23:09:00+08:00
description: 'Claude Dispatch 不再只是綁定一個 Cowork session 的獨立介面。它現在像一個持久的派工中樞，依任務類型分流到 Cowork 或 Claude Code。'
tags:
  - AI
  - Claude
  - Remote-Control
  - Workflow
series: remote-control
seriesOrder: 5
---

我第一次注意到 Claude Dispatch 時，對它的印象很簡單：手機上有一個獨立的入口，丟一件事進去，它就替我推送到一個 Cowork session 裡做。

但那種感覺比較像一個固定 station。一個 Cowork 工作綁一個入口，想看新的工作時，並沒有很直覺。隔了一段時間再回頭看，我才發現它已經不是原本那個樣子了。

我重新研究 Dispatch，其實是因為想弄清楚它和 Remote Control 到底差在哪裡。兩者都能讓我人在手機上、工作留在電腦上，但它們交到我手上的，不是同一種東西。

## Dispatch 是一條持久的派工對話

現在從側欄點進 **Dispatch**，打開的是一條持久對話。你不需要先替每件事決定要開 Cowork 還是 Claude Code；只要像交代同事一樣，說明希望完成的結果。

Dispatch 會自己把要求拆成 child tasks，在背景執行，完成後把結果整理回這條對話。每個 child task 都能從側欄打開，查看進度、完整紀錄與產出的檔案。

[官方文件](https://claude.com/docs/cowork/guide/dispatch)的定位很清楚：Dispatch 是 Cowork 裡長時間運作的 agent，適合「現在交辦，晚點回來看結果」的工作。這和一般 Cowork chat 最大的差別是，使用者不必盯著每一步。

這裡很容易誤會成「既然只有一個 Dispatch agent，就只能有一個工作桌」。現在不是這樣。一條 Dispatch 對話確實只有一個 parent agent，但它可以在底下開多個 child tasks；每個 child task 都能指定不同的 Code workspace 或 Cowork project。單一的是派工主線，不是所有工作只能塞進同一個 session。

## 它會自己決定工作該去哪裡做

我覺得真正有趣的改變，不是多了一個 sidebar，而是它不再固定只把工作送往 Cowork。

官方現在把任務分成兩條路：

| 任務類型 | Dispatch 路由到哪裡 | 例子 |
|---|---|---|
| 開發工作 | Claude Code session | 修 bug、跑測試、開 Pull Request |
| 知識工作 | Cowork session | 研究、寫文件、整理檔案 |

所以在我現在看到的 Claude 介面裡，Home 與 Code 都有 Dispatch 的入口，並不是重複放了兩套功能。Dispatch 對話本身只有一條；真正被分流的是底下的執行 session。知識工作會在 Cowork 這側執行，開發工作則會出現在 Code 側欄。

這個模型比原本「一個入口對一個 Cowork session」好理解得多：Dispatch 是派工桌，不是工作桌。

## 手機不是遙控器，而是派工台

從手機也能直接打開 Dispatch、交代任務；只要 Claude Desktop 開著、電腦醒著且在線，工作就會在那台電腦上執行。任務需要核准或完成時，再透過通知把你叫回來。[官方的手機流程](https://claude.com/docs/cowork/guide/dispatch)也是這樣描述：手機負責交辦與查看結果，桌面是 Dispatch host。

這點讓它和 [Claude Code Remote Control](/posts/claude-code-remote-control-mac/) 很容易混淆，但兩者其實不同：

```text
Remote Control：我接手一條正在本機跑的 live session
Dispatch：我交代一個結果，讓它分派工作並在背景完成
```

前者適合「這條工作我正在做，出門後想繼續指揮」；後者適合「我現在不想盯著它，先把事情交出去」。

## 一個入口，背後有兩種工作桌

回頭看，Dispatch 變得好用的原因不是它取代了 Cowork，而是它承認 Cowork 和 Code 本來就該處理不同事情。它把分流的判斷收進一條持久對話裡，讓使用者只要描述結果，不必先替產品架構做選擇。

對我來說，這才是它現在最有意思的地方：手機上的 Dispatch 不是另一個遙控器，而是一個能把工作送到正確工作桌的派工台。
