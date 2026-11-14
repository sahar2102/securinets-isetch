# Admin guide

`/admin` is the no-code control room. Everything is written to the database
(or `.data/store.json` in local mode) and merged over the JSON seed.

## Access

| | |
| --- | --- |
| URL | `/admin` |
| Seed account | `securinetsisetch26@gmail.com` / `ChangeMe!2026` |
| Change credentials | `ADMIN_EMAIL` / `ADMIN_PASSWORD` before the first boot, or update the row in `users` and re-hash with bcrypt |
| Protection | `app/admin/layout.tsx` redirects non-admins; every server action calls `requireAdmin()` |

To promote an existing account, run:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

(Local file store: edit `role` in `.data/store.json` and restart.)

## Sections

### Overview
Counters (members, challenges, solves, applications) and the five newest
membership applications.

### Challenges
- **New challenge**: title, slug, category, difficulty, points, author, date,
  Markdown description, tags, up to five hints with costs, flag, featured,
  hidden.
- **Edit**: same form. Leave the flag blank to keep the current hash.
- **Delete**: writes a tombstone (`content.deleted = true`) so the seeded JSON
  file is untouched and the challenge disappears from the site.

Flag storage: `salt` + `flagHash` (SHA-256 of `salt:flag`). Hashes are never
sent to the browser — the admin list only shows “flag set”.

### Events
Title, kind (workshop / ctf / talk / meetup), status (upcoming / past), date,
time, location, level, language, speakers, summary, capacity, registered count,
registration open. Past events accept a gallery through the JSON seed (the
admin form focuses on the essentials).

### Members
Name, role (+ French variant), team, bio, initials, accent colour, LinkedIn,
GitHub. Photos can be added in `data/team.json` with `"photo": "/team/x.jpg"`.

### Announcements
Short notices (`tag`, `title`, `body`, `date`). The newest one appears in the
home page notice bar under the hero.

### Applications
Read-only list of the membership form: name, email, year, field, interests,
motivation. Click the email to reply. Export with:

```sql
COPY (SELECT * FROM registrations ORDER BY created_at DESC) TO '/tmp/applications.csv' CSV HEADER;
```

## Operational notes

- **Nothing needs a redeploy.** Server actions call `revalidatePath()` for the
  affected routes.
- **Seeded vs override**: overrides win field by field; unknown fields are
  kept. Deleting a record that only exists in the database removes it.
- **Local mode caveat**: `.data/store.json` is per-machine and not durable on
  serverless. Use `DATABASE_URL` in production.
- **Team access**: there is no separate editor role; `role` is `member` or
  `admin`. Add a role check in `requireAdmin()` if you need editors.
