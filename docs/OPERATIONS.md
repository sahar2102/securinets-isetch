# Operations — keeping the site up during the CTF

Target: 40–60 members solving at the same time, one admin, zero surprises.

## 1. Uptime monitoring (15 min, free)

Use **Better Stack** (betterstack.com/uptime) or **UptimeRobot**:

| Setting | Value |
| --- | --- |
| URL | `https://your-domain/api/health` |
| Method | GET |
| Interval | 60 s |
| Expected | HTTP 200 and body contains `"status":"ok"` |
| Alert | email + push to the board |

`/api/health` returns **503** when the database is unreachable, so a green
check means "app + Postgres both answered", not just "DNS resolves".

Add a second monitor on `/` to catch a broken deploy that still returns 200
from the API.

## 2. Backups

Supabase → Project Settings → Database → **Backups**: confirm daily backups are
on (Pro) or run the script below on a schedule.

```bash
# .env.local must contain DATABASE_URL
npm run db:backup          # writes backups/backup-YYYY-MM-DD-HHmm.sql.gz
```

Keep at least: one before the event, one after. Test a restore once into a
scratch database — an untested backup is a rumour.

## 3. Database connections (the classic CTF outage)

Vercel runs many short-lived functions. Each opens a connection; Postgres has a
hard limit. **Always use the Supabase pooler string** (port 6543,
`?pgbouncer=true&connection_limit=1`) for `DATABASE_URL` on Vercel. The direct
5432 string is for migrations and `pg_dump` only.

Symptoms if you get this wrong: `too many clients already`, page hangs, then
500s roughly 10 minutes into the event.

## 4. Rate limiting across instances

`lib/rate-limit.ts` is in-memory: correct for a single Node process, per-lambda
on Vercel. For a public event, back it with Upstash Redis:

```bash
npm i @upstash/ratelimit @upstash/redis
```

```ts
// lib/rate-limit.ts (replace the in-memory store)
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv(); // UPSTASH_REDIS_REST_URL / _TOKEN

const limiters = new Map<string, Ratelimit>();
export async function hitAsync(key: string, opts: { limit: number; windowMs: number }) {
  const bucket = `${key}:${opts.windowMs}`;
  if (!limiters.has(bucket)) {
    limiters.set(
      bucket,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(opts.limit, `${Math.round(opts.windowMs / 1000)} s`),
      }),
    );
  }
  const { success, remaining, reset } = await limiters.get(bucket)!.limit(key);
  return { ok: success, remaining, retryAfter: Math.max(0, Math.ceil((reset - Date.now()) / 1000)) };
}
```

Then change the route call sites from `hit(...)` to `await hitAsync(...)`
(eight files: join, newsletter, register, verify, submit, hint, forgot, reset).

Env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (free tier is plenty).

## 5. Error tracking

Sentry free tier: `npx @sentry/wizard@latest -i nextjs`, then set
`SENTRY_DSN`. Without it, a production stack trace only exists in Vercel logs,
which expire.

## 6. Before the CTF — checklist

- [ ] Custom domain live, HTTPS valid
- [ ] `MEMBERS_ONLY=true`, members approved in `/admin → Players`
- [ ] `/api/health` green for 24 h
- [ ] Backup taken after seeding, restore tested once
- [ ] Pooler connection string in Vercel
- [ ] Upstash limiter enabled (if public)
- [ ] Admin password unique, stored in a password manager
- [ ] SMTP configured, test email received
- [ ] Challenges hidden until start (see below)
- [ ] Scoreboard URL shared with members only

## 7. Scheduled release (recommended for the 25 Nov CTF)

Challenges carry a `date` but no start gate. Two options:

1. **Soft**: keep the range members-only (current setup) — access is already
   restricted, which is enough for an internal CTF.
2. **Hard**: add `releaseAt` to each challenge and filter server-side until
   `Date.now() >= releaseAt`. Ask and this gets implemented.

## 8. Incident playbook

| Symptom | First check | Likely fix |
| --- | --- | --- |
| 503 on `/api/health` | Supabase status page | wait / restore backup |
| `too many clients` | connection string | switch to pooler |
| Login fails for everyone | `AUTH_SECRET` changed | redeploy with the stable secret |
| Flags rejected though correct | env `FLAG_*` / data edit | check `flagHash` + `salt` on the challenge |
| Emails not arriving | Gmail app password revoked | regenerate app password |
