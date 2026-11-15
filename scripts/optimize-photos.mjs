import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
const files = (await readdir("/tmp/photos")).sort();
await mkdir("public/images/events/gallery", { recursive: true });
let i = 0;
for (const f of files) {
  i++;
  await sharp(`/tmp/photos/${f}`)
    .rotate()
    .resize(1400, 1400, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 74 })
    .toFile(`public/images/events/gallery/photo-${String(i).padStart(2, "0")}.webp`);
}
console.log("optimized", i);
