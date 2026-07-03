# Blog Canonical Tags

Taxonomy direction groups. Starts empty — grows only from confirmed audit decisions (see `tag-audit.md`). Count is an audit hint only, never a canonicality signal.

All tags in this repo are Title Case (see `tag-rules.md` § Normalization) — the notes below cover semantic grouping, not casing exceptions, since Title Case is now the corpus-wide default rather than a proper-noun-only exception.

## Groups

### Site build-out

- `Site-Building` — covers posts about building/operating this blog itself (domain, dark mode, OG image, RSS/SEO, component work). Renamed from the Chinese tag `建站` on 2026-07-03 (`tag-audit.md` decision #7), then re-cased from `site-building` to `Site-Building` on 2026-07-03 (`tag-audit.md` decision #10). `建站` and `site-building` are both retired, see `aliases.md`.

### AI & tools

Multi-word proper nouns keep internal casing rather than per-segment Title Case; acronyms are fully uppercase.

- `AI` — broad category, the umbrella tag for any AI-topic post.
- `LLM`, `GPT`, `Claude` — specific models/vendors, used alongside `AI` when the post centers on a specific model.
- `OpenMemory`, `MCP` — specific tools/products, used alongside `AI` and often `Memory` for OpenMemory posts.
- `Memory` — broader browsable concept, kept distinct from `OpenMemory` (product) even when co-occurring on the same post.
- `SOP` — process/methodology tag, appears alongside `AI`/`Workflow` for skill-creation posts.
- `Skill` — Claude Code's named Skill feature (session-is-skill). Names a specific product concept, not a generic ability — kept in the proper-noun list rather than being just "another Title Case word."

### Tech stack proper nouns

- `Astro` — the site's framework.
- `Cloudflare` — DNS/registrar provider.

### Everything else

All remaining tags (`Workflow`, `Blog`, `Image-Generation`, `Prompt-Engineering`, `Markdown`, `SEO`, `Self-Hosted`, `Component`, `Design`, `Dark-Mode`, `Expressive-Code`, `Image-Compression`, `Test`, `Style`, `OG-Image`, `RSS`, `AEO`, `Knowledge-Management`) are generic topic/format tags with no drift or ambiguity found in the 2026-07-03 audit — Title Case per `tag-rules.md`, no further grouping needed yet.
