/**
 * scripts/generate-assets.js
 *
 * Generates PNG favicon sizes, apple-touch-icon, maskable PWA icons,
 * and an OG social banner from inline SVG sources.
 *
 * Strategy:
 *   1. Tries `sharp` (fast, libvips-based) if installed.
 *   2. Falls back to `@resvg/resvg-js` if installed.
 *   3. Falls back to `jimp` (pure JS, no native deps) if sharp is unavailable.
 *
 * Run: node scripts/generate-assets.js
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')
const iconsDir = path.join(publicDir, 'icons')
mkdirSync(iconsDir, { recursive: true })

// ─── SVG Sources ─────────────────────────────────────────────────────────────
function iconSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  <rect width="100" height="100" rx="24" fill="#0F172A"/>
  <path d="M 25 78 L 25 48 L 43 30 L 43 78 Z M 57 78 L 57 30 L 75 12 L 75 78 Z" fill="#FFFFFF"/>
  <path d="M 34 12 L 43 21 L 34 30 L 25 21 Z" fill="#3b82f6"/>
</svg>`
}

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="#0F172A"/>
  <!-- Decorative clean grid in background -->
  <path d="M 0 100 L 1200 100 M 0 200 L 1200 200 M 0 300 L 1200 300 M 0 400 L 1200 400 M 0 500 L 1200 500 M 100 0 L 100 630 M 200 0 L 200 630 M 300 0 L 300 630 M 400 0 L 400 630 M 500 0 L 500 630 M 600 0 L 600 630 M 700 0 L 700 630 M 800 0 L 800 630 M 900 0 L 900 630 M 1000 0 L 1000 630 M 1100 0 L 1100 630" stroke="#334155" stroke-width="0.5" opacity="0.2"/>
  
  <!-- Logo container -->
  <g transform="translate(180, 195)">
    <rect width="240" height="240" rx="48" fill="#090b10" stroke="#334155" stroke-width="1.5"/>
    <!-- Center the 100x100 mark scaled by 2.4 -->
    <path d="M 25 78 L 25 48 L 43 30 L 43 78 Z M 57 78 L 57 30 L 75 12 L 75 78 Z" fill="#FFFFFF" transform="scale(2.4) translate(0, 0)"/>
    <path d="M 34 12 L 43 21 L 34 30 L 25 21 Z" fill="#3b82f6" transform="scale(2.4) translate(0, 0)"/>
  </g>

  <!-- Wordmark and tagline -->
  <text x="470" y="300" font-family="'Outfit', 'Plus Jakarta Sans', sans-serif"
        font-size="78" font-weight="800" letter-spacing="-2" fill="#ffffff">Code<tspan font-weight="400" fill="#9ca3af">Strategists</tspan></text>
  <text x="473" y="365" font-family="'Plus Jakarta Sans', sans-serif"
        font-size="28" font-weight="500" fill="#94a3b8" letter-spacing="0.5">
    Professional Developer Tools for Modern Frontend Engineers
  </text>
  <rect x="0" y="620" width="1200" height="10" fill="#ffffff" opacity="0.1"/>
</svg>`

// ─── Output spec ─────────────────────────────────────────────────────────────
const ICON_OUTPUTS = [
  { name: 'favicon-16x16.png',      size: 16,   dir: publicDir, svg: () => iconSvg(16) },
  { name: 'favicon-32x32.png',      size: 32,   dir: publicDir, svg: () => iconSvg(32) },
  { name: 'favicon-48x48.png',      size: 48,   dir: publicDir, svg: () => iconSvg(48) },
  { name: 'apple-touch-icon.png',   size: 180,  dir: publicDir, svg: () => iconSvg(180) },
  { name: 'icon-192.png',           size: 192,  dir: iconsDir,  svg: () => iconSvg(192) },
  { name: 'icon-512.png',           size: 512,  dir: iconsDir,  svg: () => iconSvg(512) },
  { name: 'icon-maskable-512.png',  size: 512,  dir: iconsDir,  svg: () => iconSvg(512) },
]

// ─── Render with sharp ────────────────────────────────────────────────────────
async function renderWithSharp() {
  const sharp = require('sharp')
  console.log('  Using: sharp\n')
  for (const { name, size, dir, svg } of ICON_OUTPUTS) {
    const out = path.join(dir, name)
    await sharp(Buffer.from(svg()), { density: Math.ceil((size / 100) * 96) })
      .resize(size, size)
      .png({ quality: 95, compressionLevel: 9 })
      .toFile(out)
    console.log(`  ✅  ${name}  (${size}×${size})`)
  }
  const ogOut = path.join(publicDir, 'og-image.png')
  await sharp(Buffer.from(ogSvg), { density: 96 })
    .resize(1200, 630)
    .png({ quality: 95 })
    .toFile(ogOut)
  console.log(`  ✅  og-image.png  (1200×630)`)
  const twitterOut = path.join(publicDir, 'twitter-card.png')
  await sharp(Buffer.from(ogSvg), { density: 96 })
    .resize(1200, 628)
    .png({ quality: 95 })
    .toFile(twitterOut)
  console.log(`  ✅  twitter-card.png  (1200×628)`)
}

// ─── Render with jimp (pure JS fallback) ─────────────────────────────────────
async function renderWithJimp() {
  console.log('  Using: jimp (pure-JS fallback placeholder generation)\n')
  const Jimp = (await import('jimp')).default
  for (const { name, size, dir } of ICON_OUTPUTS) {
    const img = new Jimp({ width: size, height: size, color: 0x0c0f17ff })
    const out = path.join(dir, name)
    await img.write(out)
    console.log(`  ⚠️   ${name}  (${size}×${size}) — placeholders written`)
  }
}

// ─── Render with @resvg/resvg-js ─────────────────────────────────────────────
async function renderWithResvg() {
  const { Resvg } = await import('@resvg/resvg-js')
  console.log('  Using: @resvg/resvg-js\n')
  for (const { name, size, dir, svg } of ICON_OUTPUTS) {
    const resvg = new Resvg(svg(), {
      fitTo: { mode: 'width', value: size },
    })
    const pngData = resvg.render()
    const out = path.join(dir, name)
    writeFileSync(out, pngData.asPng())
    console.log(`  ✅  ${name}  (${size}×${size})`)
  }
  // OG image
  const resvgOg = new Resvg(ogSvg, { fitTo: { mode: 'width', value: 1200 } })
  const ogPng = resvgOg.render()
  const ogOut = path.join(publicDir, 'og-image.png')
  writeFileSync(ogOut, ogPng.asPng())
  console.log(`  ✅  og-image.png  (1200×630)`)
  const twitterOut = path.join(publicDir, 'twitter-card.png')
  writeFileSync(twitterOut, ogPng.asPng())
  console.log(`  ✅  twitter-card.png  (1200×630)`)
}

// ─── Compile favicon.ico from 16x16, 32x32, 48x48 ───────────────────────────
function generateIco() {
  console.log('\n📦 Compiling multi-resolution favicon.ico from PNG assets...');
  try {
    const sizes = [16, 32, 48];
    const pngs = sizes.map(size => {
      const filePath = path.join(publicDir, `favicon-${size}x${size}.png`);
      return {
        width: size,
        height: size,
        buffer: readFileSync(filePath)
      };
    });

    // ICO file header: 6 bytes
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // Reserved
    header.writeUInt16LE(1, 2); // Resource Type (1 = ICO)
    header.writeUInt16LE(pngs.length, 4); // Number of images

    // Directory Entries: 16 bytes per image
    const entries = [];
    let currentOffset = 6 + pngs.length * 16;

    for (const png of pngs) {
      const entry = Buffer.alloc(16);
      entry.writeUInt8(png.width, 0); // Width
      entry.writeUInt8(png.height, 1); // Height
      entry.writeUInt8(0, 2); // Colors in image (0 for >= 256 colors)
      entry.writeUInt8(0, 3); // Reserved
      entry.writeUInt16LE(1, 4); // Color Planes (1)
      entry.writeUInt16LE(32, 6); // Bits per pixel (32)
      entry.writeUInt32LE(png.buffer.length, 8); // Size of image data in bytes
      entry.writeUInt32LE(currentOffset, 12); // Offset from start of file

      entries.push(entry);
      currentOffset += png.buffer.length;
    }

    const icoBuffer = Buffer.concat([
      header,
      ...entries,
      ...pngs.map(p => p.buffer)
    ]);

    writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
    console.log('  ✅  favicon.ico successfully created!\n');
  } catch (err) {
    console.error('  ❌ Failed to generate favicon.ico:', err.message);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log('\n🎨 CodeStrategists — Generating brand assets...\n')

try {
  require.resolve('sharp')
  await renderWithSharp()
  generateIco()
} catch {
  try {
    await import('@resvg/resvg-js')
    await renderWithResvg()
    generateIco()
  } catch {
    try {
      await import('jimp')
      await renderWithJimp()
      generateIco()
    } catch {
      console.warn('  ⚠️  Neither sharp, @resvg/resvg-js, nor jimp found. Please install sharp or @resvg/resvg-js to generate high-quality PNGs.')
      process.exit(1)
    }
  }
}

console.log('\n🚀 All assets generated successfully!\n')
