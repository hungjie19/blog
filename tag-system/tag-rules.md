---
date: '2026-07-03'
tags: [tag-system, blog]
---

# Blog Tag Rules

Blog tag 治理的規則層。Writer 應先讀 `index.md`，需要細節時再讀本檔。這份文件只管理 `~/blog` repo 的文章 frontmatter tags；不要讀 `~/ai_session_summary/tag-system/` 來替 blog 選 tag。兩邊可以參考同一套 controlled vocabulary 方法，但 data layer 必須 by repo。

## 寫入流程

1. 讀本 repo 的 `tag-system/canonical-tags.md`、`aliases.md`。
2. 掃 `src/content/blog/**/index.md` 的 frontmatter tags，取得 blog 既有 tag 語料。不要用 `mcp__obsidian__list_all_tags`，它只看 Obsidian vault，看不到 blog repo。
3. 候選 tag 先查 aliases；有 preferred tag 就換成 preferred。
4. 跟 blog 既有 tag 做語意比對；有貼合的穩定 tag 就重用。
5. 真的沒有貼合 tag 時，才新增適合讀者瀏覽與文章分類的穩定主題軸。

`deprecated-tags.md` 不在普通 writer 流程內。它是 `tag-taxonomy` 做低頻 audit/cleanup 時用來確認退役詞與批次修正的治理檔，避免 writer 每次寫入都把歷史黑名單載進 prompt。

## Normalization

- 英文 lowercase kebab-case。
- 不用中文 tag；既有中文 tag 先視為待治理 drift，不在寫新文時延續。
- 產品/模型/工具名也小寫，例如 `ai`、`gpt`、`claude`、`openmemory`、`mcp`。
- 不用 issue number、排行榜名次、hex 色碼、commit SHA、檔名、路徑片段。

## Blog 視角

Blog tags 是 reader-facing 文章分類，不是內部工作流程紀錄。除非文章主題本身就是內部工具或流程，否則避免把 `session-summary`、`handoff`、`cmux`、`summon-agent` 這類執行細節放進 blog tags。
