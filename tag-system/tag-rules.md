# Blog Tag Rules

Write-time procedure and normalization rules for blog frontmatter tags. Read `index.md` first for routing.

## Normalization

- **Default form: Title Case kebab-case, English.** Every tag starts with a capital letter; for multi-word kebab tags, every hyphen-separated segment is capitalized (e.g. `Image-Generation`, `Self-Hosted`, `Dark-Mode`). Single-word tags: `Workflow`, `Blog`, `Markdown`, `Design`.
- **Tags render on-page** (tag pills, tag index pages) — this repo has a live tag system that's user-facing, not just internal metadata. That's the reason for Title Case as the *default* (not just an exception for proper nouns): every tag is reader-facing, so every tag should read cleanly, not just the product names.
- **Acronyms are fully uppercase**, not just first-letter-capitalized: `AI`, `LLM`, `GPT`, `MCP`, `SOP`, `SEO`, `AEO`, `RSS`, `OG-Image` (the `OG` segment stays fully uppercase, `Image` is Title Case). Never write `Seo`, `Rss`, `Og-Image`.
- **Multi-word proper nouns keep their internal casing** rather than being forced into per-segment Title Case: `OpenMemory` (not `Openmemory` or `Open-Memory`), `Claude`, `Astro`, `Cloudflare`, `Skill`, `Codex`, `MacOS`, `OpenAI`, `ChatGPT`, `PhotoSwipe`. These are a closed list — propose additions through an audit, don't self-declare while writing a post. `MacOS` is a deliberate exception to Apple's own branding (which lowercases the initial `m`): this repo's tags are user-facing and every tag must start with a capital letter, so `MacOS` is the corpus-wide compromise (confirmed `tag-audit.md` decision #11) — do not "correct" it back to `macOS`.
- **Registered lowercase-initial exception: `iThome`.** `iThome-Ironman` keeps the brand's own lowercase `i` and is the only tag in this repo allowed to start with a lowercase letter (`tag-audit.md` decision #12). This does **not** reopen `MacOS` (decision #11): the two brands differ in how they survive capitalization — `MacOS` is still readable as the product, `IThome` is not. Do not generalize this into "brand casing always wins"; it is a single registered tag, and a new lowercase-initial tag still needs an audit decision.
- **No Chinese tags.** `建站` was renamed to `Site-Building` on 2026-07-03 (see `tag-audit.md` decisions #7, #10) and `鐵人賽` was deleted in favour of `iThome-Ironman` on 2026-10-03 (decision #12) — do not reintroduce Chinese-language tags.

## Selection procedure

0. Do not merge two orthogonal concepts into one hyphenated tag (e.g. `AI-Workflow`) when the corpus already carries them as separate tags (`AI`, `Workflow`) — reuse the two existing tags instead of inventing a compound (`tag-audit.md` decision #11).
1. Read the full existing tag inventory via `index.md`'s corpus source (live scan, not a cached list).
2. Semantic match against existing tags first — reuse before inventing.
3. Apply 3–5 tags per post: mix of topic (e.g. `Astro`, `Image-Generation`), format/series (e.g. `Site-Building`), and technology/proper-noun (e.g. `AI`, `Claude`) as relevant. Mandatory series tags are **not** part of this count — see § Mandatory series tags.
4. No count thresholds, no pick-N quotas — pick what's actually descriptive.
5. New tag → Title Case per the Normalization rules above (capitalize every hyphen segment; acronyms fully uppercase; proper nouns keep canonical internal casing). Never write a new lowercase tag.

## Mandatory series tags

Some series carry tags that every post in the series must have. They sit **outside** the 3–5 count in § Selection procedure: apply them *in addition to* the 3–5 descriptive tags, and never drop a descriptive tag to make room for one.

| `series:` frontmatter | Mandatory tags |
|---|---|
| `ithome-2026-ironman` | `Claude-Academy`, `iThome-Ironman` |

- Mandatory tags go **last** in the `tags:` list, after the descriptive ones — the descriptive tags are what the post is about, the mandatory ones say where it was published.
- Everything beyond the mandatory pair is free choice within the normal selection procedure.
- Adding a row to this table is an audit decision, not a write-time choice.

## Forbidden patterns

Never use a tag that is:
- A pure number, issue/PR number, or rank (`42`, `pr-123`, `top-5`)
- A hex color or hash (`#fff`, `a1b2c3d`)
- A file path or filename (`src-components`, `indexmd`)
- An env-var style name (`NODE_ENV`, `API_KEY`)

## Deprecated / retired tags

Check `aliases.md` before using a tag — its alias column doubles as the deprecated blacklist. Do not reintroduce a retired tag without a new audit decision.
