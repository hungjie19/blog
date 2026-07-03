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

### 5. 收回空骨架，改由 tag-taxonomy skill bootstrap

**日期**：2026-07-03
**內容**：刪除手建的空骨架檔（`index.md`、`tag-rules.md`、`canonical-tags.md`、`aliases.md`、`deprecated-tags.md`），只保留本決策紀錄。`tag-taxonomy` skill 已新增 Bootstrap 段落：第一次對 blog 跑 audit 時，由 skill 依範本生成結構（含決策 #1、#2 的 repo-specific 設定——corpus 來源是 `src/content/blog/**/index.md` frontmatter、不用 `list_all_tags`），並沿用新範本：aliases 是單一 thesaurus 檔（同義詞 mapping + 退役黑名單 + 待裁決合一，不另立 deprecated 檔）、路由只在 index.md 宣告、audit 產物進 `generated/`。

**原因**：結構範本屬於 process layer（skill），repo 只擁有 data（實際 tag 裁決）。手抄骨架到各 repo 跟「同一事實宣告在多處」是同一種 drift 源——vault 側同日已因此發生 4 處失同步（見 `~/ai_session_summary/tag-system/tag-audit.md` 決策 #9）。決策 #4 描述的 writer 入口設計不變，只是入口檔改由 skill 在 bootstrap 時生成；在那之前 `create-my-blog` 用 skill 內建的 inline fallback 規則。

### 6. 第一次完整 audit：bootstrap 骨架 + 裁決 7 項待決議

**日期**：2026-07-03
**內容**：依決策 #5 的範本，`tag-taxonomy` skill 生成 `index.md`、`tag-rules.md`、`canonical-tags.md`、`aliases.md`，並掃描 `src/content/blog/**/index.md`（含當時 5 篇未 commit 的新文章：openmemory-local-ai-memory、openmemory-local-setup、openmemory-memory-strategy、session-is-knowledge、session-is-skill）建立 `generated/tag-inventory.md`（16 篇文章、29 個 distinct tags）與 `generated/tag-candidates.md`。裁決 7 項：

1. **`建站`（8 篇，最高頻 tag）**：確認為永久例外，寫入 `canonical-tags.md` § Site build-out。不引入英文替代詞。
2. **專有名詞大小寫**（`AI`、`LLM`、`GPT`、`Claude`、`MCP`、`OpenMemory`、`SOP`）：確認保留原大小寫，不強制轉小寫。寫入 `tag-rules.md` § Normalization 為正式例外清單，並在 `canonical-tags.md` § AI & tools 建立分組（`AI` 為廣義類別，`LLM`/`GPT`/`Claude` 為模型，`OpenMemory`/`MCP` 為工具）。
3. **`workflow`（3 篇，橫跨 3 種語意）**：確認維持廣義 cross-cutting tag，不拆分。
4. **`memory` 與 `OpenMemory` 並存（2 篇）**：確認保留兩者，`OpenMemory` 為產品專名、`memory` 為廣義可瀏覽分類。
5. **`prompt-engineering`（2 篇）**：確認為單一 umbrella 概念（image-gen prompt 設計、AI memory prompt 設計皆屬「有效 prompt 寫法」），不拆分。
6. **`markdown-style-test` 上的 `test`/`style`**：維持現狀，不論是否視為內部測試頁都不影響 tag。
7. 未新增任何 canonical/alias 以外的 frontmatter 改動——這次 audit 沒有對任何文章的 tags 欄位做 rename 或刪除。

**原因**：第一次對此 repo 跑 audit，7 項議題皆屬「維持現狀 vs. 改動」的判斷，且改動會牽動多達 8 篇文章的 rename 成本。使用者在確認視窗內未回應，依 auto-mode 規則採用保守（維持現狀、不做破壞性 rename）的建議選項推進，並於此完整記錄供事後覆核；若使用者事後有不同意見，可直接修改 `canonical-tags.md`/`tag-rules.md` 並在此追加新決策覆蓋。

### 7. 推翻決策 #6 項目 1：`建站` 改名為 `site-building`

**日期**：2026-07-03
**內容**：使用者事後覆核決策 #6 時，推翻「保留 `建站` 為永久例外」的判斷，改為統一改成英文。提供 4 個候選字（`site-building`、`blog-building`、`building-in-public`、`site-setup`）並附優缺點，使用者選定 `site-building`。已執行：

