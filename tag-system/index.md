# Blog Tag System — Writer Entrypoint

This file is the single source of routing for blog tag governance. Writers (the `to-blog` skill, manual edits) enter here before writing frontmatter tags. Do not read `tag-audit.md` or `generated/` for write-time tag selection — those are audit history and disposable artifacts, not writer inputs.

## File roles

| File | Who reads it | Purpose |
|---|---|---|
| `index.md` (this file) | Writers + auditors | Entry point, routing, corpus source |
| `tag-rules.md` | Writers + auditors | Write-time procedure, normalization rules, forbidden patterns |
| `canonical-tags.md` | Writers + auditors | Taxonomy direction groups (grows from audits) |
| `aliases.md` | Writers + auditors | Preferred/alias mappings, retired categories, pending-decision pairs |
| `tag-audit.md` | Auditors only (`tag-taxonomy` skill) | Append-only decision log |
| `generated/` | Auditors only (`tag-taxonomy` skill) | `tag-candidates.md` exists only while items await a decision (absent = nothing pending); inventory comes from `pnpm tags:check --inventory` |

## Corpus source

Full existing tag inventory for this repo comes from scanning frontmatter directly:

```
src/content/blog/**/index.{md,mdx}
```

`src/content.config.ts` loads the collection with glob pattern `**/*.{md,mdx}`. Every post is `.mdx` today (`CLAUDE.md` § 文章結構), but scans keep matching both extensions — a scan that matched only one silently missed posts once (`tag-audit.md` decision #11).

Read the `tags:` field of each post's frontmatter — or run `pnpm tags:check --inventory` for the live list with counts. Do **not** use `mcp__obsidian__list_all_tags` — that only sees the Obsidian vault, not this Astro repo (see `tag-audit.md` decision #2).

## Mechanical check

`pnpm tags:check` (`scripts/tags-check.mjs`) runs before every `pnpm build`, so a violation fails the deploy. It parses the rules from this folder rather than duplicating them: the `aliases.md` blacklist, the descriptive-tag range and lowercase-initial exceptions in `tag-rules.md`, the mandatory series tags table, plus spelling drift across the corpus (`macOS` vs `MacOS`, `Agent` vs `Agents`). Keep the wording it parses intact: "Apply N–M descriptive tags", "**Registered lowercase-initial exceptions: …**", and the section headings it reads.

For audits, `pnpm tags:check --suggest` lists posts whose title names an existing tag they do not carry. It never fails and is noisy on purpose (`Blog` in a title rarely means the `Blog` tag); the auditor decides which hits are real missing-subject tags.

## Write-time procedure

**Derive first, reconcile second** (`tag-audit.md` decision #13):

1. **Derive blind.** From the post content alone, write down the most fitting candidate tags. Do **not** look at the corpus inventory, `canonical-tags.md`, or `aliases.md` during this step — reading a list first anchors the writer onto existing generic tags and kills tag diversity.
2. Read `tag-rules.md` for normalization rules and forbidden patterns.
3. **Reconcile.** Scan the corpus source above for the live full inventory (no count thresholds, no pick-N quotas), and check `aliases.md` / `canonical-tags.md`. For each candidate:
   - **Same concept, different spelling** (casing, singular/plural, hyphenation, an obvious synonym, a confirmed alias) → use the existing tag.
   - **Related but different concept, or a more specific sub-concept** → keep the candidate as a new tag. Do not fall back to a merely nearby existing tag.
4. Apply 3–7 descriptive tags per post (mandatory series tags not counted), following `tag-rules.md` normalization. A named product/tool that is the post's subject must be tagged even if it is new to the corpus (`tag-rules.md` § Selection procedure step 4).

## Governance

Periodic audits are run by the `tag-taxonomy` skill (`/tag-taxonomy`), not by writers. See `tag-audit.md` for decision history.
