#!/usr/bin/env python3
"""Generate the self-contained sample artefacts served under public/challenges.

Everything here is synthetic and safe: no live targets, no real people, no real
credentials. Run from the project root:  python3 scripts/samples/gen_assets.py
"""
import base64
import binascii
import hashlib
import io
import json
import os
import random
import struct
import wave
import zipfile
import zlib

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "public", "challenges")
random.seed(2026)


def w(slug, name, data, mode="w"):
    d = os.path.join(OUT, slug)
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, name)
    if isinstance(data, str):
        data = data.encode()
    with open(p, "wb") as f:
        f.write(data)
    print(f"  {slug}/{name}  ({len(data)} B)")


# --------------------------------------------------------------------------
# tiny PNG writer (no third-party deps)
# --------------------------------------------------------------------------
def png(width, height, rows, bit_depth=8, color_type=2):
    """rows: list of bytes objects, already filtered (filter byte + data)."""
    raw = b"".join(rows)

    def chunk(tag, payload):
        return (
            struct.pack(">I", len(payload))
            + tag
            + payload
            + struct.pack(">I", zlib.crc32(tag + payload) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", width, height, bit_depth, color_type, 0, 0, 0)
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


def gradient_png(width, height, fn):
    rows = []
    for y in range(height):
        row = bytearray([0])
        for x in range(width):
            r, g, b = fn(x, y)
            row += bytes((r, g, b))
        rows.append(bytes(row))
    return png(width, height, rows)


# --------------------------------------------------------------------------
# WEB
# --------------------------------------------------------------------------
def gen_web():
    print("web/")
    w(
        "web-01",
        "robots.txt",
        """# staging mirror - internal use only
User-agent: *
Disallow: /admin
Disallow: /backup
Disallow: /dev-notes-2026
Disallow: /api/internal

# keep crawlers away from the preprod vault
User-agent: Googlebot
Disallow: /
""",
    )
    w(
        "web-03",
        "session.txt",
        "# Captured from the dashboard after logging in as a student\n"
        "# Cookie header sent to /dashboard\n"
        "session=eyJ1c2VyIjoic3R1ZGVudCIsInJvbGUiOiJ1c2VyIn0=\n\n"
        "# Decoded structure (for reference):\n"
        '# {"user":"student","role":"user"}\n'
        "# The server signs nothing. It only base64-decodes.\n",
    )
    header = base64.urlsafe_b64encode(
        json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode()
    ).rstrip(b"=")
    payload = base64.urlsafe_b64encode(
        json.dumps(
            {
                "sub": "student-1042",
                "role": "user",
                "iat": 1793491200,
                "exp": 1825027200,
                "iss": "snt-isetch-api",
            },
            separators=(",", ":"),
        ).encode()
    ).rstrip(b"=")
    w(
        "web-05",
        "token.txt",
        "# GET /api/v1/me  ->  Authorization: Bearer <token>\n"
        + (header + b"." + payload + b".ZmFrZS1zaWduYXR1cmU").decode()
        + "\n\n# API contract\n"
        "#   GET /api/v1/me            -> 200, returns your profile\n"
        "#   GET /api/v1/admin/flag    -> 200 only when role == 'admin'\n"
        "#   Verification library: jwt-decode-any v0.4.2 (accepts alg 'none')\n",
    )
    w(
        "web-01",
        "robots.txt",
        open(os.path.join(OUT, "web-01", "robots.txt"), "rb").read(),
    )


# --------------------------------------------------------------------------
# CRYPTO
# --------------------------------------------------------------------------
def rot13(s):
    out = []
    for c in s:
        if "a" <= c <= "z":
            out.append(chr((ord(c) - 97 + 13) % 26 + 97))
        elif "A" <= c <= "Z":
            out.append(chr((ord(c) - 65 + 13) % 26 + 65))
        else:
            out.append(c)
    return "".join(out)


def gen_crypto():
    print("crypto/")
    flag = "SNT{c4es4r_w0uld_b3_pr0ud}"
    w(
        "crypto-01",
        "cipher.txt",
        "Professor's note, found on the whiteboard:\n\n"
        + rot13(flag)
        + "\n\nPS: the shift is older than the university.\n",
    )

    inner = base64.b32encode(flag.encode()).decode()
    middle = binascii.hexlify(inner.encode()).decode()
    outer = base64.b64encode(middle.encode()).decode()
    w(
        "crypto-02",
        "layers.txt",
        "# Layer 1 (base64) -> Layer 2 (hex) -> Layer 3 (base32)\n"
        "# Peel in that order. Do not trust the order of the comment.\n\n" + outer + "\n",
    )

    key = 0x5A
    flag3 = "SNT{x0r_1s_r3v3r51bl3}"
    ct = bytes(c ^ key for c in flag3.encode())
    w(
        "crypto-03",
        "ciphertext.hex",
        "# single-byte XOR, hex encoded\n# the plaintext starts with SNT{\n"
        + ct.hex()
        + "\n",
    )

    # CTR keystream reuse
    ks = bytes(random.randrange(256) for _ in range(256))
    header = b"CLUBBACKUP/1.0\nfile="
    p1 = header + b"members_2026.csv\n" + b"A" * 340 + b"\nEND\n"
    p2 = header + b"treasury_q4.csv\n" + b"B" * 280 + b"\nEND\n"
    w("crypto-04", "file_a.enc", bytes(c ^ k for c, k in zip(p1, ks)))
    w("crypto-04", "file_b.enc", bytes(c ^ k for c, k in zip(p2, ks)))

    # RSA toy key + small-e ciphertext
    flag5 = "SNT{sm4ll_3_5m4ll_m3ss4g3}"
    e = 3
    p, q = 1000000007, 1000000009
    n = p * q
    m = int.from_bytes(flag5.encode(), "big")
    c = pow(m, e, n)
    w(
        "crypto-05",
        "public-key.txt",
        "# RSA licence server — public parameters (toy key, 60-bit modulus)\n"
        f"n = {n}\n"
        f"e = {e}\n\n"
        f"# ciphertext for one licence blob, decimal\nc = {c}\n\n"
        "# The blob is ASCII and shorter than 32 bytes. No padding was used.\n",
    )
    w(
        "crypto-06",
        "oracle-notes.md",
        "# Padding oracle — analyst notes\n\n"
        "The cookie is `AES-256-CBC`, 16-byte blocks, PKCS#7 padding.\n"
        "The endpoint answers with three distinguishable errors:\n\n"
        "| Response | Meaning |\n| --- | --- |\n"
        "| 500 + `bad padding` | padding invalid |\n"
        "| 403 + `bad mac` | padding valid, MAC wrong |\n"
        "| 200 | both valid |\n\n"
        "Because the MAC is checked *after* decryption, the difference between\n"
        "the first two responses is an oracle.\n\n"
        "Block layout: `IV | C1 | C2 | C3`, plaintext is `JSON` with a `role` field.\n"
        "You may request up to 5,000 decryptions; budget accordingly.\n",
    )


# --------------------------------------------------------------------------
# FORENSICS
# --------------------------------------------------------------------------
def gen_forensics():
    print("forensics/")
    w(
        "forensics-01",
        "attendance-exif.txt",
        """$ exiftool attendance.jpg
ExifTool Version Number         : 12.76
File Name                       : attendance.jpg
File Size                       : 486 kB
MIME Type                       : image/jpeg
Image Width                     : 4032
Image Height                    : 3024
Make                            : samsung
Camera Model Name               : SM-A536B
Date/Time Original              : 2026:10:02 18:41:07
GPS Latitude Ref                : N
GPS Latitude                    : 36 deg 50' 24.61"
GPS Longitude Ref               : E
GPS Longitude                   : 10 deg 16' 12.08"
GPS Altitude                    : 12.4 m Above Sea Level
User Comment                    : SNT{3x1f_n3v3r_l13s}
Software                        : S26-Exif-Proof
""",
    )

    img = bytearray(b"\x00" * (256 * 1024))
    img[0:11] = b"FAKE-FAT32\x00"
    img[512:512 + 64] = b"boot sector - synthetic lab image, not a real disk\x00"
    marker = b"\n\n----- BEGIN RECOVERED -----\nSNT{un4ll0c4t3d_sp4c3_sp34ks}\n----- END RECOVERED -----\n"
    pos = 140 * 1024
    img[pos:pos + len(marker)] = marker
    w("forensics-02", "laptop.img", bytes(img))

    # corrupted zip with a text flag
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("readme.txt", "Nothing to see here. Move along.\n")
        z.writestr(
            "evidence/flag.txt",
            "Recovered from the archive after repairing the header.\nSNT{ffd8_1s_n0t_4_z1p}\n",
        )
    data = bytearray(buf.getvalue())
    data[0:4] = b"\x89PNG"
    w("forensics-03", "evidence.zip", bytes(data))

    # memory image with a fake process list
    mem = bytearray(os.urandom(384 * 1024))
    strings = [
        "windows.pslist output (synthetic)",
        "System            4",
        "smss.exe          412",
        "csrss.exe         528",
        "explorer.exe      3120",
        "chrome.exe        4412",
        "svchost.exe       1188",
        "updater.exe       8876   ppid=3120  no signature",
        "  cmdline: C:\\Users\\lab\\AppData\\Roaming\\updater.exe --quiet",
        "  injected region: 0x7ff6a0000000 (RWX)",
        "  operator typed: SNT{pr0c355_l1st_d0nt_l13}",
        "  connection: 10.0.4.12:443 -> 203.0.113.77:8443",
    ]
    blob = ("\x00".join(strings)).encode()
    mem[64 * 1024:64 * 1024 + len(blob)] = blob
    w("forensics-04", "workstation.raw", bytes(mem))

    # logs for timeline
    access = []
    for i in range(240):
        sec = i * 7
        access.append(
            f"10.0.4.{20 + i % 3} - - [13/Nov/2026:08:{sec // 60 % 60:02d}:{sec % 60:02d} +0000] "
            f'"GET /portal/item?id={1000 + i} HTTP/1.1" {200 if i % 11 else 403} {512 + i} "-" "Mozilla/5.0"'
        )
    access.append(
        '10.0.4.31 - - [13/Nov/2026:09:14:22 +0000] "POST /portal/upload HTTP/1.1" 201 88 "-" "curl/8.5.0"'
    )
    access.append(
        '10.0.4.31 - - [13/Nov/2026:09:14:27 +0000] "GET /portal/admin HTTP/1.1" 200 4412 "-" "curl/8.5.0"'
    )
    w("forensics-05", "access.log", "\n".join(access) + "\n")
    fw = ["ts_src_local,src,dst,port,action"]
    for i in range(60):
        fw.append(f"2026-11-13 10:{i:02d}:05,10.0.4.{20 + i % 3},10.0.4.20,445,ALLOW")
    fw.append("2026-11-13 10:14:22,10.0.8.44,10.0.4.31,445,ALLOW")
    w("forensics-05", "firewall.csv", "\n".join(fw) + "\n")
    vpn = ["2026-11-13T08:55:01Z auth ok user=guest.lab ip=10.0.8.44", "2026-11-13T09:01:44Z auth ok user=a.benali ip=10.0.8.51"]
    w("forensics-05", "vpn.log", "\n".join(vpn) + "\n")

    # packed-ish sample with single-byte XOR config
    flag = b"SNT{th3_n0t3_w4s_th3_clu3}"
    cfg = b"\x00\x01CFG\x00" + bytes(c ^ 0x37 for c in flag) + b"\x00\x00END"
    sample = bytearray(os.urandom(96 * 1024))
    sample[0x400:0x404] = b"\x7fELF"
    sample[0x9000:0x9000 + len(cfg)] = cfg
    sample[0x9100:0x9120] = b"XOR_LOOP_KEY_FROM_RESOURCE\x00\x00"
    w("forensics-06", "sample.bin", bytes(sample))


# --------------------------------------------------------------------------
# OSINT
# --------------------------------------------------------------------------
def gen_osint():
    print("osint/")

    def z(name, files):
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zz:
            for n, c in files.items():
                zz.writestr(n, c)
        w(name[0], name[1], buf.getvalue())

    z(
        ("osint-01", "snapshots.zip"),
        {
            "profile-1-forum.html": "<html><title>0xghost</title><p>handle: 0xghost · posts: 412 · joined 2023</p><p>bio: linux, ctf, espresso</p></html>",
            "profile-2-photo.html": "<html><title>0xghost / shots</title><p>handle: 0xghost · 88 photos</p><p>bio: capturing Tunis one rooftop at a time</p></html>",
            "profile-3-dev.html": "<html><title>0xghost — dev</title><p>handle: 0xghost · repos: 12</p><p>bio: building small tools. old account: 0xghost_old</p></html>",
            "profile-4-old.html": "<html><title>0xghost_old</title><p>handle: 0xghost_old · last active 2021</p><!-- TODO remove: SNT{s4m3_h4ndl3_3v3rywh3r3} --></html>",
        },
    )
    w(
        "osint-02",
        "evidence.md",
        """# Photo evidence sheet — “Where in Tunis?”

Capture time: 2026-09-14 16:12 local (UTC+1)
Camera facing: north-east (shadow of the awning falls to the left of frame)
Language on signage: French + Arabic
Visible details:

1. A café terrace with blue metal chairs and a hand-painted sign reading
   “CAFÉ DES DÉLICES — depuis 1974”.
2. Opposite: a pharmacy with a green cross and the name “Pharmacie El Manar”.
3. A street sign, partially readable: “Rue ...  ...” with a one-way arrow.
4. In the background, a white minaret and a yellow taxi with a roof sign.
5. A bank branch with a red logo and the word “amen” visible on the ATM.

Notes from the submitter:
- The café appears in exactly one municipality on the partner club's map.
- The pharmacy opposite is the only one with that name in the governorate.
- Coordinates are not required; the café name is the answer.
""",
    )
    z(
        ("osint-03", "archive-snapshots.zip"),
        {
            "2024/sitemap.xml": "<urlset><url><loc>/</loc></url><url><loc>/about</loc></url></urlset>",
            "2025/sitemap.xml": "<urlset><url><loc>/</loc></url><url><loc>/about</loc></url><url><loc>/partners</loc></url><url><loc>/press/rebrand-2025</loc></url></urlset>",
            "2026/sitemap.xml": "<urlset><url><loc>/</loc></url><url><loc>/about</loc></url><url><loc>/partners</loc></url></urlset>",
            "2025/rss.xml": "<rss><channel><item><title>Rebrand 2025</title><link>/press/rebrand-2025</link></item></channel></rss>",
            "2025/press-rebrand-2025.html": "<html><title>Rebrand 2025</title><body><h1>Our new identity</h1><!-- staging note: SNT{th3_p4st_1s_publ1c} --></body></html>",
            "README.txt": "Three snapshots of the same domain. The 2026 crawl no longer lists one page.",
        },
    )
    z(
        ("osint-04", "personas.zip"),
        {
            "forum/profile.html": "<html><title>k.mansouri</title><p>signature: Tunis · UTC+1 · espresso and tcpdump</p><img src='avatar.png'></html>",
            "freelance/profile.html": "<html><title>K. Mansouri — backend & automation</title><p>available 18:00–23:00 CET</p><p>github: kmsnt-labs</p></html>",
            "github/README.md": "# kmsnt-labs\nsmall utilities for log parsing\n\n## history\n- 2024-02-11 init\n- 2024-03-02 add parser\n",
            "hashes.txt": "avatar.png md5: 9f2c1e7a44b0d3c8e5f6a1b2c3d4e5f6 (same file on forum + freelance)",
            "README.txt": "Synthetic personas. Avatar reuse is the first pivot; the repo commit history is the last.",
        },
    )


# --------------------------------------------------------------------------
# STEGO
# --------------------------------------------------------------------------
def gen_stego():
    print("stego/")
    flag = "SNT{sp4c3s_sp34k}"
    bits = "".join(f"{b:08b}" for b in flag.encode())
    hidden = "".join("\u200b" if b == "0" else "\u200c" for b in bits)
    w(
        "stego-01",
        "message.txt",
        "This file looks empty. It is not.\n\n"
        + hidden[: len(hidden) // 2]
        + "normal looking words in the middle"
        + hidden[len(hidden) // 2 :]
        + "\n",
    )

    # LSB poster: 512x512, first row carries the flag in the red channel LSB
    flag2 = "SNT{l34st_s1gn1f1c4nt_b1t}"
    bits2 = "".join(f"{b:08b}" for b in flag2.encode())

    def px(x, y):
        base = ((x * 255) // 512, (y * 255) // 512, 90)
        if y == 0 and x < len(bits2):
            r = (base[0] & 0xFE) | int(bits2[x])
            return (r, base[1], base[2])
        return base

    w("stego-02", "poster.png", gradient_png(512, 512, px))

    # Morse audio
    flag3 = "SNT{s0und_1n_th3_n01s3}"
    morse_map = {
        "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.",
        "G": "--.", "H": "....", "I": "..", "J": ".---", "K": "-.-", "L": ".-..",
        "M": "--", "N": "-.", "O": "---", "P": ".--.", "Q": "--.-", "R": ".-.",
        "S": "...", "T": "-", "U": "..-", "V": "...-", "W": ".--", "X": "-..-",
        "Y": "-.--", "Z": "--..", "0": "-----", "1": ".----", "2": "..---",
        "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...",
        "8": "---..", "9": "----.", "{": "-.--.", "}": "-.--.-", "_": "..--.-",
    }
    rate = 8000
    unit = 0.09

    def tone(freq, dur, amp=9000):
        n = int(rate * dur)
        return [
            int(amp * (1 if (i // 40) % 2 == 0 else 0.6) * (1 if i < n - 80 else 0))
            for i in range(n)
        ]

    samples = []
    for ch in flag3:
        code = morse_map.get(ch.upper(), "")
        for sym in code:
            samples += tone(880 if sym == "-" else 660, unit * (3 if sym == "-" else 1))
            samples += [0] * int(rate * unit)
        samples += [0] * int(rate * unit * 2)
    os.makedirs(os.path.join(OUT, "stego-03"), exist_ok=True)
    with wave.open(os.path.join(OUT, "stego-03", "transmission.wav"), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(rate)
        wf.writeframes(b"".join(struct.pack("<h", max(-32000, min(32000, s))) for s in samples))

    # polyglot PNG + ZIP
    banner = gradient_png(640, 360, lambda x, y: (20 + x // 6, 8 + y // 3, 24 + (x + y) // 8))
    zbuf = io.BytesIO()
    with zipfile.ZipFile(zbuf, "w", zipfile.ZIP_STORED) as z:
        z.writestr("hidden/flag.txt", "SNT{tw0_f1l3s_0n3_sh3ll}\n")
        z.writestr("hidden/note.txt", "Appended after IEND. Still a valid PNG.\n")
    w("stego-04", "banner.png", banner + zbuf.getvalue())

    # custom bit-plane encoding
    flag5 = b"SNT{p1x3l_p3rf3ct_p4yl04d}"
    bits5 = "".join(f"{b:08b}" for b in flag5)
    W = H = 512
    payload = bits5 + "0" * (W * H - len(bits5))
    rows = []
    idx = 0
    for y in range(H):
        row = bytearray([0])
        for x in range(W):
            r = random.randrange(256)
            g = random.randrange(256)
            b = random.randrange(256)
            if idx < len(bits5):
                bit = int(bits5[idx])
                if bit:
                    r |= 1
                else:
                    r &= 0xFE
                idx += 1
            row += bytes((r, g, b))
        rows.append(bytes(row))
    w("stego-05", "noise.png", png(W, H, rows))
    w(
        "stego-05",
        "encoder.py",
        '''#!/usr/bin/env python3
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
''',
    )


# --------------------------------------------------------------------------
# LINUX / MISC
# --------------------------------------------------------------------------
def gen_linux_misc():
    print("linux/, misc/")
    w(
        "linux-01",
        "lab-listing.txt",
        """$ id
uid=1002(student) gid=1002(student) groups=1002(student),1043(backup)

$ ls -la /srv/backup/
drwxr-x--- 2 root backup 4096 Nov 12 21:04 .
drwxr-xr-x 6 root root   4096 Oct 30 11:22 ..
-rw-r----- 1 root backup  124 Nov 12 21:03 flag.txt
-rw-r----- 1 root backup  922 Nov 01 09:12 db-2026-10.sql.gz

$ cat /srv/backup/flag.txt
cat: /srv/backup/flag.txt: Permission denied

$ getfacl /srv/backup/flag.txt
# file: srv/backup/flag.txt
# owner: root
# group: backup
user::rw-
user:student:r--
group::r--
mask::r--
other::---
""",
    )

    long_flag = "SNT{p1p3_dr34ms_4r3_m4d3_0f_th15}"
    lines = []
    for i in range(20000):
        if i == 12044:
            lines.append(f'2026-11-12T09:14:02Z req=8f3a2c INFO fragment=1 data="{long_flag[:12]}"')
        elif i == 14871:
            lines.append(f'2026-11-12T09:14:02Z req=8f3a2c WARN fragment=2 data="{long_flag[12:26]}"')
        elif i == 19020:
            lines.append(f'2026-11-12T09:14:02Z req=8f3a2c DEBUG fragment=3 data="{long_flag[26:]}"')
        else:
            lines.append(
                f"2026-11-12T{8 + i // 3600:02d}:{(i // 60) % 60:02d}:{i % 60:02d}Z "
                f'req={hashlib.md5(str(i).encode()).hexdigest()[:6]} INFO item={i} status=ok'
            )
    w("linux-02", "app.log", "\n".join(lines) + "\n")

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("etc/crontab", "SHELL=/bin/sh\nPATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin\n* * * * * root /opt/cleanup/clean.sh\n")
        z.writestr("opt/cleanup/clean.sh", "#!/bin/sh\n# cleanup temp files\nfind /tmp -name '*.tmp' -delete\n")
        z.writestr("opt/cleanup/clean.sh.bak", "#!/bin/sh\n# DEBUG: FLAG=SNT{cr0n_t4bs_4r3_w0rld_r34d4bl3}\nfind /tmp -name '*.tmp' -delete\n")
        z.writestr("listing.txt", "drwxrwxrwx 2 root root 4096 Nov 12 22:00 /opt/cleanup\n-rwxr-xr-x 1 root root  112 Nov 12 22:00 clean.sh\n-rw-r--r-- 1 root root  140 Nov 12 22:00 clean.sh.bak\n")
    w("linux-03", "cron-evidence.zip", buf.getvalue())

    w(
        "linux-04",
        "transcript.txt",
        """student@lab:~$ find / -perm -4000 -type f 2>/dev/null
/usr/bin/passwd
/usr/bin/su
/usr/bin/mount
/usr/bin/gpasswd
/usr/local/bin/backup-reader
/usr/bin/find
student@lab:~$ ls -l /usr/local/bin/backup-reader
-rwsr-xr-x 1 root root 14728 Nov 10 18:02 /usr/local/bin/backup-reader
student@lab:~$ /usr/local/bin/backup-reader --help
usage: backup-reader [FILE]   (runs with euid=0)
student@lab:~$ ls -l /root
ls: cannot open directory '/root': Permission denied
student@lab:~$ /usr/local/bin/backup-reader /root/flag.txt
SNT{f1nd_p3rm_4000}
""",
    )

    w(
        "linux-05",
        "Dockerfile",
        """FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y cron tar && rm -rf /var/lib/apt/lists/*
RUN useradd -m web && mkdir -p /var/www/site /backup && chown -R web:web /var/www/site
COPY backup.sh /opt/backup.sh
COPY cron /etc/cron.d/backup
RUN chmod 0644 /etc/cron.d/backup && echo 'FLAG=SNT{gl0bb1ng_1s_d4ng3r0u5}' > /root/flag.txt
RUN chmod 0600 /root/flag.txt
USER web
WORKDIR /var/www/site
CMD ["cron", "-f"]
""",
    )
    w("linux-05", "backup.sh", "#!/bin/sh\ncd /var/www/site || exit 1\ntar -czf /backup/site.tgz *\n")

    w(
        "misc-01",
        "matryoshka.txt",
        binascii.hexlify(
            base64.b64encode(
                base64.b32encode(b"SNT{0n3_l4y3r_4t_4_t1m3}").decode().encode()
            )
        ).decode()
        + "\n\n# layer order: hex -> base64 -> base32 -> plaintext\n",
    )
    w(
        "misc-02",
        "golf.py",
        """f=lambda s:len(s)==26and all(ord(c)^ord(s[i-1])==k[i]for i,c in enumerate(s) if i)
k=[64,58,45,73,32,50,45,37,60,84,80,36,87,33,36,63,62,82,11,58,9,44,73,21,4]
print(f(input()))
""",
    )
    # make golf.py consistent with the real flag: derive k from the flag itself
    real = "SNT{r3v3r53_th3_0p3r4t0r}"
    ks = [ord(c) ^ ord(real[i - 1]) for i, c in enumerate(real) if i]
    w(
        "misc-02",
        "golf.py",
        "f=lambda s:len(s)==%d and all(ord(c)^ord(s[i-1])==k[i]for i,c in enumerate(s) if i)\n"
        "k=%s\nprint(f(input()))\n" % (len(real), [0] + ks),
    )

    rows = []
    for i in range(4000):
        ip = f"10.0.{i % 4}.{i % 250}"
        status = [200, 204, 302, 401, 403, 500][i % 6]
        ua = ["curl/8.5.0", "Mozilla/5.0", "python-requests/2.32"][i % 3]
        tok = "SNT{r3g3x_1s_a_sup3rp0w3r}" if i == 2711 else f"tok_{i}"
        rows.append(
            f'{ip} - - [12/Nov/2026:1{i % 10}:{i % 60:02d}:{i % 60:02d} +0100] "POST /api/v1/session HTTP/1.1" {status} {300 + i % 900} "-" "{ua}" token={tok}'
        )
    w("misc-03", "haystack.log", "\n".join(rows) + "\n")
    w(
        "misc-03",
        "rules.md",
        """# Six conditions — exactly one line matches all of them

1. Source IP inside `10.0.0.0/8`
2. Source IP **not** inside `10.0.1.0/24`
3. Status is neither `200` nor `204`
4. User-Agent is `curl/8.5.0`
5. Request path is exactly `/api/v1/session`
6. A `token=` parameter is present

The matching line's token is the flag.
""",
    )
    h = hashlib.sha256(b"SNT{shadow}").hexdigest()
    w("misc-04", "hash.txt", f"algorithm: sha256\nformat: SHA256('SNT{' + word + '}')\ndigest: {h}\nword: six lowercase letters (a-z)\n")

    bf = ""
    for ch in "SNT{br41nf_4nd_b3y0nd}":
        bf += "+" * ord(ch) + "."
    w("misc-05", "detour.bf", bf + "\n")
    w("misc-05", "detour.bf", bf + "\n")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    gen_web()
    gen_crypto()
    gen_forensics()
    gen_osint()
    gen_stego()
    gen_linux_misc()
    print("done")