- 改名 8 篇文章 frontmatter tags：about-page-author-card、blog-design-language-ai-desktop、custom-domain-cloudflare、dark-mode-expressive-code、image-compression-workflow、og-image-design-implementation、rss-gsc-aeo、why-astro，`建站` → `site-building`
- `tag-rules.md`：移除「Chinese tags allowed」例外類別，改為「no Chinese tags」規則，並更新 selection procedure 範例
- `canonical-tags.md` § Site build-out：canonical tag 改為 `site-building`，註記 `建站` 已退役
- `aliases.md`：新增 confirmed mapping `site-building` ← `建站`（alias 欄位即退役黑名單，未來若有文章誤用 `建站` 即可查到）
- `generated/tag-candidates.md`：項目 1 標記為 superseded，指向本決策

**原因**：全英文語料庫中唯一的中文 tag，一致性優先於保留既有用法；使用者判斷沒有語意流失（`site-building` 涵蓋 domain/design/infra/SEO 等既有 8 篇範圍），改名成本可一次付清（8 篇文章），優於長期維護雙語混雜的例外規則。

### 8. 修正大小寫例外清單的不一致：`skill`、`astro`、`cloudflare` 補齊大寫

**日期**：2026-07-03
**內容**：使用者確認決策 #6 項目 2（保留專有名詞大小寫）後，追問 `skill` 是否也該比照辦理。檢查發現既有 tag 大小寫規則本身不一致：`Claude` 已大寫，但同屬專有名詞的 `astro`（Astro 框架，5 篇）、`cloudflare`（Cloudflare 公司，1 篇）卻是小寫；`skill`（Claude Code 的 Skill 功能，1 篇）也未大寫。使用者選擇一次修正全部三個，而非只修 `skill`。已執行：

- 改名 7 篇文章 frontmatter tags：`skill` → `Skill`（session-is-skill）；`astro` → `Astro`（about-page-author-card、blog-design-language-ai-desktop、dark-mode-expressive-code、og-image-design-implementation、why-astro）；`cloudflare` → `Cloudflare`（custom-domain-cloudflare）
- `tag-rules.md`：專有名詞大小寫清單擴充為 `AI`、`LLM`、`GPT`、`Claude`、`MCP`、`OpenMemory`、`SOP`、`Astro`、`Cloudflare`、`Skill`，並註明這是封閉清單——新增項目需經過 audit 確認，不能在寫文章當下自行判斷
- `canonical-tags.md`：§ AI & tools 補上 `Skill`；新增 § Tech stack proper nouns 收錄 `Astro`、`Cloudflare`
- `aliases.md`：新增 3 筆 confirmed mapping（`Skill`←`skill`、`Astro`←`astro`、`Cloudflare`←`cloudflare`）

**原因**：「專有名詞保留原始大小寫」的規則如果只套用在部分 tag（`Claude`）卻放過其他同類 tag（`astro`、`cloudflare`、`skill`），規則本身就失去一致性，之後每次寫文章都要重新判斷「這個算不算例外」。一次修正、把規則寫成封閉清單，之後只需要查表，不需要每篇文章重新裁決。

**補充（使用者提供）**：這條規則對 blog repo 特別重要，因為 blog 的 tag 會實際顯示在頁面上（tag pill、tag 列表頁），是 user-facing 的呈現，不是像治理 vault 那樣純內部 metadata。讀者會看到 tag 原樣顯示，所以大小寫正確性本身就是可見的品質問題，而不只是內部一致性偏好。已同步補寫進 `tag-rules.md` § Normalization 開頭。

### 9. 使用者覆核發現 3 處驗證問題並修正

**日期**：2026-07-03
**內容**：使用者覆核前面幾輪決策，抓出 3 個問題，逐一確認屬實並修正：

1. **`create-my-blog` skill 與 blog tag-rules.md 衝突**：`~/.claude/skills/create-my-blog/SKILL.md` 寫死「tags 一律英文 lowercase kebab-case」，與 `tag-rules.md` 剛確立的 proper noun 封閉例外清單（`AI`/`Claude`/`Astro`/`Skill` 等）矛盾。已修正該行，改為優先讀 `tag-rules.md` 的例外清單，`tag-rules.md` 不存在時才回退成純 lowercase kebab-case。**`~/.claude` 是版控 repo，此檔已修改但尚未 commit，需使用者明確說「commit」才會提交。**
2. **`generated/` 產物 stale**：`tag-candidates.md` 結尾寫「No frontmatter files were edited this audit」，但當時已完成 8 篇 `site-building` 改名與 7 篇 proper noun casing 改名，共 15 處 tag 修改跨 8 篇文章。另外 `tag-inventory.md` 寫「29 distinct tags」，實際 live scan（含 inline array 格式 `tags: [test, markdown, style]`，先前手動掃描漏掉這種格式）是 30。已重新產生兩份 `generated/` 檔案反映正確狀態。
3. **git index 不乾淨**：`tag-system/` 5 個檔案處於「staged deletion + untracked 同名新檔」的狀態（`aliases.md`、`canonical-tags.md`、`deprecated-tags.md`、`index.md`、`tag-rules.md`），若直接 commit 容易出現「刪舊漏新」的錯誤 diff。已執行 `git add tag-system/` 重新對齊 index（僅 staging，未 commit）。

