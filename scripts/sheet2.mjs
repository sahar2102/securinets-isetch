import sharp from "sharp";
import { readFile } from "node:fs/promises";
const { files } = JSON.parse(await readFile("/tmp/wall.json", "utf8"));
const tiles = await Promise.all(files.map(f => sharp(`public${f}`).resize(360, 270, { fit: "cover" }).toBuffer()));
await sharp({ create: { width: 360*4, height: 270*3, channels: 3, background: "#111" } })
  .composite(tiles.map((b, i) => ({ input: b, left: (i%4)*360, top: Math.floor(i/4)*270 })))
  .jpeg({ quality: 80 }).toFile(".shots/wall.jpg");
console.log("ok");
