---
date: '2026-07-03'
tags: [tag-system, blog]
---

# Blog Tag System Index

這是 `~/blog` repo 的 tag system 入口。它只管理 blog 文章 frontmatter tags，不管理 `ai_session_summary` vault。

## Writer Entry

寫 blog frontmatter tags 時：

1. 讀本檔。
2. 掃 `src/content/blog/**/index.md` 的 frontmatter tags，展開**全量 blog 既有 tag**。不要只看高頻詞，不要用 count 當優先順序。
3. 對候選 tag 做全量語意比對：有同義/近義/大小寫/單複數/粒度相近的既有 tag，就重用既有 tag；真的沒有貼合詞才新增。
4. 若需要確認寫法邊界，讀 `tag-rules.md`。
5. 若需要看核心方向感，讀 `canonical-tags.md`。注意：目前這是空骨架，不是完整 tag 清單。
6. 若候選詞疑似舊寫法或同義詞，讀 `aliases.md`。

不要呼叫 `mcp__obsidian__list_all_tags` 來替 blog 選 tag；那只看得到 Obsidian vault。

## 檔案角色

| 檔案 | 角色 | 誰讀 |
|---|---|---|
| `index.md` | 入口與路由；定義 writer 該讀什麼、不該讀什麼 | `create-my-blog` |
| `tag-rules.md` | blog tag 寫入規則 | writer 需要細節時讀 |
| `canonical-tags.md` | blog taxonomy 方向感；目前待 audit 後補 | writer 需要方向感時讀 |
| `aliases.md` | 已裁決同義詞 preferred mapping；目前待 audit 後補 | writer 候選詞疑似舊寫法時讀 |
| `deprecated-tags.md` | 退役詞/黑名單 | `tag-taxonomy` audit/cleanup |
| `tag-audit.md` | 決策紀錄 | 修改治理規則或跑 audit 前讀 |

## 新 tag 門檻

新 tag 可以新增，但必須先看過 blog repo 的全量既有 tags。若已有語意貼合的 tag，就重用，不要因為措辭不同另造。
