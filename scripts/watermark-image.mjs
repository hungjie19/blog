#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const DEFAULT_TEXT = "jasperhung.dev";
const TONES = new Set(["auto", "light", "dark"]);

function usage() {
	console.log(`
Usage:
  pnpm watermark <image> [--out <path>] [--overwrite] [--text <text>] [--tone auto|light|dark]

Defaults:
  - Creates a sibling file named <name>-watermarked.<ext>
  - Burns "${DEFAULT_TEXT}" into the lower-right corner
  - Chooses light or dark text from the lower-right image area
`);
}

function parseArgs(args) {
	const options = { input: undefined, output: undefined, overwrite: false, text: DEFAULT_TEXT, tone: "auto" };

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "--help" || arg === "-h") return { help: true };
		if (arg === "--out") options.output = args[++i];
		else if (arg === "--overwrite") options.overwrite = true;
		else if (arg === "--text") options.text = args[++i];
		else if (arg === "--tone") options.tone = args[++i];
		else if (!arg.startsWith("-") && !options.input) options.input = arg;
		else throw new Error(`Unknown or misplaced argument: ${arg}`);
	}

	if (!options.input) throw new Error("Missing input image.");
	if (!options.text) throw new Error("Watermark text cannot be empty.");
	if (!TONES.has(options.tone)) throw new Error("--tone must be auto, light, or dark.");
	return options;
}

function outputPath(input, output, overwrite) {
	if (output) return output;
	if (overwrite) return input;
	const parsed = path.parse(input);
	return path.join(parsed.dir, `${parsed.name}-watermarked${parsed.ext}`);
}

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

async function luminanceAtBottomRight(input, width, height) {
	const cropWidth = Math.max(1, Math.round(width * 0.32));
	const cropHeight = Math.max(1, Math.round(height * 0.14));
	const { channels } = await sharp(input)
		.extract({ left: width - cropWidth, top: height - cropHeight, width: cropWidth, height: cropHeight })
		.removeAlpha()
		.stats();
	const [red, green, blue] = channels.map((channel) => channel.mean);
	return (red * 0.2126) + (green * 0.7152) + (blue * 0.0722);
}

function watermarkSvg({ width, height, text, tone }) {
	const shortSide = Math.min(width, height);
	const fontSize = clamp(Math.round(shortSide * 0.043), 16, 56);
	const margin = clamp(Math.round(shortSide * 0.035), 16, 48);
	const fill = tone === "dark" ? "#151515" : "#ffffff";
	const stroke = tone === "dark" ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.72)";
	const escaped = text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

	return Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <text x="${width - margin}" y="${height - margin}" text-anchor="end"
    font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700"
    letter-spacing="0.5" fill="${fill}" fill-opacity="0.88"
    stroke="${stroke}" stroke-width="${Math.max(1, Math.round(fontSize * 0.08))}" paint-order="stroke">${escaped}</text>
</svg>`);
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	if (options.help) return usage();

	const input = path.resolve(options.input);
	const output = path.resolve(outputPath(input, options.output, options.overwrite));
	if (input === output && !options.overwrite) {
		throw new Error("Refusing to overwrite input without --overwrite.");
	}

	const metadata = await sharp(input).metadata();
	if (!metadata.width || !metadata.height) throw new Error("Could not determine image dimensions.");

	const sampledLuminance = options.tone === "auto"
		? await luminanceAtBottomRight(input, metadata.width, metadata.height)
		: undefined;
	const resolvedTone = options.tone === "auto"
		? (sampledLuminance > 150 ? "dark" : "light")
		: options.tone;

	await sharp(input)
		.composite([{ input: watermarkSvg({ width: metadata.width, height: metadata.height, text: options.text, tone: resolvedTone }) }])
		.toFile(output);

	console.log(`Watermarked image: ${output}`);
	console.log(`Tone: ${resolvedTone}${sampledLuminance === undefined ? "" : ` (sampled luminance ${sampledLuminance.toFixed(0)})`}`);
}

main().catch((error) => {
	console.error(`watermark failed: ${error.message}`);
	process.exitCode = 1;
});
