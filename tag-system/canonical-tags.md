# Blog Canonical Tags

Taxonomy direction groups. Starts empty — grows only from confirmed audit decisions (see `tag-audit.md`). Count is an audit hint only, never a canonicality signal.

All tags in this repo are Title Case (see `tag-rules.md` § Normalization) — the notes below cover semantic grouping, not casing exceptions, since Title Case is now the corpus-wide default rather than a proper-noun-only exception.

## Groups

### Site build-out

- `Site-Building` — covers posts about building/operating this blog itself (domain, dark mode, OG image, RSS/SEO, component work). Renamed from the Chinese tag `建站` on 2026-07-03 (`tag-audit.md` decision #7), then re-cased from `site-building` to `Site-Building` on 2026-07-03 (`tag-audit.md` decision #10). `建站` and `site-building` are both retired, see `aliases.md`.

### AI & tools

Multi-word proper nouns keep internal casing rather than per-segment Title Case; acronyms are fully uppercase.

- `AI` — broad category, the umbrella tag for any AI-topic post. Always kept as its own tag — never merge into a compound like `AI-Workflow` (`tag-audit.md` decision #11). **Not used on `ithome-2026-ironman` posts** (decision #12): in a series where every post is a Claude course, `AI` carries no browse value next to `Claude` and `Claude-Academy`. It stays the umbrella tag everywhere else in the corpus.
- `LLM`, `Claude`, `OpenAI`, `ChatGPT`, `Gemini` — specific models/vendors, used alongside `AI` when the post centers on a specific model. `GPT` was merged into `ChatGPT` (decision #14): the image-generation posts used the ChatGPT product, not the GPT model as a topic.
- `Claude-API`, `Claude-Cowork`, `Claude-Code` — separate Claude products, each its own tag. They do not imply `Claude` (decision #18); the tag page's family row links them together.
- `Subagent`, `Hooks`, `System-Prompt`, `Context-Engineering`, `Evals`, `Tool-Use`, `Prompt-Caching` — agent-building concepts that cross the ironman series and the agent-workflow posts.
- `AI-Fluency` — Anthropic's AI Fluency framework/course family (5 course posts + roadmap/learning-path).
- `Obsidian`, `Cmux`, `Orca`, `ADE`, `Oysterun` — named tools in the knowledge/agent-workflow posts.
- `OpenMemory`, `MCP` — specific tools/products, used alongside `AI` and often `Memory` for OpenMemory posts.
- `Memory` — broader browsable concept, kept distinct from `OpenMemory` (product) even when co-occurring on the same post. Absorbed `Cross-Memory` (decision #14).
- `SOP` — process/methodology tag, appears alongside `AI`/`Workflow` for skill-creation posts.
- `Skill`, `Agent` — Claude Code's named Skill feature and the general "AI agent" concept (summon-agent-*, three-accounts-one-agent-environment). Name specific product/actor concepts, not generic ability — kept in the proper-noun-adjacent list rather than being just "another Title Case word."
- `Codex` — OpenAI's coding agent/CLI, used alongside `AI`/`Claude` in agent-comparison posts.

### Series & venue

- `Claude-Academy` — Anthropic's official learning platform (academy.claude.com). Mandatory tag on every `ithome-2026-ironman` post (`tag-audit.md` decision #12); also available to any future post about the platform itself.
- `iThome-Ironman` — the iThome 鐵人賽 publishing venue. Mandatory on every `ithome-2026-ironman` post. Keeps the brand's lowercase `i` and is the repo's only registered lowercase-initial tag (`tag-rules.md` § Normalization). Replaces the retired Chinese tag `鐵人賽` (see `aliases.md`).
- The mandatory pair is enforced through `tag-rules.md` § Mandatory series tags, which is also where a new series registers its own pair.

### Tech stack proper nouns

- `Astro` — the site's framework.
- `Cloudflare` — DNS/registrar provider.
- `MacOS` — deliberate exception to Apple's own `macOS` branding casing; this repo's tags must start with a capital letter, so `MacOS` is the corpus-wide compromise (`tag-audit.md` decision #11). Do not "correct" it back to `macOS`.
- `PhotoSwipe` — the lightbox library (astro-blog-image-lightbox).
- `GitHub-Pages`, `Google-Search-Console`, `IndexNow`, `Wrangler`, `BetterDisplay` — hosting / search-console / tooling proper nouns added in decision #14.
- `iOS` — registered lowercase-initial exception (decision #14), same reasoning as `iThome`.

### Azure DevOps

- `Permissions` — aggregates the `System.AccessToken` permission-troubleshooting posts (and Claude Enterprise access control). `System-AccessToken` was rejected as a tag because it is an env-var style name (`tag-rules.md` § Forbidden patterns).
- `Pull-Request`, `Code-Review` — PR automation vs. reviewing code; related but distinct.

### Remote control vs. remote access (confirmed distinct, not a merge candidate)

- `Remote-Control` — controlling/dispatching an AI agent or coding session from another device (claude-code-remote-control-mac, claude-dispatch-cowork-code, codex-remote-connections-vs-claude-code, oysterun-tailscale-remote-ai, summon-agent-remote-control).
- `Remote-Access` — network/SSH-level access to a machine, not agent-specific (ios-ssh-app-comparison, mac-ssh-tailscale-setup, tailscale-dev-server-access).
- Confirmed as two distinct tags in the 2026-08-02 audit (`tag-audit.md` decision #11) — semantically related but not the same concept; do not merge.

### Everything else

Single-post tags are legitimate (decision #14) — audits merge same-concept spellings but do not retire a tag for being single-post.

All other tags are generic topic/format tags with no grouping decision yet. This file does not enumerate them — the live list is `pnpm tags:check --inventory`; a hand-kept list here went stale within one audit (it still listed `Cross-Memory` and `Design` twice after decision #14).
