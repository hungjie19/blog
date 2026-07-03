# Tag Candidates — First Audit (2026-07-03, generated, disposable)

Regenerated after the full Title Case migration. See `tag-inventory.md` for final live counts and `tag-audit.md` decisions #6–#10 for full rationale.

## Resolved — frontmatter edits across this audit

| Round | Change | Posts touched | Audit ref |
|---|---|---|---|
| 1 | `建站` → `site-building` | 8 | decision #7 |
| 2 | `astro`→`Astro`, `cloudflare`→`Cloudflare`, `skill`→`Skill` | 7 (across 5+1+1 posts) | decision #8 |
| 3 | All-corpus Title Case migration: `site-building`→`Site-Building`, `workflow`→`Workflow`, `blog`→`Blog`, `image-generation`→`Image-Generation`, `prompt-engineering`→`Prompt-Engineering`, `markdown`→`Markdown`, `seo`→`SEO`, `memory`→`Memory`, `self-hosted`→`Self-Hosted`, `component`→`Component`, `design`→`Design`, `dark-mode`→`Dark-Mode`, `expressive-code`→`Expressive-Code`, `image-compression`→`Image-Compression`, `test`→`Test`, `style`→`Style`, `og-image`→`OG-Image`, `rss`→`RSS`, `aeo`→`AEO`, `knowledge-management`→`Knowledge-Management` (20 tags) | all 16 posts | decision #10 |

Final state: every one of the 16 posts has been touched by at least one rename round. All 30 distinct tags are Title Case; 0 lowercase tags remain.

## Resolved — governance/documentation only, no frontmatter change

| # | Tag(s) | Decision | Audit ref |
|---|---|---|---|
| 1 | `Workflow` (spans 3 senses) | Keep as one broad cross-cutting facet | decision #6 |
| 2 | `Memory` + `OpenMemory` co-occurring | Keep both — product vs. broader category | decision #6 |
| 3 | AI/LLM/GPT/Claude/OpenMemory/MCP/Skill grouping | "AI & tools" + "Tech stack proper nouns" direction groups in `canonical-tags.md` | decision #6, #8 |
| 4 | `Test`, `Style` on `markdown-style-test` | No change either way — left as-is | decision #6 |
| 5 | `Prompt-Engineering` (2 contexts) | Confirmed as one umbrella concept | decision #6 |
| 6 | Casing rule rationale | Tags render on-page → Title Case is the corpus default, not just a proper-noun exception | decision #8 addendum, decision #10 |
| 7 | `create-my-blog` skill's hardcoded casing assumption | Fixed twice: first to defer to `tag-rules.md`'s exception list (decision #9), then again to not assume any default casing at all since the repo rule flipped to Title Case (decision #10) | decision #9, #10 |

## Known residual risk (not fixed, intentionally left)

- `markdown-style-test` looks like an internal rendering-test page carrying real editorial tags (`Test`, `Style`) — no action taken either way.
- Rendered tag pill/tag-index pages were not visually verified in a browser this audit — frontmatter is correct, but if any UI code lowercases or otherwise transforms tag display text, that would need a separate check outside tag governance scope.
