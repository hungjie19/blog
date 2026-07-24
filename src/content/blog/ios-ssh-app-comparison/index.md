---
title: '手機 SSH App 怎麼選：Termius、Attach、Reattach、Moshi'
date: 2026-07-24T20:02:49+08:00
description: '手機已經能透過 Tailscale SSH 回 Mac 之後，Termius、Attach、Reattach、Moshi 的差別不在能不能連線，而在 terminal、tmux 與弱網操作的摩擦。'
tags:
  - SSH
  - Tailscale
  - MacOS
  - Remote-Access
series: remote-control
seriesType: collection
---

把手機和 Mac 放進同一個 Tailscale 網路、開好 SSH 後，理論上已經可以從外面連回家了。但第一次在手機上真的打開 terminal，我才發現「連得上」只是開始。

我要看的可能是一段 log，也可能是正在跑的 Claude Code；有時只要補一句指令，有時又得在好幾個 tmux 工作區之間切換。這時候手機上的 SSH App，不再只是輸入 host、port 和密碼的表單，而是決定我能不能舒服地回到工作現場。

這篇接在[〈手機 SSH 回 Mac：先用 Tailscale 建一條自己的私有網路〉](/posts/mac-ssh-tailscale-setup/)後面：前一篇處理「手機怎麼安全找到 Mac」，這篇只談找到之後，用哪一個 App 比較順手。

## 我比較的不是「能不能 SSH」

Termius、Attach、Reattach 和 Moshi 都能讓手機連進 Mac。真正拉開差距的是三件事：它們是否把 tmux 做成適合觸控操作的介面、Mac 端要不要多裝常駐服務，以及手機離開 Wi-Fi、切到行動網路時，連線能不能自然續上。

`tmux` 可以把正在 Mac 上執行的 terminal 工作留在原地；手機斷線或 App 關掉後，重新連回來仍能回到同一個工作現場。它不是每個人一開始都需要的東西，但一旦同時開著多個專案或 AI CLI，手機端「怎麼找回那一格」會立刻變成體驗差異。

| App | 手機端的重點 | Mac 端準備 | 付費方式 | 我會在什麼時候選它 |
| --- | --- | --- | --- | --- |
| [Termius](https://apps.apple.com/us/app/termius-ssh-client-terminal/id1176074088) | 一般 SSH terminal | 不需額外服務 | 基本 SSH 可免費使用 | 臨時看 log、下一個指令 |
| [Attach](https://apps.apple.com/in/app/attach-ssh-native-tmux/id6760011289) | 原生 tmux 瀏覽與操作 | SSH + tmux | 買斷約 NT$150（待確認） | 常在手機切 session、window、pane |
| [Reattach](https://apps.apple.com/us/app/reattach-tmux-remote/id6757171671) | 以 tmux session 為中心，支援通知與快速回覆 | `reattachd` + 能讓手機連到它的私有通道 | 依 App Store 為準 | 想把 AI 等待回應變成推播事件 |
| [Moshi](https://apps.apple.com/us/app/moshi-ssh-mosh-terminal/id6757859949) | SSH、mosh、tmux 與 agent 功能整合 | SSH；進階功能再加 mosh、tmux、`moshi-hook` | 免費層 + Pro | 經常在 Wi-Fi 與行動網路間移動 |

價格與方案會調整，所以這裡只保留付費模型；購買前還是以各自 App Store 或官方頁面的當下資訊為準。

## Termius：先把它當成手機上的 terminal

我最先用的是 Termius。它沒有試圖替 terminal 發明另一套操作方式：連上去之後，就是一個可以輸入指令、看輸出的 SSH 視窗。Mac 不用多開服務，已有的 SSH 設定直接拿來用。

這反而是它很好的起點。出門時只想看一眼 process、確認部署有沒有跑完，或進 tmux 後補一行指令，免費的基本 terminal 已經完成任務。缺點也很明確：當 tmux 裡有多個 session、window 和 pane，手機小螢幕仍得用指令和快捷鍵自己找路。

## Attach：把 tmux 變成可以點的介面

Attach 的方向剛好相反：它直接把 tmux 當成產品核心。官方把它定位為原生 tmux 介面，可以瀏覽 session、window、pane，而不是只把桌面 terminal 縮到 iPhone 上；也針對 Claude Code、Codex 這類 coding agent 的等待輸入做通知與一鍵回連。[官方網站](https://attach.sh/)目前採一次買斷，而不是訂閱。

對我來說，它解決的是「我已經知道工作還在 tmux 裡，但不想在手機上背 prefix 組合鍵」這件事。前提仍然很乾淨：Mac 上有 SSH 與 tmux 就好，不必再架一層專屬 daemon。

## Reattach：讓手機直接認得每一條 tmux session

Reattach 也以 tmux 為中心，但架構更像替手機做了一個 tmux 遙控器。Mac 或 Linux 上需要跑 `reattachd`，它提供 HTTP API 連到 tmux；手機掃 QR code 配對後，就能看到 session、window 和 pane，也能收到 AI 要求輸入或工作完成的推播。[官方說明](https://reattach.tmux.kumabook.tokyo/)把本機連線與經由 VPN／tunnel 的遠端連線分開描述；對我的設定來說，Tailscale 正好可以提供那條私有通道。

它的代價是多了一個要安裝與維護的服務。換來的是更明確的「多條 session 儀表板」和推播式工作流：不是一直打開手機確認 Claude 有沒有問問題，而是它需要你時再叫你回來。

## Moshi：不是只有 SSH，而是為移動中的 terminal 準備

Moshi 的範圍更大。免費層已經有 SSH、金鑰保護、agent 事件通知和兩組已儲存連線；Pro 才加入 mosh、tmux 配對、圖片貼入、diff viewer 等功能。它的官方文件也把需求說得很清楚：想用 mosh 就在 host 裝 `mosh-server`，想讓工作區跨 terminal 重連存在，就在 host 裝 tmux。

mosh 的價值不只是另一種連線協定。手機常常會鎖螢幕、離開咖啡店 Wi-Fi 後切到行動網路；這種情境下，能承受網路切換並自動接回 session，才是它比一般 SSH 更有感的地方。不過這些進階能力都在 Pro，因此它適合的是已經知道自己會長時間在手機操控 terminal 的人，而不是剛把遠端 SSH 設好、還沒確定會不會常用的人。

## 先選最少摩擦的那一個

四套玩了一輪之後，我最後沒有把它們排成冠軍到末名。Attach 的買斷價約 NT$150，看起來可能是很划算的選項；不過我還沒有購買，所以先不把它寫成定論。它適合 tmux 已經變成日常工作桌面的人；Reattach 值得給想要推播與多 session 控制的人；Moshi 則把弱網和整套 agent 工作流一起往前推。

真正要先回答的不是「哪個 App 最強」，而是「我從手機回 Mac 時，到底要做什麼？」如果只是查狀態，普通 terminal 就很夠；如果是要繼續跟 Claude Code 對話，內建的 [Remote Control](/posts/claude-code-remote-control-mac/)反而是另一條更直接的路。手機上的工具越來越多，幸好不是每一個都得先買下來才知道答案。
