#!/usr/bin/env node
// pnpm tags:check [--inventory | --suggest]
//
// Mechanical tag rules, enforced before every build. The rules themselves live in tag-system/
// (this script parses them, it does not duplicate them):
//   aliases.md    → confirmed aliases and retired tags are a blacklist
//   tag-rules.md  → descriptive-tag range ("Apply 3–7 descriptive tags"), lowercase-initial
//                   exceptions, mandatory series tags table
// Plus spelling drift across the corpus: two tags that differ only by case, hyphens, dots or a
// trailing "s" (macOS / MacOS, Agent / Agents) fail the check.
//
// Semantic questions (which tag a post is missing, whether two different words mean one concept)
// stay with the /tag-taxonomy audit — a script cannot read the post.
//
// --inventory prints every tag with its post count instead of checking.
// --suggest lists posts whose title names an existing tag they do not carry (audit input only).

import fs from "node:fs";
import process from "node:process";
import { readPosts, countTags } from "./lib/post-tags.mjs";

const backticked = (text) => [...text.matchAll(/`([^`]+)`/g)].map((m) => m[1]);

function section(markdown, heading) {
  const start = markdown.indexOf(`\n## ${heading}`);
  if (start === -1) throw new Error(`tag-system section not found: "## ${heading}"`);
  const end = markdown.indexOf("\n## ", start + 1);
  return markdown.slice(start, end === -1 ? undefined : end);
}

function tableRows(markdown) {
  return markdown
    .split("\n")
    .filter((line) => line.startsWith("|") && !/^\|\s*-/.test(line))
    .map((line) => line.split("|").slice(1, -1).map(backticked));
}

function loadRules() {
  const aliasesMd = fs.readFileSync("tag-system/aliases.md", "utf8");
  const rulesMd = fs.readFileSync("tag-system/tag-rules.md", "utf8");

  const banned = new Map(); // tag → replacement (null = retired, no replacement)
  for (const [preferred, aliases] of tableRows(section(aliasesMd, "Confirmed preferred/alias mappings"))) {
    if (preferred?.length !== 1) continue;
    for (const alias of aliases ?? []) banned.set(alias, preferred[0]);
  }
  for (const line of section(aliasesMd, "Retired without replacement").split("\n")) {
    const [tag] = line.startsWith("- ") ? backticked(line) : [];
    if (tag) banned.set(tag, null);
  }

  const range = rulesMd.match(/Apply (\d+)–(\d+) descriptive tags/);
  if (!range) throw new Error('tag-rules.md: "Apply N–M descriptive tags" not found');

  const exceptionsLine = rulesMd.match(/\*\*Registered lowercase-initial exceptions?: ([^*]+)\*\*/);
  if (!exceptionsLine) throw new Error("tag-rules.md: registered lowercase-initial exceptions not found");

  const mandatory = new Map(); // series → [tags]
  for (const [series, tags] of tableRows(section(rulesMd, "Mandatory series tags"))) {
    if (series?.length === 1 && tags?.length) mandatory.set(series[0], tags);
  }

  return {
    banned,
    min: Number(range[1]),
    max: Number(range[2]),
    lowercaseExceptions: backticked(exceptionsLine[1]),
    mandatory,
  };
}

