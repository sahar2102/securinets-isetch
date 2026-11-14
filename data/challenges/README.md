# Challenge authoring

One file per category (`web.json`, `crypto.json`, …). Each file is an object
with a `challenges` array. The site reads every `*.json` in this folder and
merges anything saved from the admin panel on top.

## Add a challenge without touching code

1. Sign in as an admin → `/admin` → **Challenges** → **New challenge**.
2. Fill the form. The flag you type is salted and SHA-256 hashed before it is
   stored; the plaintext is never returned to any browser.
3. Save. The public hub updates on the next request (revalidated immediately).

## Add a challenge in the repository

```json
{
  "id": "web-06",
  "slug": "my-new-challenge",
  "title": "My New Challenge",
  "category": "web",
  "difficulty": "beginner",
  "points": 75,
  "solves": 0,
  "author": "Your Name",
  "tags": ["http", "headers"],
  "date": "2026-11-15",
  "featured": false,
  "description": "Markdown supported: **bold**, `code`, lists, fenced blocks.",
  "files": [{ "name": "capture.pcap", "href": "/challenges/my-new-challenge/capture.pcap" }],
  "hints": [{ "text": "Look at the headers.", "cost": 15 }],
  "flag": "SNT{your_flag_here}"
}
```

Then:

```bash
node scripts/hash-flags.mjs   # rewrites "flag" into "salt" + "flagHash"
node scripts/sync-artifact-sizes.mjs
```

Place attachments in `public/challenges/<slug>/`. They are downloadable from
the challenge page. `scripts/sync-artifact-sizes.mjs` fails loudly if a
referenced file is missing.

## Rules for the sample pack

- Difficulty → points: beginner 50–100, intermediate 150–250, advanced 300–400,
  expert 500+.
- Keep at least 40% beginner-friendly.
- Everything must be self-contained and safe: no live targets, no real people,
  no credentials.
- Flags follow `SNT{...}` with leetspeak, lower-case, underscores.

> The 49 seeded challenges are a starter pack. Replace their flags before a
> real competition — see `docs/ADD_CHALLENGE.md`.
