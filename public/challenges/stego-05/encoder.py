#!/usr/bin/env python3
"""How noise.png was produced. Reverse it to read the flag."""
from PIL import Image

FLAG = open("flag.txt", "rb").read().strip()
BITS = "".join(f"{b:08b}" for b in FLAG)

img = Image.open("source.png").convert("RGB")
px = img.load()
w, h = img.size
key = (w ^ h) & 0xFF          # 512 ^ 512 = 0 for a square image
i = 0
for y in range(h):
    for x in range(w):
        if i >= len(BITS):
            break
        r, g, b = px[x, y]
        r = (r & 0xFE) | int(BITS[i])   # flag lives in red LSB, raster order
        px[x, y] = (r, g, b)
        i += 1
img.save("noise.png")
