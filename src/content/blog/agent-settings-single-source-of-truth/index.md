---
title: 'Agent 設計：Claude 與 Codex，同一個角色，兩種載入方式'
ogTitle: 'Agent 設計：Claude 與 Codex|同一個角色，兩種載入方式'
date: 2026-07-26T12:15:41+08:00
description: 'Claude 與 Codex 的 Agent 格式不同，是否就得維護兩套？我用 shared contract、registry 與 runtime adapter，把角色設定拆成各自只有一份權威來源。'
tags:
  - AI
  - Claude
  - Codex
  - MCP
  - Workflow
---

我一直很喜歡 Claude 的 Agent 設計，因為它的心智模型很直覺：先定義一個角色，再決定要讓它接手主對話，或在背景當一個專職 subagent。角色本身不需要跟著使用方式重寫一次。

後來我把同一套工作方式搬到 Codex，才發現事情沒有那麼單純。它不是少了 Agent，而是把不同情境的載入入口拆開了。也正是這個差異，逼我重新理解 Agent 設定的 Single Source of Truth 到底該放在哪裡。

## Claude：一份角色定義，兩種使用方式

Claude 的設計很直接：同一份 Markdown agent file，既可以被叫成 subagent，也可以用 `claude --agent <name>` 讓主 session 套用該角色。[官方文件](https://code.claude.com/docs/en/sub-agents) 也把這兩種用法放在同一份 custom subagent 定義下。

這種設計讓我很容易建立直覺：一個 Agent 就是一份角色定義。角色要做什麼、回報長什麼樣子、哪些事情該交給它，集中在同一個地方；主 session 與 subagent 只是使用它的兩種方式。

## Codex：角色與主 session 走不同入口

Codex 現在也有 custom agents，能以 `~/.codex/agents/*.toml` 定義專職 subagent，並設定 model、sandbox、MCP 或 skills；但主 session 走的是另一條入口：`codex --profile <name>` 會載入對應的 profile configuration layer。[Codex 的 custom agents 文件](https://learn.chatgpt.com/docs/agent-configuration/subagents)與 [profiles 文件](https://learn.chatgpt.com/docs/config-file/config-advanced#profiles)把這兩件事分開定義。

所以 Codex 的差異不只在 TOML 與 Markdown，而在誰會讀這份資料、什麼時候讀。Claude 原生把主 session 與 subagent 收在同一種 agent file；Codex 則把 custom agent 和 profile 分成兩條載入路徑。

如果只看檔案格式，很容易得到一個煩人的結論：同一個角色似乎得在 Claude 寫一次、在 Codex 的 custom agent 寫一次、再為 Codex profile 補一次。但真正該問的不是「我要維護幾個檔案」，而是「哪些內容真的應該由同一個地方定義」。

## 兩個目錄，兩種載入方式

把兩邊的個人設定目錄排在一起看，結構其實很像：都是 runtime 根目錄底下有一個 `agents/` 資料夾。Codex 多出來的，是和 `agents/` 同一層的 profile 檔。

```text
Claude
~/.claude/
└── agents/
    └── reviewer.md
```

```text
Codex
~/.codex/
├── agents/
│   └── reviewer.toml
└── reviewer.config.toml
```

Claude 會讓 `reviewer.md` 同時服務兩種情境：主 session 以 `claude --agent reviewer` 套用角色，或由目前對話把它派成 subagent。Codex 則明確分工：`agents/reviewer.toml` 是被派出去的 custom agent；`reviewer.config.toml` 則在 `codex --profile reviewer` 時疊加到主 session 設定上。

profile 本質上是 Codex 的命名設定層，不是官方定義的 Agent 檔。不過如果我把 `reviewer` 這個 profile 當成「以 reviewer 角色開一個主 session」的入口，它就剛好補上了 custom agent 沒有處理的那一半。

## 同一個角色，格式怎麼對照？

兩邊不會逐欄完全相同，但角色真正需要的骨架很接近：名字、什麼時候該用它、核心工作指令，以及它能載入的能力。以下只留下會影響設計判斷的欄位：

| 重點 | Claude | Codex |
|---|---|---|
| 作為 subagent | 讀取 `~/.claude/agents/reviewer.md` | 讀取 `~/.codex/agents/reviewer.toml` |
| 作為主 session | 仍讀取 `~/.claude/agents/reviewer.md` | 讀取 `~/.codex/reviewer.config.toml` |
| 使用指令 | `claude --agent reviewer` | `codex --profile reviewer` |
| 格式 | Markdown + YAML frontmatter | TOML |
| 角色名稱 | `name` | `name` |
| 何時使用 | `description` | `description` |
| 角色靈魂與工作項目 | Markdown 正文 | `developer_instructions` |
| Skills 載入（選用） | `skills` frontmatter 預載指定 Skills | `[[skills.config]]` 可在 config layer 設定；custom agent 未指定時繼承 parent session |

這也是我後來不再把它理解成「兩套 Agent」的原因。兩邊都在描述同一個角色意圖，只是 Claude 把主 session 與 subagent 收進一份 Markdown；Codex 將 custom agent 與主 session profile 拆成兩條 runtime 載入路徑。

## 檔案不同，角色不必重寫

前面兩種檔案都必須存在，因為 Claude 與 Codex 的載入方式不同。Markdown、TOML、model、權限與 profile 都是各自 runtime 的事情，硬把它們合成同一個檔案沒有意義。

但角色的工作原則不該跟著重寫。像是它負責什麼、怎麼回報、什麼結果才算完成，這些是 Agent 的共同工作規格，和 Claude 或 Codex 無關。我把這一層獨立成 shared contract，讓兩邊的 runtime 定義都參考同一份規格。

換句話說：Claude Markdown 與 Codex TOML 是兩個入口；角色意圖才是應該只有一份的東西。Codex 的 profile 與 custom agent 若有相同設定，可以用 symlink 減少複製，但那只是一座橋，不代表兩個入口從此完全相同。

## SSOT 不只是一份角色規格

除了角色本身，跨工具還會共用另一種資料：有哪些 Agent、各自擅長什麼、哪些工作不該派給它。這些名單與 routing 如果散在不同工具裡，新增或調整角色時就很容易漏改。

所以我把 roster、capabilities、excludes、default account 這類 metadata 收進 `registry.yaml`，讓需要它的工具都讀同一份。registry 不負責描述 Agent 的完整語氣或每一條工作指令；它只回答控制端最需要的問題：有哪些角色、各自適合做什麼、哪些工作不該派給它。

這就是我現在理解的 Single Source of Truth：不是把所有東西塞進一個萬用檔案，而是讓每一種資料各自只有一個負責定義的位置。角色規格有 shared contract，名單與 routing 有 registry，Claude 與 Codex 的啟動細節則留在自己的 runtime 檔案裡。
