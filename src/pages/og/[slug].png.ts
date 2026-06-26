import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

GlobalFonts.registerFromPath(resolve(root, 'src/assets/fonts/Geist-Regular.woff2'), 'Geist');
GlobalFonts.registerFromPath(resolve(root, 'src/assets/fonts/Geist-SemiBold.woff2'), 'Geist');

// CJK fallback: macOS STHeiti → Linux Noto CJK (installed in CI)
const cjkPaths = [
  '/System/Library/Fonts/STHeiti Medium.ttc',
  '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
  '/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc',
];
for (const p of cjkPaths) {
  if (existsSync(p)) { GlobalFonts.registerFromPath(p, 'CJK'); break; }
}

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.id },
    props: { title: post.data.title },
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

  // Avatar (circle clip, object-fit: cover)
  // safe zone left:60 top:33, header pt:20 pl:20 → avatar at (80, 53)
  const ax = 80, ay = 53, ar = 36;
  const avatarBuf = readFileSync(resolve(root, 'public/author-avatar.png'));
  const avatarImg = await loadImage(avatarBuf);
  const size = ar * 2;
  // Crop to square from center (cover behaviour)
  const srcSize = Math.min(avatarImg.width, avatarImg.height);
  const srcX = (avatarImg.width - srcSize) / 2;
  const srcY = (avatarImg.height - srcSize) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(ax + ar, ay + ar, ar, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(avatarImg, srcX, srcY, srcSize, srcSize, ax, ay, size, size);
  ctx.restore();

  // Blog name (beside avatar)
  ctx.font = '400 40px Geist, CJK';
  ctx.fillStyle = '#d4d4d4';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('Jasper Hung', ax + ar * 2 + 18, ay + ar);

  // Title (vertically centered between header bottom and url top)
  const headerBottom = ay + ar * 2; // 125
  const safeBottom = H - 57;        // 573
  const urlZoneH = 60;
  const titleCenterY = (headerBottom + safeBottom - urlZoneH) / 2;

  const titleLayout = layoutTitle(ctx, title, 1000);
  ctx.font = `600 ${titleLayout.fontSize}px Geist, CJK`;
  ctx.fillStyle = '#f8fafc';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  drawWrapped(ctx, titleLayout.lines, W / 2, titleCenterY, titleLayout.lineHeight);

  // URL
  ctx.font = '400 40px Geist, CJK';
  ctx.fillStyle = '#a1a1aa';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText('jasperhung.dev', W / 2, safeBottom - 30);

  // Bottom blue bar
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
) {
  const sizes = [80, 76, 72, 68, 64];
  for (const fontSize of sizes) {
    ctx.font = `600 ${fontSize}px Geist, CJK`;
    const greedyLines = greedyWrap(ctx, text, maxWidth);
    if (greedyLines.length <= 2 || (greedyLines.length <= 3 && fontSize <= 72)) {
      if (!hasOrphanLine(greedyLines)) {
        return { fontSize, lineHeight: Math.round(fontSize * 1.2), lines: greedyLines };
      }

      const lines = balancedWrap(ctx, text, maxWidth, greedyLines.length);
      if (lines) {
        return { fontSize, lineHeight: Math.round(fontSize * 1.2), lines };
      }
    }
  }

  ctx.font = '600 64px Geist, CJK';
  return { fontSize: 64, lineHeight: 77, lines: greedyWrap(ctx, text, maxWidth) };
}

function hasOrphanLine(lines: string[]) {
  return lines.some(line => line.trim().length <= 1);
}

function balancedWrap(
  ctx: ReturnType<typeof createCanvas>['getContext'],
  text: string,
  maxWidth: number,
  lineCount: number,
) {
  const tokens = segmentForWrap(text);
  const rawWidth = ctx.measureText(text).width;
  const targetWidth = Math.min(maxWidth * 0.9, rawWidth / lineCount);
  return fitLineCount(ctx, tokens, maxWidth, targetWidth, lineCount);
}

function fitLineCount(
  ctx: ReturnType<typeof createCanvas>['getContext'],
  tokens: string[],
  maxWidth: number,
  targetWidth: number,
  lineCount: number,
) {
  const n = tokens.length;
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

function greedyWrap(
  ctx: ReturnType<typeof createCanvas>['getContext'],
  text: string,
  maxWidth: number,
) {
  const tokens = segmentForWrap(text);
  return wrapTokens(ctx, tokens, maxWidth);
}

function wrapTokens(
  ctx: ReturnType<typeof createCanvas>['getContext'],
  tokens: string[],
  maxWidth: number,
) {
  const lines: string[] = [];
  let current = '';

  for (const token of tokens) {
    const test = current + token;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
      continue;
    }

    if (current.trim()) {
      lines.push(current.trimEnd());
      current = token.trimStart();
      continue;
    }

    lines.push(...splitLongToken(ctx, token, maxWidth));
    current = '';
  }

  if (current.trim()) lines.push(current.trim());
  return lines;
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

function splitLongToken(
  ctx: ReturnType<typeof createCanvas>['getContext'],
  token: string,
  maxWidth: number,
) {
  const parts: string[] = [];
  let current = '';

  for (const char of token) {
    const test = current + char;
    if (ctx.measureText(test).width > maxWidth && current) {
      parts.push(current);
      current = char;
    } else {
      current = test;
    }
  }

  if (current) parts.push(current);
  return parts;
}
