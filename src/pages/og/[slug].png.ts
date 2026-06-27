import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { createCanvas, GlobalFonts, Path2D } from '@napi-rs/canvas';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

GlobalFonts.registerFromPath(resolve(root, 'src/assets/fonts/NotoSansCJKtc-Medium.otf'), 'Noto Sans TC');

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.id },
    props: { title: post.data.ogTitle ?? post.data.title },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { title } = props as { title: string };

  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, W, H);

  const titleLayout = layoutTitle(ctx, title, 960, 458);
  const titleCenterY = (76 + 534) / 2;
  ctx.font = `600 ${titleLayout.fontSize}px "Noto Sans TC"`;
  ctx.fillStyle = '#f8fafc';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  drawWrapped(ctx, titleLayout.lines, W / 2, titleCenterY, titleLayout.lineHeight);

  drawJHMark(ctx, W / 2, H - 34 - 30, 60);

  // Bottom blue belt
  ctx.fillStyle = '#60a5fa';
  ctx.fillRect(0, H - 24, W, 24);

  return new Response(canvas.toBuffer('image/png'), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

function layoutTitle(
  ctx: ReturnType<typeof createCanvas>['getContext'],
  text: string,
  maxWidth: number,
  maxHeight: number,
) {
  for (let fontSize = 112; fontSize >= 40; fontSize -= 2) {
    ctx.font = `600 ${fontSize}px "Noto Sans TC"`;
    const lineHeight = Math.round(fontSize * 1.18);
    const lines = text.includes('|')
      ? splitManualLines(text)
      : autoWrap(ctx, text, maxWidth, maxHeight, lineHeight);
    if (!lines.length) continue;

    const widest = Math.max(...lines.map(line => ctx.measureText(line).width));
    const totalHeight = lines.length * lineHeight;
    if (widest <= maxWidth && totalHeight <= maxHeight) return { fontSize, lineHeight, lines };
  }

  const fontSize = 40;
  const lineHeight = Math.round(fontSize * 1.18);
  const lines = text.includes('|')
    ? splitManualLines(text)
    : autoWrap(ctx, text, maxWidth, maxHeight, lineHeight);
  return { fontSize, lineHeight, lines };
}

function drawWrapped(
  ctx: ReturnType<typeof createCanvas>['getContext'],
  lines: string[],
  x: number,
  centerY: number,
  lineHeight: number,
) {
  const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => ctx.fillText(line, x, startY + i * lineHeight));
}

function splitManualLines(text: string) {
  return text.split('|').map(line => line.trim()).filter(Boolean);
}

function autoWrap(
  ctx: ReturnType<typeof createCanvas>['getContext'],
  text: string,
  maxWidth: number,
  maxHeight: number,
  lineHeight: number,
) {
  const tokens = segmentForWrap(text);
  const maxLines = Math.min(4, Math.floor(maxHeight / lineHeight));

  for (let lineCount = 1; lineCount <= maxLines; lineCount++) {
    const lines = fitLineCount(ctx, tokens, maxWidth, lineCount);
    if (lines) return lines;
  }

  return [];
}

function fitLineCount(
  ctx: ReturnType<typeof createCanvas>['getContext'],
  tokens: string[],
  maxWidth: number,
  lineCount: number,
) {
  const n = tokens.length;
  const rawWidth = ctx.measureText(tokens.join('')).width;
  const targetWidth = Math.min(maxWidth * 0.85, rawWidth / lineCount);
  const dp: Array<Array<{ cost: number; prev: number } | null>> = Array.from({ length: lineCount + 1 }, () => Array(n + 1).fill(null));
  dp[0][0] = { cost: 0, prev: -1 };

  for (let line = 1; line <= lineCount; line++) {
    for (let end = line; end <= n; end++) {
      for (let start = line - 1; start < end; start++) {
        const prev = dp[line - 1][start];
        if (!prev) continue;

        const lineText = tokens.slice(start, end).join('').trim();
        if (!lineText) continue;

        const width = ctx.measureText(lineText).width;
        if (width > maxWidth) continue;

        let penalty = (width - targetWidth) ** 2;
        if (lineText.length <= 1) penalty += 100_000_000;
        else if (lineText.length <= 3) penalty += 1_000_000;
        if (/^[，。、：；！？,.!?]/u.test(lineText)) penalty += 1_000_000;

        const cost = prev.cost + penalty;
        const current = dp[line][end];
        if (!current || cost < current.cost) dp[line][end] = { cost, prev: start };
      }
    }
  }

  const result = dp[lineCount][n];
  if (!result) return null;

  const lines: string[] = [];
  let end = n;
  for (let line = lineCount; line > 0; line--) {
    const node = dp[line][end];
    if (!node) return null;
    lines.unshift(tokens.slice(node.prev, end).join('').trim());
    end = node.prev;
  }

  return lines;
}

function segmentForWrap(text: string) {
  const tokens: string[] = [];
  let latin = '';

  for (const char of text) {
    if (/\s/.test(char)) {
      if (latin) tokens.push(latin);
      latin = '';
      tokens.push(char);
    } else if (isCjkOrCjkPunctuation(char)) {
      if (latin) tokens.push(latin);
      latin = '';
      tokens.push(char);
    } else {
      latin += char;
    }
  }

  if (latin) tokens.push(latin);
  return tokens;
}

function isCjkOrCjkPunctuation(char: string) {
  return /[\u3000-\u303f\uff00-\uffef\u3400-\u9fff]/u.test(char);
}

function drawJHMark(
  ctx: ReturnType<typeof createCanvas>['getContext'],
  centerX: number,
  centerY: number,
  size: number,
) {
  ctx.save();
  ctx.translate(centerX - size / 2, centerY - size / 2);
  ctx.scale(size / 1254, size / 1254);
  ctx.translate(-12, 0);
  ctx.translate(627, 627);
  ctx.scale(1.32, 1.32);
  ctx.translate(-627, -627);
  ctx.fillStyle = '#60a5fa';
  roundedRect(ctx, 265, 285, 435, 150, 16);
  roundedRect(ctx, 560, 285, 140, 470, 0);
  ctx.fill(new Path2D('M 264.5 748 A 217.5 217.5 0 0 0 482 965.5 A 217.5 217.5 0 0 0 699.5 748 L 559.5 748 A 77.5 77.5 0 0 1 482 825.5 A 77.5 77.5 0 0 1 404.5 748 Z'));
  roundedRect(ctx, 265, 685, 140, 70, 0);
  roundedRect(ctx, 830, 285, 140, 690, 16);
  roundedRect(ctx, 690, 525, 150, 165, 0);
  ctx.restore();
}

function roundedRect(
  ctx: ReturnType<typeof createCanvas>['getContext'],
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}
