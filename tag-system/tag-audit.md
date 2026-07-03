---
date: '2026-07-03'
tags: [tag-system, blog, changelog]
---

# Blog Tag System 決策紀錄

## 決策清單

### 1. Blog tag data layer 獨立於 ai_session_summary vault

**日期**：2026-07-03
**內容**：建立 `~/blog/tag-system/`，包含 `tag-rules.md`、`canonical-tags.md`、`aliases.md`、`deprecated-tags.md`、`tag-audit.md`。`create-my-blog` skill 寫文章 frontmatter tags 時讀 blog repo 這份 source of truth，而不是讀 `~/ai_session_summary/tag-system/`。

**原因**：tag source 應 by repo。Blog 的讀者分類語意、既有 frontmatter tags、SEO/AEO 用途都跟 Obsidian vault 的 session/wiki tags 不同；共用 vault canonical/alias/deprecated 會把兩個語料庫混在一起。

### 2. Blog tag inventory 不用 Obsidian list_all_tags

**日期**：2026-07-03
**內容**：blog 寫入流程改成掃 `src/content/blog/**/index.md` 的 frontmatter tags 取得既有語料，不呼叫 `mcp__obsidian__list_all_tags`。

**原因**：`list_all_tags` 只能看到 Obsidian vault，看不到 Astro blog repo。用它替 blog 選 tag 會比對錯誤資料來源。

### 3. 不預填 blog canonical/alias/deprecated

**日期**：2026-07-03
**內容**：撤回初始建立時預填的 blog canonical groups、aliases、deprecated mappings。這些檔案先保留為空骨架，等執行 blog tag audit、抽樣確認既有文章用法後再填。

**原因**：repo-local `tag-system/` 是 data layer，不應由 skill 或初始化動作憑直覺填入具體 tag 決策。治理流程可以共用，但每個 repo 的 canonical/alias/deprecated 必須來自該 repo 的實際 audit 與人類裁決。

### 4. 新增 index.md 作為 blog writer 入口

**日期**：2026-07-03
**內容**：新增 `tag-system/index.md`，定義 `create-my-blog` 寫 tag 時只需從入口讀取必要規則，並掃 `src/content/blog/**/index.md` 的 frontmatter tags 作為全量既有詞彙。

**原因**：寫 blog tags 不應讀治理歷史或未裁決的 deprecated 清單，也不應讀 Obsidian vault 的 tag system。入口文件能把 write-time selection 和 low-frequency audit 分開。
