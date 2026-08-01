# Blog Canonical Tags

Taxonomy direction groups. Starts empty — grows only from confirmed audit decisions (see `tag-audit.md`). Count is an audit hint only, never a canonicality signal.

All tags in this repo are Title Case (see `tag-rules.md` § Normalization) — the notes below cover semantic grouping, not casing exceptions, since Title Case is now the corpus-wide default rather than a proper-noun-only exception.

## Groups

### Site build-out

- `Site-Building` — covers posts about building/operating this blog itself (domain, dark mode, OG image, RSS/SEO, component work). Renamed from the Chinese tag `建站` on 2026-07-03 (`tag-audit.md` decision #7), then re-cased from `site-building` to `Site-Building` on 2026-07-03 (`tag-audit.md` decision #10). `建站` and `site-building` are both retired, see `aliases.md`.

### AI & tools

Multi-word proper nouns keep internal casing rather than per-segment Title Case; acronyms are fully uppercase.

- `AI` — broad category, the umbrella tag for any AI-topic post. Always kept as its own tag — never merge into a compound like `AI-Workflow` (`tag-audit.md` decision #11).
- `LLM`, `GPT`, `Claude`, `OpenAI`, `ChatGPT` — specific models/vendors, used alongside `AI` when the post centers on a specific model.
- `OpenMemory`, `MCP` — specific tools/products, used alongside `AI` and often `Memory` for OpenMemory posts.
- `Memory` — broader browsable concept, kept distinct from `OpenMemory` (product) even when co-occurring on the same post.
- `SOP` — process/methodology tag, appears alongside `AI`/`Workflow` for skill-creation posts.
- `Skill`, `Agent` — Claude Code's named Skill feature and the general "AI agent" concept (summon-agent-*, three-accounts-one-agent-environment). Name specific product/actor concepts, not generic ability — kept in the proper-noun-adjacent list rather than being just "another Title Case word."
- `Codex` — OpenAI's coding agent/CLI, used alongside `AI`/`Claude` in agent-comparison posts.

### Tech stack proper nouns

- `Astro` — the site's framework.
- `Cloudflare` — DNS/registrar provider.
- `MacOS` — deliberate exception to Apple's own `macOS` branding casing; this repo's tags must start with a capital letter, so `MacOS` is the corpus-wide compromise (`tag-audit.md` decision #11). Do not "correct" it back to `macOS`.
- `PhotoSwipe` — the lightbox library (astro-blog-image-lightbox).

### Remote control vs. remote access (confirmed distinct, not a merge candidate)

- `Remote-Control` — controlling/dispatching an AI agent or coding session from another device (claude-code-remote-control-mac, claude-dispatch-cowork-code, codex-remote-connections-vs-claude-code, oysterun-tailscale-remote-ai, summon-agent-remote-control).
- `Remote-Access` — network/SSH-level access to a machine, not agent-specific (ios-ssh-app-comparison, mac-ssh-tailscale-setup, tailscale-dev-server-access).
- Confirmed as two distinct tags in the 2026-08-02 audit (`tag-audit.md` decision #11) — semantically related but not the same concept; do not merge.

### Everything else

All remaining tags (`Workflow`, `Blog`, `Image-Generation`, `Prompt-Engineering`, `Markdown`, `SEO`, `Self-Hosted`, `Component`, `Design`, `Dark-Mode`, `Expressive-Code`, `Image-Compression`, `Test`, `Style`, `OG-Image`, `RSS`, `AEO`, `Knowledge-Management`, `Dictation`, `Spokenly`, `Typeless`, `Whisper`, `BYOK`, `Vibe-Coding`, `Tailscale`, `SSH`, `Troubleshooting`, `Dashboard`, `Luma`, `Design`, `Product-Design`, `Event-Management`, `Growth-Strategy`, `Reverse-Engineering`, `Canvas`, `Semantic-Search`, `Cross-Memory`, `Lightbox`, `Rehype`) are generic topic/format tags with no drift or ambiguity found in the 2026-07-03 or 2026-08-02 audits — Title Case per `tag-rules.md`, no further grouping needed yet.
