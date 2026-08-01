# Tag Candidates — 2026-08-02 Audit (generated, disposable)

Corpus grew from 16 posts (2026-07-03 audit) to 48 posts (47 `.md` + 1 `.mdx`). See `tag-inventory.md` for final live counts and `tag-audit.md` decision #11 for full rationale.

## Resolved — frontmatter edits this audit

| Change | Posts touched | Audit ref |
|---|---|---|
| `agent`→`Agent`, `codex`→`Codex`, `claude-code`→`Claude-Code`, `workflow`→`Workflow` | agent-project-instructions (1) | decision #11 |
| Removed `macOS-Dictation` (redundant with existing `Dictation` tag on same post; violated capital-start rule) | voice-input-for-vibe-coding (1) | decision #11 |
| `AI-Workflow` → split into `AI` + `Workflow` (matches rest of corpus, which never merges these two) | codex-remote-connections-vs-claude-code (1) | decision #11 |

## Resolved — governance/documentation only, no frontmatter change

| # | Item | Decision | Audit ref |
|---|---|---|---|
| 1 | Corpus source glob stale (`index.md`'s documented `src/content/blog/**/index.md` missed `.mdx` — real Astro loader is `**/*.{md,mdx}`, and `local-whisper-dictation-cost/index.mdx` was silently excluded from prior scans) | Updated `index.md` corpus source to `src/content/blog/**/index.{md,mdx}` | decision #11 |
| 2 | `Codex` (12 posts), `OpenAI`, `ChatGPT`, `PhotoSwipe` (1 post each) — multi-word proper nouns already consistently cased but never registered in the closed list | Added to `tag-rules.md` § Normalization and `canonical-tags.md` groups | decision #11 |
| 3 | `MacOS` (6 posts) — Apple's real casing is `macOS` (lowercase m), conflicts with this repo's "every tag starts with a capital letter" rule | Confirmed `MacOS` as the permanent corpus-wide compromise; registered in closed list | decision #11 |
| 4 | `Remote-Control` (5 posts, agent-control focus) vs `Remote-Access` (3 posts, SSH/network-access focus) | Confirmed as two distinct tags — different semantic focus, not a merge candidate | decision #11 |

## Known residual risk (not fixed, intentionally left)

- `taiwan-ai-community-singularity` is an untracked, in-progress draft as of this scan (not yet committed) — included in the inventory since it's live working-tree content, but its tags weren't a governance target since they're already well-formed and canonical (`AI`, `LLM`, `Claude`, `Codex`, `Luma`).
- `markdown-style-test` still carries `Test`/`Style` as real editorial tags on what may be an internal rendering-test page — left as-is per 2026-07-03 decision #6, not revisited this audit.
- Rendered tag pill/tag-index pages were not visually re-verified in a browser this audit.