**原因**：這三項都是「skill 說做了但實際沒完全驗證」的落差——treat generated files as regenerate-on-audit 是流程本身的規則，卻在本次執行中沒有落實；casing 規則跨 repo 生效卻沒同步到消費端（`create-my-blog`）；git 操作只做了檔案層的新增/刪除，沒有同步做 staging 層的收斂。使用者驗證的價值在於抓出「宣稱完成」與「實際完成」之間的落差，而不是重新做一次已經正確的判斷。

### 10. 全語料庫 Title Case 遷移：從「小寫預設 + 專有名詞例外清單」改成「Title Case 預設」

**日期**：2026-07-03
**內容**：使用者指出決策 #8（只修正 `skill`/`astro`/`cloudflare` 三個專有名詞大小寫）不夠徹底——既然大小寫問題已經處理，應該全部 tag 開頭都大寫，不應該只挑專有名詞。確認範圍後（開放式問題：多字 kebab tag 每個 hyphen 段都大寫 vs. 只大寫整個 tag第一個字母；縮寫 tag 全大寫 vs. 只大寫第一個字母），使用者選擇「每個 hyphen 段都大寫」+「縮寫全大寫跟 AI/GPT/MCP 一致」。已執行：

- 用 script 掃描並改寫全部 16 篇文章的 frontmatter tags（含 bullet list 與 inline array `tags: [...]` 兩種格式），20 個原本小寫的 tag 全部轉成 Title Case：
  `site-building`→`Site-Building`、`workflow`→`Workflow`、`blog`→`Blog`、`image-generation`→`Image-Generation`、`prompt-engineering`→`Prompt-Engineering`、`markdown`→`Markdown`、`seo`→`SEO`、`memory`→`Memory`、`self-hosted`→`Self-Hosted`、`component`→`Component`、`design`→`Design`、`dark-mode`→`Dark-Mode`、`expressive-code`→`Expressive-Code`、`image-compression`→`Image-Compression`、`test`→`Test`、`style`→`Style`、`og-image`→`OG-Image`（`OG` 維持全大寫縮寫）、`rss`→`RSS`、`aeo`→`AEO`、`knowledge-management`→`Knowledge-Management`
- 既有的 `AI`/`LLM`/`GPT`/`Claude`/`MCP`/`OpenMemory`/`SOP`/`Astro`/`Cloudflare`/`Skill` 大小寫不變（本來就正確）
- 驗證：live scan 確認 16 篇文章、30 個 distinct tag，全部開頭大寫，0 個小寫殘留
- 額外驗證：檢查 `src/lib/tags.ts`、`src/pages/tags/index.astro`、`BlogLayout.astro`、`[slug].astro` 確認 render path 沒有對 tag 文字做 `toLowerCase`/`toUpperCase`/`text-transform`（找到的 3 處 `text-transform: uppercase` 分別是側欄「Tags」標題文字、markdown h6、table header，跟個別 tag pill 文字無關），確保 frontmatter 大小寫會原樣顯示在頁面上
- `tag-rules.md`：Normalization 規則改寫為「Title Case kebab-case 為預設」，縮寫全大寫、多字專有名詞維持內部大小寫（`OpenMemory` 不拆字母），移除舊的「lowercase 預設 + 專有名詞例外清單」框架
- `canonical-tags.md`：更新 Site build-out 條目為 `Site-Building`，新增「Everything else」區塊列出其餘 18 個一般 topic tag 的 Title Case 現狀
- `aliases.md`：新增 20 筆 confirmed mapping（含 `Site-Building` 現在有兩個歷史 alias：`建站` 與 `site-building`）
- `~/.claude/skills/create-my-blog/SKILL.md:121`：再次修正，這次不再假設任何預設大小寫（連「預設 lowercase」都不寫死），明確標註「不要憑記憶套用大小寫規則，一定要讀 `tag-rules.md`」，避免下次規則變動又跟消費端脫鉤

**原因**：規則如果只保護「看起來像專有名詞」的 tag，卻放任其他 tag 維持隨機大小寫，會讓 tag 頁面呈現不一致（部分 pill 大寫開頭、部分全小寫），使用者判斷既然這是 user-facing 顯示（`tag-rules.md` 已在決策 #8 補充記錄這點），一致的視覺呈現比「哪個字算專有名詞」的語意判斷更重要，值得一次性遷移而非逐步累積例外清單。
