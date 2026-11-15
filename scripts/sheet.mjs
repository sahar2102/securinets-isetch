import sharp from "sharp";
const files = Array.from({length:12}, (_,i)=>`public/images/events/gallery/photo-${String(i+1).padStart(2,"0")}.webp`);
const tiles = await Promise.all(files.map(f=>sharp(f).resize(360,270,{fit:"cover"}).toBuffer()));
const sheet = sharp({create:{width:360*4,height:270*3,channels:3,background:"#111"}}).composite(
  tiles.map((b,i)=>({input:b,left:(i%4)*360,top:Math.floor(i/4)*270}))
).jpeg({quality:80});
await sheet.toFile(".shots/contact.jpg");
console.log("ok");
