#!/usr/bin/env node
// pnpm cover <image> --slug <slug>
//
// Turns one generated cover image into the two files a post uses and flags the post:
//   public/images/posts/<slug>/og.jpg     1200×630, watermarked → OG meta, article hero, card view
//   public/images/posts/<slug>/thumb.jpg  480×360, centre 4:3 of the OG frame, no watermark → list view
//                                         (--thumb-fit contain: the whole source image instead, see below)
//   src/content/blog/<slug>/index.mdx     gets `cover: true` if it is missing
//
// Composition rule for generated images: keep the subject, product logos and labels inside the
// centre 70% of the width (the 4:3 thumbnail), and nothing important in the top/bottom 4%.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import { burnWatermark } from "./watermark-image.mjs";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
// 4:3 slice of the 1200×630 frame: 840×630 starting at x=180
const THUMB_CROP = { left: 180, top: 0, width: 840, height: 630 };
const THUMB_WIDTH = 480;
const THUMB_HEIGHT = 360;
const JPEG = { quality: 78, mozjpeg: true };
const SIZE_BUDGET = 200 * 1024;
// Matches the size of the watermark baked into the generated covers
const WATERMARK_SCALE = 0.65;
const ANCHORS = new Set(["center", "top", "bottom"]);
const THUMB_FITS = new Set(["cover", "contain"]);

function usage() {
	console.log(`
Usage:
  pnpm cover <image> --slug <slug> [--baked-watermark] [--anchor center|top|bottom] [--thumb-fit cover|contain] [--force]

Options:
  --slug <slug>        Post folder under src/content/blog/ (required)
  --baked-watermark    The image already has jasperhung.dev burned in at bottom-right:
                       skip burning another one and crop from the bottom (keeps the mark)
  --anchor <where>     Which part to keep when the image is taller than 1.91:1
                       (default: bottom with --baked-watermark, otherwise center)
  --thumb-fit <fit>    cover (default): thumb is the centre 4:3 of the OG frame
                       contain: the whole image fits the thumb width, top/bottom filled with a
                       blurred, darkened copy of itself (slide covers: titles span the full width)
  --force              Replace an existing og.jpg / thumb.jpg

Outputs public/images/posts/<slug>/og.jpg + thumb.jpg and adds \`cover: true\` to the post.
`);
}

function parseArgs(args) {
	const options = { input: undefined, slug: undefined, baked: false, anchor: undefined, thumbFit: "cover", force: false };
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "--help" || arg === "-h") return { help: true };
		if (arg === "--slug") options.slug = args[++i];
		else if (arg === "--baked-watermark") options.baked = true;
		else if (arg === "--anchor") options.anchor = args[++i];
		else if (arg === "--thumb-fit") options.thumbFit = args[++i];
		else if (arg === "--force") options.force = true;
		else if (!arg.startsWith("-") && !options.input) options.input = arg;
		else throw new Error(`Unknown or misplaced argument: ${arg}`);
	}
	if (!options.input) throw new Error("Missing input image.");
	if (!options.slug) throw new Error("Missing --slug.");
	options.anchor ??= options.baked ? "bottom" : "center";
	if (!ANCHORS.has(options.anchor)) throw new Error("--anchor must be center, top, or bottom.");
	if (!THUMB_FITS.has(options.thumbFit)) throw new Error("--thumb-fit must be cover or contain.");
	return options;
}

/** Crop to 1200:630 (centre horizontally; `anchor` vertically) and resize to 1200×630. */
async function toOgFrame(input, anchor) {
	const { width, height } = await sharp(input).metadata();
	if (!width || !height) throw new Error("Could not determine image dimensions.");
	const target = OG_WIDTH / OG_HEIGHT;
	let crop = { left: 0, top: 0, width, height };
	if (width / height > target) {
		const w = Math.round(height * target);
		crop = { left: Math.round((width - w) / 2), top: 0, width: w, height };
	} else if (width / height < target) {
		const h = Math.round(width / target);
		const top = anchor === "top" ? 0 : anchor === "bottom" ? height - h : Math.round((height - h) / 2);
		crop = { left: 0, top, width, height: h };
	}
	const buffer = await sharp(input).extract(crop).resize(OG_WIDTH, OG_HEIGHT).png().toBuffer();
	return { buffer, source: `${width}×${height}`, crop };
}

