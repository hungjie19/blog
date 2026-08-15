---
title: 'Claude Code Remote Control：設定好了，但 Mac 差點睡著'
date: 2026-07-24T19:32:00+08:00
description: '第一次用 Claude Code Remote Control 從手機接手 Mac 上的工作，才發現遠端控制最重要的前提：真正執行工作的電腦不能睡著。'
tags:
  - Claude
  - Claude-Code
  - Remote-Control
  - MacOS
series: remote-control
seriesOrder: 2
---

第一次用 Claude Code 的 Remote Control，是我人在外面、卻還想知道 Mac 上那條工作做到哪裡的時候。

手機打開 Claude App，點進已經啟用的 session，就能看到 Claude 正在做什麼、補一句指令，或在它需要決定時接手。這不是把 terminal 縮到手機上操作；手機接到的是 Mac terminal 裡正在進行的同一條 Claude 對話。

我回到電腦前，看到的對話進度也和手機上一模一樣。這種連續感是它最好用的地方。

## Claude Code 的 Remote Control 是什麼？

Remote Control 是 **Claude Code CLI** 內建的功能，不是 Mac 的遠端桌面，也不是 SSH。它把一條正在 Mac 上 Claude CLI 裡運行的 session，延伸到 Claude App 或瀏覽器。

所以手機端看到的不是另一個新對話，而是那條本機 session 的延續。Claude 仍在 Mac 上執行，專案檔案、工具、MCP 與終端機環境都留在原本的電腦；手機只是同一條 session 的另一個視窗。[Claude 官方 Remote Control 文件](https://code.claude.com/docs/en/remote-control)也說明，Remote Control 將手機或瀏覽器連到本機運行的 Claude Code session，對話與工作進度會在各裝置之間同步。

如果已經在 Mac 的 Claude Code session 裡工作，只要輸入 `/remote-control`，或它的縮寫 `/rc`：

```text
/remote-control
# 或 /rc
```

就能把目前這條 session 開放給手機或瀏覽器接手。

這也是我第一次覺得「遠端工作」不一定等於遠端桌面。我要做的是追蹤工作進度、交代下一步，而不是在手機螢幕上找方向鍵、慢慢打一串 terminal 指令。

## 設定好了，我才想到 Mac 會睡著

用了一會兒，我突然想到一件很現實的事：我的 Mac 插著電，但仍有自動休眠設定。

Remote Control 的執行環境在本機。Mac 睡著，這條 session 就不能繼續工作。於是我直接在另一條 Claude session 問：「有沒有暫時不要讓電腦睡著的方法？」

第一個方向是：

```bash
sudo pmset -a sleep 0
```

它確實能改系統休眠設定，但需要輸入 Mac 密碼，而且是持久變更。遠端時 Claude 可以替我下指令，卻不能替我跨過 macOS 的 `sudo` 密碼提示；那是本機使用者必須親自確認的安全關卡。

## `caffeinate` 剛好適合這一次

後來找到的解法是：

```bash
caffeinate -d -i -m -s
```

它不需要改永久設定，也不需要 `sudo`。它只在這個 Terminal 工作期間阻止 Mac 睡眠；Terminal 關掉，指令結束，Mac 就回到原本的休眠規則。

這剛好符合我的情境：我不是要讓電腦從此不睡，只是這段遠端工作還沒結束，先不要睡。

## 回到電腦，工作沒有換地方

Remote Control 最讓我意外的不是「手機也能下指令」，而是它沒有創造另一個工作現場。手機與電腦都在接同一條 Claude session；我從手機追進度、補充要求，回到 Mac 後仍然沿著同一段對話繼續。

這次小小的防休眠插曲，也讓我理解它的前提：透過 Remote Control，Claude 可以在手機上被接手；但真正讀檔、執行工具與保存工作脈絡的，始終是那台還醒著的 Mac。
