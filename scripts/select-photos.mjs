import sharp from "sharp";
import { readdir, mkdir, writeFile } from "node:fs/promises";
const dir = "public/images/events/gallery";
const out = "public/images/events/wall";
await mkdir(out, { recursive: true });
const files = (await readdir(dir)).sort();
const picked = [];
for (const f of files) {
  const img = sharp(`${dir}/${f}`);
  const stats = await img.stats();
  const meta = await img.metadata();
  const [r, g, b] = stats.channels.map((c) => c.mean / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const portrait = meta.height > meta.width * 1.15;
  // skip bright screenshots / text posters, keep darker photographs
  if (lum > 0.5 || portrait) continue;
  const name = f.replace(".webp", "");
  await sharp(`${dir}/${f}`).resize(900, 900, { fit: "inside" }).webp({ quality: 72 }).toFile(`${out}/${name}.webp`);
  picked.push({ src: `/images/events/wall/${name}.webp`, lum: Number(lum.toFixed(3)) });
}
await writeFile("data/gallery.json", JSON.stringify({ photos: picked }, null, 2));
console.log("picked", picked.length, "of", files.length);
