#!/usr/bin/env node
// pnpm slides:import <deck.md> <png-dir> --slug <slug> [--from N]
//
// The full deck → post workflow (how to export the PNGs, cover, writing the post) is the
// slidev-to-blog skill: ~/ai_session_summary/.claude/skills/slidev-to-blog/SKILL.md
//
// Turns a Slidev deck export into a slides post:
//   <png-dir>/<N>.png
//     → src/content/blog/<slug>/slides/NN.jpg (1600px wide JPEG)
//   prints the <SlideGrid> MDX block to stdout; each image's alt is that slide's text,
//   read from the deck markdown, so the post body keeps the words for search and the .md endpoint.
// --from defaults to 2: slide 1 becomes the post cover (pnpm cover), and the hero already opens the lightbox on it.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const WIDTH = 1600;
const JPEG = { quality: 78, mozjpeg: true };

function parseArgs(args) {
	const options = { deck: undefined, pngDir: undefined, slug: undefined, from: 2 };
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "--slug") options.slug = args[++i];
		else if (arg === "--from") options.from = Number(args[++i]);
		else if (!arg.startsWith("-") && !options.deck) options.deck = arg;
		else if (!arg.startsWith("-") && !options.pngDir) options.pngDir = arg;
		else throw new Error(`Unknown or misplaced argument: ${arg}`);
	}
	if (!options.deck || !options.pngDir || !options.slug) {
		throw new Error("Usage: pnpm slides:import <deck.md> <png-dir> --slug <slug> [--from N]");
	}
	return options;
}

// Same split Slidev uses: `---` starts a slide; `---` + `key: value` lines + `---` is that slide's frontmatter.
function splitSlides(source) {
	const lines = source.split("\n");
	const end = lines.indexOf("---", 1);
	const slides = [];
	let current = [];
	for (let i = end + 1; i < lines.length; i++) {
		if (lines[i] !== "---") {
			current.push(lines[i]);
			continue;
		}
		slides.push(current);
		current = [];
		let k = i + 1;
		while (k < lines.length && /^[A-Za-z_][\w-]*:/.test(lines[k])) k++;
		if (k > i + 1 && lines[k] === "---") i = k;
	}
	slides.push(current);
	return slides;
}

function slideText(lines) {
	const body = lines
		.join("\n")
		.replace(/<!--[\s\S]*?-->/g, "")
		.replace(/^```[^\n]*\n([\s\S]*?)^```/gm, (_, code) => `程式碼：${code.trim().split("\n")[0]}…`);
	return body
		.split("\n")
		// 每頁頂端的課程段落麵包屑（absolute 定位的 div）不是這頁的內容
		.filter((line) => !/^<div class="absolute/.test(line))
		.filter((line) => !/^\|[\s:|-]+\|$/.test(line))
		.map((line) =>
			line
				.replace(/<[^>]+>/g, "")
				.replace(/^#+\s*/, "")
				.replace(/^\s*(?:[-*]|\d+\.)\s+/, "")
				.replace(/\|/g, " ")
				// alt 裡的 { } 會被 MDX 當成 JSX 表達式，[ ] 會截斷圖片語法
				.replace(/[*`[\]{}<>]/g, "")
				.replace(/\s+/g, " ")
				.trim(),
		)
		.filter(Boolean)
		.join(" ");
}

const options = parseArgs(process.argv.slice(2));
const slides = splitSlides(fs.readFileSync(options.deck, "utf8"));
const pngs = fs
	.readdirSync(options.pngDir)
	.filter((file) => file.endsWith(".png"))
	.sort((a, b) => parseInt(a) - parseInt(b));
if (pngs.length !== slides.length) {
	throw new Error(`Deck has ${slides.length} slides but ${options.pngDir} has ${pngs.length} PNGs`);
}

const outDir = path.join("src/content/blog", options.slug, "slides");
fs.mkdirSync(outDir, { recursive: true });
const pad = String(slides.length).length;
const blocks = [];
for (let n = options.from; n <= slides.length; n++) {
	const name = `${String(n).padStart(pad, "0")}.jpg`;
	await sharp(path.join(options.pngDir, pngs[n - 1]))
		.resize({ width: WIDTH })
		.jpeg(JPEG)
		.toFile(path.join(outDir, name));
	const text = slideText(slides[n - 1]);
	// 字都畫在背景圖裡的頁面抽不到文字，alt 要手動補
	if (!text) console.error(`Slide ${n} has no text: write its alt by hand`);
	blocks.push(`![投影片 ${n}：${text}](./slides/${name})`);
}

console.log(`<SlideGrid>\n\n${blocks.join("\n\n")}\n\n</SlideGrid>`);
console.error(`Wrote ${blocks.length} slides to ${outDir}`);