function formErrors(tag, lowercaseExceptions) {
  if (/[^\x20-\x7E]/.test(tag)) return "non-English characters";
  if (/[\s_/]/.test(tag)) return "spaces, underscores or slashes";
  if (/^#?[0-9a-f]{6,}$/i.test(tag) && /\d/.test(tag)) return "looks like a hash or hex color";
  if (/^\d+$/.test(tag)) return "pure number";
  const exception = lowercaseExceptions.find((e) => tag === e || tag.startsWith(`${e}-`));
  const segments = tag.split("-").slice(exception ? 1 : 0);
  const lower = segments.find((s) => !/^[A-Z0-9]/.test(s));
  if (lower !== undefined) return `segment "${lower}" must start with a capital letter (Title Case)`;
  return null;
}

const spellingKey = (tag) => {
  const key = tag.toLowerCase().replace(/[-_.\s]/g, "");
  return key.length > 3 && key.endsWith("s") ? key.slice(0, -1) : key;
};

const posts = readPosts();
const counts = countTags(posts);

if (process.argv.includes("--inventory")) {
  const rows = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  for (const [tag, n] of rows) console.log(`${String(n).padStart(3)}  ${tag}`);
  console.log(`\n${rows.length} tags across ${posts.filter((p) => !p.draft).length} published posts`);
  process.exit(0);
}

// Audit aid, not a rule: a post whose title names an existing tag but does not carry it.
// Noisy by design (e.g. "Blog" in a title rarely means the Blog tag), so it never fails.
if (process.argv.includes("--suggest")) {
  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [...counts.keys()]
    .filter((tag) => tag.length >= 3)
    .map((tag) => [tag, new RegExp(`(^|[^a-z0-9])${tag.toLowerCase().split("-").map(escape).join("[\\s-]?")}([^a-z0-9]|$)`)]);
  let hits = 0;
  for (const post of posts) {
    if (post.draft) continue;
    const title = fs.readFileSync(post.file, "utf8").match(/^title:\s*(.+)$/m)?.[1] ?? "";
    const missing = patterns.filter(([tag, re]) => !post.tags.includes(tag) && re.test(title.toLowerCase())).map(([tag]) => tag);
    if (!missing.length) continue;
    hits += 1;
    console.log(`${post.slug}: title mentions ${missing.join(", ")} — ${title.replace(/^['"]|['"]$/g, "")}`);
  }
  console.log(`\n${hits} post(s) to review. Tag only when the named thing is the post's subject (tag-rules.md § Selection procedure step 4).`);
  process.exit(0);
}

const rules = loadRules();
const errors = [];
const report = (post, message) => errors.push(`${post.file}: ${message}`);

for (const post of posts) {
  const seen = new Set();
  for (const tag of post.tags) {
    if (seen.has(tag)) report(post, `duplicate tag "${tag}"`);
    seen.add(tag);
    if (rules.banned.has(tag)) {
      const to = rules.banned.get(tag);
      report(post, to ? `"${tag}" is a retired alias — use "${to}"` : `"${tag}" is retired (no replacement)`);
    }
    const form = formErrors(tag, rules.lowercaseExceptions);
    if (form) report(post, `"${tag}": ${form}`);
  }
  if (post.draft) continue;

  const required = rules.mandatory.get(post.series) ?? [];
  const missing = required.filter((t) => !post.tags.includes(t));
  if (missing.length) report(post, `series "${post.series}" requires ${missing.map((t) => `"${t}"`).join(", ")}`);
  else if (required.length && post.tags.slice(-required.length).join() !== required.join())
    report(post, `mandatory series tags must come last, in order: ${required.join(", ")}`);

  const mandatoryTags = new Set([...rules.mandatory.values()].flat());
  const descriptive = post.tags.filter((t) => !mandatoryTags.has(t)).length;
  if (descriptive < rules.min || descriptive > rules.max)
    report(post, `${descriptive} descriptive tags, expected ${rules.min}–${rules.max}`);
}

const spellings = new Map();
for (const tag of counts.keys()) {
  const key = spellingKey(tag);
  spellings.set(key, [...(spellings.get(key) ?? []), tag]);
}
for (const variants of spellings.values()) {
  if (variants.length < 2) continue;
  const where = variants.map((t) => `"${t}" (${posts.filter((p) => p.tags.includes(t)).map((p) => p.slug).join(", ")})`);
  errors.push(`spelling drift: ${where.join(" vs ")} — pick one and record the other in aliases.md`);
}

if (errors.length) {
  console.error(`tags:check found ${errors.length} problem(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error("\nRules: tag-system/tag-rules.md, tag-system/aliases.md");
  process.exit(1);
}
console.log(`tags:check ok — ${counts.size} tags, ${posts.length} posts`);
