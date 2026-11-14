# Add a challenge

Two paths: the admin panel (no code) or the repository (versioned).

## A. From the admin panel — no code

1. Sign in with an admin account, open **`/admin` → Challenges**.
2. **New challenge**. Fill:

   | Field | Notes |
   | --- | --- |
   | Title / slug | Slug is generated from the title, lowercase-hyphens |
   | Category | web, crypto, forensics, reverse, pwn, osint, stego, network, linux, misc |
   | Difficulty | beginner / intermediate / advanced / expert |
   | Points | beginner 50–100, intermediate 150–250, advanced 300–400, expert 500+ |
   | Description | Markdown: headings, lists, `inline code`, fenced blocks, links |
   | Hints | text + cost in points; each is unlocked separately |
   | Flag | `SNT{...}` — salted and SHA-256 hashed before storage |
   | Featured / Hidden | Featured appears on the home page; Hidden is invisible publicly |

3. **Save challenge**. It is live on `/challenges` immediately (the page is
   revalidated by the server action).

Deleting a seeded challenge from the panel writes a tombstone; the JSON file
stays untouched.

## B. From the repository — when you want it in Git

1. Pick the category file, e.g. `data/challenges/web.json`.
2. Append:

```json
{
  "id": "web-06",
  "slug": "header-hunter",
  "title": "Header Hunter",
  "category": "web",
  "difficulty": "beginner",
  "points": 75,
  "solves": 0,
  "author": "Your Name",
  "tags": ["http", "headers"],
  "date": "2026-11-15",
  "featured": false,
  "description": "The flag is in a response header you were never meant to read.",
  "files": [{ "name": "response.http", "href": "/challenges/header-hunter/response.http" }],
  "hints": [{ "text": "curl -I is enough.", "cost": 15 }],
  "flag": "SNT{h34d3rs_t4lk}"
}
```

3. Put attachments in `public/challenges/header-hunter/`.
4. Hash the flag and sync sizes:

```bash
node scripts/hash-flags.mjs
node scripts/sync-artifact-sizes.mjs
```

5. `npm run build` to confirm, commit.

### Field reference

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | stable internal id |
| `slug` | yes | URL segment, unique, `[a-z0-9-]` |
| `category` | yes | one of the ten category slugs |
| `difficulty` | yes | drives the badge colour and expected points |
| `points` | yes | scaled 1x for display; hints subtract |
| `solves` | yes | display counter (the real count comes from solves) |
| `author` | yes | shown on the card and detail page |
| `date` | yes | ISO date, used for “newest” sort and sitemap |
| `description` | yes | Markdown subset (see `components/markdown.tsx`) |
| `files` | no | `{ name, href, size? }`, `href` inside `public/` |
| `hints` | no | `{ text, cost }`, max 5 in the admin form |
| `flag` | once | plaintext only locally; converted to `salt` + `flagHash` |
| `featured` | no | home page highlight |
| `hidden` | no | excluded from public loaders |

### Writing good starter challenges

- State the goal in the first two sentences, then the constraints.
- Give the artefact and say it is safe/local.
- Hint 1 should be a nudge (tool or concept), hint 2 a concrete step.
- No real domains, no real people, no credentials, nothing that touches a
  third-party system. All sample artefacts in this repo are synthetic.

### Changing a flag later

- Admin panel: open the challenge, type a new flag, save (blank keeps the old
  hash).
- JSON: add `"flag": "SNT{new}"`, delete `"flagHash"` and `"salt"`, then run
  `node scripts/hash-flags.mjs`. Existing solves are preserved; only future
  submissions are checked against the new hash.
