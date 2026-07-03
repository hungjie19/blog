# Blog Tag System — Writer Entrypoint

This file is the single source of routing for blog tag governance. Writers (`create-my-blog`, manual edits) enter here before writing frontmatter tags. Do not read `tag-audit.md` or `generated/` for write-time tag selection — those are audit history and disposable artifacts, not writer inputs.

## File roles

| File | Who reads it | Purpose |
|---|---|---|
| `index.md` (this file) | Writers + auditors | Entry point, routing, corpus source |
| `tag-rules.md` | Writers + auditors | Write-time procedure, normalization rules, forbidden patterns |
| `canonical-tags.md` | Writers + auditors | Taxonomy direction groups (grows from audits) |
| `aliases.md` | Writers + auditors | Preferred/alias mappings, retired categories, pending-decision pairs |
| `tag-audit.md` | Auditors only (`tag-taxonomy` skill) | Append-only decision log |
| `generated/` | Auditors only (`tag-taxonomy` skill) | Disposable audit artifacts (inventory, candidates), regenerated each audit |

## Corpus source

Full existing tag inventory for this repo comes from scanning frontmatter directly:

```
src/content/blog/**/index.md
```

Read the `tags:` field of each post's frontmatter. Do **not** use `mcp__obsidian__list_all_tags` — that only sees the Obsidian vault, not this Astro repo (see `tag-audit.md` decision #2).

## Write-time procedure

1. Read `tag-rules.md` for normalization rules and forbidden patterns.
2. Read `canonical-tags.md` and `aliases.md` for existing preferred terms — prefer reusing an existing tag over inventing a near-synonym.
3. Scan the corpus source above for live full-inventory semantic match (no count thresholds, no pick-N quotas).
4. Apply 3–5 tags per post, following `tag-rules.md` normalization.

## Governance

Periodic audits are run by the `tag-taxonomy` skill (`/tag-taxonomy`), not by writers. See `tag-audit.md` for decision history.
