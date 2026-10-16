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
src/content/blog/**/index.{md,mdx}
```

Both extensions are real content — `src/content.config.ts` loads the collection with glob pattern `**/*.{md,mdx}`, and at least one published post (`local-whisper-dictation-cost`) is `.mdx`. A scan that only matches `index.md` silently misses `.mdx` posts and their tags (`tag-audit.md` decision #11).

Read the `tags:` field of each post's frontmatter. Do **not** use `mcp__obsidian__list_all_tags` — that only sees the Obsidian vault, not this Astro repo (see `tag-audit.md` decision #2).

## Write-time procedure

**Derive first, reconcile second** (`tag-audit.md` decision #13):

1. **Derive blind.** From the post content alone, write down the most fitting candidate tags. Do **not** look at the corpus inventory, `canonical-tags.md`, or `aliases.md` during this step — reading a list first anchors the writer onto existing generic tags and kills tag diversity.
2. Read `tag-rules.md` for normalization rules and forbidden patterns.
3. **Reconcile.** Scan the corpus source above for the live full inventory (no count thresholds, no pick-N quotas), and check `aliases.md` / `canonical-tags.md`. For each candidate:
   - **Same concept, different spelling** (casing, singular/plural, hyphenation, an obvious synonym, a confirmed alias) → use the existing tag.
   - **Related but different concept, or a more specific sub-concept** → keep the candidate as a new tag. Do not fall back to a merely nearby existing tag.
4. Apply 3–5 tags per post, following `tag-rules.md` normalization.

## Governance

Periodic audits are run by the `tag-taxonomy` skill (`/tag-taxonomy`), not by writers. See `tag-audit.md` for decision history.
