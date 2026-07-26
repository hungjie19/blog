---
title: 'Skill 不該複製進每個 Agent：用 reference 保留共同來源'
ogTitle: 'Skill 不該複製進每個 Agent|用 reference 保留共同來源'
date: 2026-07-26T15:56:49+08:00
description: 'Agent 需要的是角色與 routing，不是每一份 Skill 的完整手冊。把 Skill 留在共同來源、讓 Agent 按需 reference，才能避免多帳號與多 Agent 的規則慢慢分岔。'
tags:
  - AI
  - Claude
  - Codex
  - Skill
  - Workflow
series: agent-workflow
seriesOrder: 3
---

替 Agent 寫 instruction 時，很容易有一個直覺：既然這個 Agent 要做 code review，就把 review 的流程、輸出格式、檢查清單全貼進它的檔案；另一個 Agent 也要 review，就再貼一次。

一開始很省事。後來要改一條規則，才會發現自己得先想起它被複製到哪幾個 Agent 裡。

我在整理多帳號環境時，慢慢把這件事拆開：Agent 與 Skill 都是在描述工作，但它們不該存同一種資訊。

## Agent 說明「誰該做什麼」

我不是每次有任務才臨時描述「幫我找一個會做前端的人」。我會先把 Agent 特化成固定會執行某類工作的協作者，替它定義開發能力、工作邊界與 workflow，然後替它取一個能記住的名字。這些名字的靈感來自電影裡的 AI 助理；對我而言，它們不是裝飾，而是讓我能快速辨認「這次該找哪一位協作者」的入口。

之後的使用就很直接：需要分頭處理時，我把工作派給一個 subagent；需要一路和它協作時，則把這個角色套進主 session。無論走哪一條路，它都應該先帶著固定的角色與工作方式，而不是每次重新拼一段 prompt。

Agent 定義的是工作邊界：什麼任務要交給它、它要用什麼角度判斷、最後要回報成什麼樣子。workflow 則是它面對任務時的固定骨架，例如先讀取哪些工作規格、完成後要做哪些驗證、什麼情況要再找其他能力幫忙。

這些資訊必須留在 Agent 裡，因為它決定 routing。例如一個 reviewer Agent 知道自己該在變更完成後檢查風險、列出 finding；一個寫作 Agent 知道自己該先確認素材與讀者，再開始起草。

但「review 要逐項檢查哪些細節」或「文章 frontmatter 要怎麼寫」不是角色本身，而是可重複使用的工作手冊。更重要的是，這些手冊不必在 Agent 出生時全部帶上；把它們複製、甚至預載進每個 Agent，只是同時埋下未來的同步問題與啟動成本。

## Skill 是可共同維護的工作手冊

我後來讓 Skill 留在一個共同來源：一份 `SKILL.md` 專心描述它的觸發條件、操作步驟、限制與輸出契約。

```text
~/agent-core/skills/        ← 共同來源
├─ shadcn/SKILL.md          ← 每一項能力都只有一份手冊
├─ design-taste-frontend/SKILL.md
├─ tailwind-design-system/SKILL.md
├─ vercel-react-best-practices/SKILL.md
├─ debug-issue/SKILL.md
├─ ponytail/SKILL.md
└─ review-changes/SKILL.md
```

這和〈[三個 AI 帳號，一套工作環境：Single Source of Truth](/posts/three-accounts-one-agent-environment/)〉的原則相同：共同來源的問題已經解決，這裡接著處理的是 Agent 要不要把這些能力全帶著出生。

## TARS：不預載 Skill 的前端協作 Agent

假設我有一個叫 `TARS` 的前端協作 Agent。它的 description 是協助修復前端介面、處理 React、TypeScript 與樣式問題；但 frontmatter 刻意不寫 `skills:`。這不表示它不會做前端，而是它先帶著工作判斷，再依這次任務讀取真正需要的專業手冊。

```markdown
---
name: TARS
description: Senior React/TypeScript frontend implementer. Use for frontend fixes, component work, and UI collaboration.
model: sonnet
color: yellow
memory: user
---

## Workflow

1. 要調整 UI 元件結構或使用元件庫時，**Read** `~/agent-core/skills/shadcn/SKILL.md`。
2. 需要做版面、視覺品質或設計取捨時，**Read** `~/agent-core/skills/design-taste-frontend/SKILL.md`。
3. 要修改 Tailwind token、utility 或共用 design system 時，**Read** `~/agent-core/skills/tailwind-design-system/SKILL.md`。
4. 要處理 React／TypeScript 寫法與效能取捨時，**Read** `~/agent-core/skills/vercel-react-best-practices/SKILL.md`。
5. 遇到難以定位的互動或畫面 bug 時，**Read** `~/agent-core/skills/debug-issue/SKILL.md`。
6. 實作完成後需要做精簡與 diff review 時，**Read** `~/agent-core/skills/ponytail/SKILL.md`。
7. 需要獨立檢查變更風險時，**Read** `~/agent-core/skills/review-changes/SKILL.md`。
```

這個 workflow 不是把七份 Skill 再抄一遍；它只保留「何時使用」與「為什麼使用」。Agent 持有這次工作的角色與 routing，Skill 才持有「怎麼做」的完整細節。於是 `TARS` 不需要每次出場都帶著七份手冊，但碰到對應任務時，仍能讀到同一份最新版本。

## 不要把 reference 變成另一種複製貼上

真正需要留在 Agent 的，是短而明確的判斷規則。假如它完全不知道什麼時候該讀某個 Skill，那把手冊放得再整齊也沒有用。

所以 Agent 裡應該留下的是：「遇到 X，使用 Y Skill。」至於 Skill 裡長長的步驟、範例、欄位定義與例外處理，才是 reference 的內容。這和全域 instruction 的「路由表 vs 操作手冊」是一樣的分工，只是這次把邊界放在 Agent 與 Skill 之間。

:::tip
Skill 不是每次都必須預載。共同來源解決的是「要改哪一份」；預載或按需讀取則是「這一次要不要把它帶進 context」。這兩個判斷要分開看。
:::

## 把重複拿掉，角色反而更清楚

最後留下來的 Agent 檔變短了，但不是被抽空。它只保留這個角色真正獨有的判斷、語氣與回報責任；共用的做法則回到 Skill。

我喜歡這個分法，因為它讓「新增一個 Agent」不再等於複製一份過去的工作記憶。角色可以增加，手冊仍然只有一份；下一次改規則時，也不用猜哪一個副本才是真的。
