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
  const avatarBuf = readFileSync(resolve(root, 'public/author-avatar.jpg'));
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
  ctx.fillText('Jasper cowork with AI', ax + ar * 2 + 18, ay + ar);

  // Title (vertically centered between header bottom and url top)
  const headerBottom = ay + ar * 2; // 125
  const safeBottom = H - 57;        // 573
  const urlZoneH = 60;
  const titleCenterY = (headerBottom + safeBottom - urlZoneH) / 2;

  ctx.font = '600 80px Geist, CJK';
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  drawWrapped(ctx, title, W / 2, titleCenterY, 1000, 96);

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

function drawWrapped(
  ctx: ReturnType<typeof createCanvas>['getContext'],
  text: string,
  x: number,
  centerY: number,
  maxWidth: number,
  lineHeight: number,
) {
  const lines: string[] = [];
  let current = '';

  // Character-level iteration: allows breaking between CJK chars
  for (const char of text) {
    const test = current + char;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current.trimEnd());
      current = char === ' ' ? '' : char;
    } else {
      current += char;
    }
  }
  if (current.trim()) lines.push(current.trim());

  const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => ctx.fillText(line, x, startY + i * lineHeight));
}
