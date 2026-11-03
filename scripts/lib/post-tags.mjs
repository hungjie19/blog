// Reads `tags:` / `series:` / `draft:` straight from post frontmatter, without Astro.
// Shared by `pnpm tags:check` and the sitemap filter in astro.config.mjs, which both run
// outside the content collection. Assumes the frontmatter shape every post uses:
//   tags:
//     - Tag-One
//     - Tag-Two

import fs from "node:fs";
import path from "node:path";

const BLOG_DIR = "src/content/blog";

export function readPosts(root = process.cwd()) {
  const dir = path.join(root, BLOG_DIR);
  const posts = [];
  for (const slug of fs.readdirSync(dir).sort()) {
    const file = ["index.mdx", "index.md"]
      .map((name) => path.join(dir, slug, name))
      .find((candidate) => fs.existsSync(candidate));
    if (!file) continue;
    const match = fs.readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---/);
    if (!match) continue;
    const lines = match[1].split("\n");
    const tags = [];
    const start = lines.indexOf("tags:");
    if (start !== -1) {
      for (const line of lines.slice(start + 1)) {
        const item = line.match(/^\s+-\s+(.+)$/);
        if (!item) break;
        tags.push(item[1].trim().replace(/^['"]|['"]$/g, ""));
      }
    }
    const scalar = (key) => lines.find((l) => l.startsWith(`${key}:`))?.slice(key.length + 1).trim();
    posts.push({
      slug,
      file: path.relative(root, file),
      tags,
      series: scalar("series") ?? null,
      draft: scalar("draft") === "true",
    });
  }
  return posts;
}

/** Tag → number of published (non-draft) posts carrying it. */
export function countTags(posts) {
  const counts = new Map();
  for (const post of posts) {
    if (post.draft) continue;
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return counts;
}
