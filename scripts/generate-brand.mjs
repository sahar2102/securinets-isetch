/**
 * Builds favicon, app icons and the Open Graph image from the club seal.
 * Usage: node scripts/generate-brand.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const SRC = "public/brand/logo.png";
await mkdir("public/brand", { recursive: true });

// App icons / favicons
await sharp(SRC).resize(512, 512, { fit: "cover" }).png().toFile("public/icon.png");
await sharp(SRC).resize(192, 192, { fit: "cover" }).png().toFile("public/icon-192.png");
await sharp(SRC).resize(180, 180, { fit: "cover" }).png().toFile("public/apple-icon.png");

// favicon.ico containing a single 64x64 PNG frame
const png64 = await sharp(SRC).resize(64, 64, { fit: "cover" }).png().toBuffer();
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16);
entry[0] = 64;
entry[1] = 64;
entry[2] = 0;
entry[3] = 0;
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(png64.length, 8);
entry.writeUInt32LE(22, 12);
await writeFile("public/favicon.ico", Buffer.concat([header, entry, png64]));

// Open Graph / Twitter card 1200x630
const logoRaw = await sharp(SRC).resize(300, 300).png().toBuffer();
const mask = Buffer.from(
  `<svg width="300" height="300"><circle cx="150" cy="150" r="150" fill="#fff"/></svg>`,
);
const logo = await sharp(logoRaw).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <radialGradient id="g1" cx="78%" cy="18%" r="70%">
      <stop offset="0%" stop-color="#B3001B" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#08080b" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="line" x1="0" x2="1">
      <stop offset="0" stop-color="#FF2D3D"/>
      <stop offset="1" stop-color="#8B0000"/>
    </linearGradient>
    <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
      <path d="M56 0H0V56" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#08080b"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect x="0" y="0" width="1200" height="4" fill="url(#line)"/>
  <text x="72" y="196" font-family="DejaVu Sans, sans-serif" font-size="22" letter-spacing="7" fill="#FF5A66">SECURINETS · TUNIS · 2026</text>
  <text x="70" y="300" font-family="DejaVu Sans, sans-serif" font-weight="bold" font-size="78" fill="#F3F1F5">ISET CHARGUIA</text>
  <text x="70" y="372" font-family="DejaVu Sans, sans-serif" font-size="28" fill="#A09CA8">Student cybersecurity club — workshops,</text>
  <text x="70" y="412" font-family="DejaVu Sans, sans-serif" font-size="28" fill="#A09CA8">CTF training and a permanent challenge range.</text>
  <text x="72" y="532" font-family="DejaVu Sans Mono, monospace" font-size="22" fill="#FF5A66">&gt;_ securinets --join</text>
  <text x="72" y="572" font-family="DejaVu Sans Mono, monospace" font-size="17" fill="#6f6a77">49 challenges · 10 categories · SNT{...}</text>
  <circle cx="960" cy="330" r="212" fill="none" stroke="#FF2D3D" stroke-opacity="0.25" stroke-dasharray="4 10"/>
</svg>`;

await sharp(Buffer.from(svg))
  .composite([{ input: logo, left: 812, top: 182 }])
  .jpeg({ quality: 92 })
  .toFile("public/og.jpg");

// Team avatar placeholder (initials are rendered in CSS; this is the fallback pattern)
await sharp({
  create: { width: 64, height: 64, channels: 3, background: "#121216" },
})
  .png()
  .toFile("public/team-placeholder.png");

console.log("brand assets written");