/** The whole image fitted to the thumb width, letterboxed over a blurred, darkened copy of itself. */
async function containThumb(input) {
	const fg = await sharp(input).resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: "inside" }).toBuffer({ resolveWithObject: true });
	const bg = await sharp(input).resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: "cover" }).blur(18).modulate({ brightness: 0.55 }).toBuffer();
	return sharp(bg)
		.composite([{ input: fg.data, top: Math.round((THUMB_HEIGHT - fg.info.height) / 2), left: Math.round((THUMB_WIDTH - fg.info.width) / 2) }])
		.jpeg(JPEG)
		.toBuffer();
}

function addCoverFlag(mdxPath) {
	const text = fs.readFileSync(mdxPath, "utf8");
	if (!text.startsWith("---\n")) throw new Error(`No frontmatter in ${mdxPath}`);
	const end = text.indexOf("\n---", 4);
	const frontmatter = text.slice(4, end);
	if (/^cover:/m.test(frontmatter)) return false;
	fs.writeFileSync(mdxPath, `---\n${frontmatter}\ncover: true${text.slice(end)}`);
	return true;
}

const kb = (bytes) => `${Math.round(bytes / 1024)}KB`;

async function main() {
	const options = parseArgs(process.argv.slice(2));
	if (options.help) return usage();

	const input = path.resolve(options.input);
	if (!fs.existsSync(input)) throw new Error(`Image not found: ${input}`);
	const mdxPath = path.resolve("src/content/blog", options.slug, "index.mdx");
	if (!fs.existsSync(mdxPath)) throw new Error(`No post at ${path.relative(process.cwd(), mdxPath)}`);

	const outDir = path.resolve("public/images/posts", options.slug);
	const ogPath = path.join(outDir, "og.jpg");
	const thumbPath = path.join(outDir, "thumb.jpg");
	if (!options.force && (fs.existsSync(ogPath) || fs.existsSync(thumbPath))) {
		throw new Error(`Cover already exists for ${options.slug}; pass --force to replace it.`);
	}

	const frame = await toOgFrame(input, options.anchor);
	const ogSource = options.baked
		? frame.buffer
		: (await burnWatermark(frame.buffer, { scale: WATERMARK_SCALE })).buffer;

	const og = await sharp(ogSource).jpeg(JPEG).toBuffer();
	// thumb comes from the un-watermarked frame; the bottom-right mark sits outside the 4:3 slice anyway
	const thumb =
		options.thumbFit === "contain"
			? await containThumb(input)
			: await sharp(frame.buffer).extract(THUMB_CROP).resize(THUMB_WIDTH, THUMB_HEIGHT).jpeg(JPEG).toBuffer();

	fs.mkdirSync(outDir, { recursive: true });
	fs.writeFileSync(ogPath, og);
	fs.writeFileSync(thumbPath, thumb);
	const flagged = addCoverFlag(mdxPath);

	const rel = (p) => path.relative(process.cwd(), p);
	console.log(`Source:  ${frame.source} → crop ${frame.crop.width}×${frame.crop.height} at (${frame.crop.left}, ${frame.crop.top}), anchor ${options.anchor}`);
	console.log(`og:      ${rel(ogPath)}  ${OG_WIDTH}×${OG_HEIGHT}  ${kb(og.length)}  ${options.baked ? "(baked watermark kept)" : "(watermark burned)"}`);
	console.log(`thumb:   ${rel(thumbPath)}  ${THUMB_WIDTH}×${THUMB_HEIGHT}  ${kb(thumb.length)}  (${options.thumbFit})`);
	console.log(`post:    ${rel(mdxPath)}  ${flagged ? "added cover: true" : "cover already set"}`);
	if (og.length > SIZE_BUDGET) console.warn(`warning: og.jpg is ${kb(og.length)}, over the 200KB budget`);
}

main().catch((error) => {
	console.error(`cover failed: ${error.message}`);
	process.exitCode = 1;
});
