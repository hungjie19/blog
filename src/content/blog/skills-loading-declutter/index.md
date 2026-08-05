---
title: 'Skills 裝太多之後：內建健檢 doctor 怎麼幫我決定預載、按需讀取，還是移除？'
ogTitle: 'Skills 裝太多之後|健檢 doctor 怎麼決定去留？'
date: 2026-07-26T15:04:04+08:00
description: 'Skill 不是裝得越多越好。我用 Claude Code 內建的 /doctor 健檢盤點裝了什麼，再從 subagent 啟動時的 context 成本出發，重新分辨預載、按需讀取、共同 reference 與移除四種去處。'
tags:
  - AI
  - Claude
  - Codex
  - Skill
  - Workflow
series: agent-workflow
seriesOrder: 4
---

我有一段時間很容易看到好用的 Skill 就安裝。設計、研究、規劃、review，先收下再說。直到某次想替 subagent 瘦身，才發現它還沒開始做事，context 就已經先付出一筆不小的開機費。

一開始我以為問題出在 `CLAUDE.md` 太長。量完才發現，我抓錯大頭了。

## 真正佔位置的，是 Skill 的說明清單

當時我的環境裝了 47 個 user Skills。把每個 Skill 的 `name` 與 `description` 加總後，約有 20.2 KB，估計是 5,500 到 7,000 tokens；相較之下，`CLAUDE.md` 約 2,000 到 2,800 tokens。

這不代表 47 份 `SKILL.md` 正文全被塞進來。一般情況下，啟動時先帶的是 Skill 的名稱與說明，正文等真正觸發時才讀。但對 subagent 而言，這份說明清單會再付一次；若 Agent 的 frontmatter 又明確綁定 `skills:`，指定 Skill 的完整內容還會預載進去。

問題從來不是「Skill 本文是不是很長」，而是我讓多少能力一直站在入口等著。

## `/doctor` 給我一份清單，不是一鍵刪除按鈕

研究途中，我才發現 Claude Code 可以在對話裡輸入 `/doctor` 做健檢；Codex 也有同等用途的 `codex doctor`，但它要在系統終端執行。[Codex 官方文件](https://learn.chatgpt.com/docs/developer-commands?surface=cli#cli-codex-doctor)把它定義為本機安裝、設定、登入與 runtime 的診斷報告。

兩個入口的觸發方式不同，但幫我的事情一樣：把「我到底裝了什麼」攤開來看。

不過我很快踩到一個反例。`/doctor` 當時讀的是其中一個帳號的 usage 計數；另一個帳號裡，幾個看似低 usage 的 Skill 其實仍在工作。要是只看那一份報告直接刪，反而會誤傷自己常用的流程。

所以診斷報告是盤點起點，不是裁決書。

## 我後來把每個 Skill 分到四個去處

| 這個能力的情況 | 我會怎麼放 |
|---|---|
| 固定 Agent 每次都需要 | 預載，明確付出 token 成本 |
| 只有特定類型任務才需要 | 保留 Skill，讓它按需觸發 |
| Agent 專屬的方法論，不想污染主 context | 移到共同 reference，由 Agent 在需要時 `Read` |
| demo 遺留、失效引用或已無實際用途 | 移除，連同引用與 metadata 一起檢查 |

這個分類也改變了我看待「低 usage」的方式。低 usage 不一定代表沒價值：有些是低頻但必要的救援工具；有些則是只該住在特定專案，不該讓所有 session 都替它付費。

例如我把幾個思考方法的完整檔案移出 Skill 掃描路徑，改由特定 Agent 在符合情境時讀取。內容沒有濃縮或犧牲，只是從「每個 Agent 都先背著」改成「真的需要時再拿出來」。

## 瘦身不是刪得越多越好

後來留下來的 Skill 比以前少，但我不再把清單變短當成目標。真正重要的是，每一份常駐內容都要回答得出來：它是不是每次都值得佔一個位置？

這個問題看起來很小，卻會隨著 subagent、不同帳號與更多工作流程一路放大。把 Skill 放到對的位置後，Agent 開場終於不必先背著一整間工具倉庫。 
