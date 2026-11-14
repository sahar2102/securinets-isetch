import sharp from "sharp";
const SRC = "public/brand/logo.jpg";
const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const out = Buffer.alloc(data.length);
for (let i = 0; i < data.length; i += 4) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const max = Math.max(r, g, b);
  // near-black -> transparent, with a soft ramp so antialiased edges stay clean
  const a = Math.max(0, Math.min(255, Math.round(((max - 10) / 22) * 255)));
  out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = Math.min(a, data[i + 3]);
}
await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim()
  .resize(1024, 1024, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile("public/brand/logo.png");
console.log("logo.png written");
