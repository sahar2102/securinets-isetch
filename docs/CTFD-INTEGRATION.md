# Option B — self-hosted CTFd

The built-in module (option A) is the default. If you would rather run a
battle-tested competition platform — team mode, dynamic scoring, a proper score
graph, plugins — host **CTFd** and link the site to it. Both can coexist: the
club site keeps the marketing pages, learning hub and certificates, while CTFd
owns the live competition.

## 1. Run CTFd

```yaml
# docker-compose.yml
services:
  ctfd:
    image: ctfd/ctfd:latest
    restart: always
    ports:
      - "8000:8000"
    environment:
      - UPLOAD_PROVIDER=filesystem
      - SECRET_KEY=change-me
      - DATABASE_URL=mysql+pymysql://ctfd:ctfd@db/ctfd
    volumes:
      - ctfd-uploads:/var/uploads
    depends_on:
      - db

  db:
    image: mariadb:10.11
    restart: always
    environment:
      - MARIADB_ROOT_PASSWORD=change-me
      - MARIADB_DATABASE=ctfd
      - MARIADB_USER=ctfd
      - MARIADB_PASSWORD=ctfd
    volumes:
      - ctfd-db:/var/lib/mysql

volumes:
  ctfd-uploads:
  ctfd-db:
```

```bash
docker compose up -d
# open http://localhost:8000 → setup wizard → create the admin account
```

Production checklist: HTTPS reverse proxy, `SECRET_KEY` random and stored
outside the repo, database backups, `REVERSE_PROXY=true`, registration
verification, and a private instance until the challenge set is final.

## 2. Link the site to CTFd

```bash
# .env.local
NEXT_PUBLIC_CTFD_URL="https://ctf.securinets-isetch.tn"
```

Then surface the link where it matters:

- `components/sections/home.tsx` — add a `btn-primary` next to “Join the club”:
  `href={process.env.NEXT_PUBLIC_CTFD_URL}`.
- `components/challenges/explorer.tsx` — banner above the grid:
  “Season competition runs on CTFd →”.
- `components/layout/footer.tsx` — add it to the **Explore** column.

`NEXT_PUBLIC_*` is inlined at build time; rebuild after changing it.

## 3. Import the sample pack into CTFd

CTFd accepts a standard challenge export. Convert the JSON seed into one:

```bash
node -e '
const fs=require("fs");
const dir="data/challenges";
const out={};
for (const f of fs.readdirSync(dir).filter(f=>f.endsWith(".json")&&!f.startsWith("_"))) {
  for (const c of JSON.parse(fs.readFileSync(`${dir}/${f}`)).challenges) {
    out[`${c.category}/${c.slug}`]={
      name:c.title, category:c.category, description:c.description,
      value:c.points, type:"standard", state:"visible",
      attribution:c.author, tags:c.tags,
      hints:c.hints?.map(h=>({content:h.text, cost:h.cost})) ?? [],
      flags:[{type:"static", content:"CHANGE_ME"}]
    };
  }
}
fs.writeFileSync("ctfd-import.json", JSON.stringify(out,null,2));
console.log(Object.keys(out).length+" challenges exported");
'
```

CTFd's import does not read flags from this format — set the real flags in the
CTFd UI (or via its API). **Do not** reuse the hashed sample flags from this
repo as competition flags.

Attachments: CTFd expects `files[]`; upload
`public/challenges/<slug>/*` from the challenge editor.

## 4. Scoring and identity

- Keep one identity system. Either let CTFd own accounts (simplest) and treat
  the club login as “site account only”, or bridge with OAuth.
- The site leaderboard reads from its own database. To show CTFd's standings,
  proxy the API and normalise the rows:

```ts
// app/api/leaderboard/route.ts (sketch)
if (process.env.NEXT_PUBLIC_CTFD_URL) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_CTFD_URL}/api/v1/scoreboard`, {
    headers: { Authorization: `Token ${process.env.CTFD_API_KEY}` },
    next: { revalidate: 60 },
  });
  const data = await res.json();
  const rows = data.data.map((row: any, i: number) => ({
    rank: i + 1,
    userId: String(row.account_id),
    name: row.name,
    score: row.score,
    solves: row.solves ?? 0,
    lastSolve: null,
  }));
  return NextResponse.json({ range: "all", rows });
}
```

Keep the API key server-side only.

## 5. Which option should you pick?

| | Built-in (A) | CTFd (B) |
| --- | --- | --- |
| Setup | zero, ships with the site | Docker + database |
| Accounts | same login as the site | separate |
| Dynamic scoring | fixed | yes (plugins) |
| Team mode | no | yes |
| Branding | fully integrated | themeable but separate |
| Maintenance | Next.js only | extra service to patch |
| Best for | year-round practice | a timed competition |

A common setup: built-in hub for practice all semester, CTFd for the 24-hour
internal CTF, one link between the two.
