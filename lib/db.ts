/**
 * Storage layer.
 *
 * - If `DATABASE_URL` is set, everything goes to PostgreSQL (works with
 *   Supabase, Neon, RDS or a local Postgres — see `db/schema.sql`).
 * - Otherwise a zero-config JSON file store under `.data/` is used so the
 *   project runs out of the box and on preview deployments without a DB.
 *
 * The API is intentionally small: users, solves, hint unlocks, dynamic
 * content overrides, registrations and subscriber emails.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { ContentRow, HintUnlock, Solve, User, ChallengeStart, IntegrityEvent, IntegrityKind } from "./types";

export const hasDatabase = Boolean(process.env.DATABASE_URL);

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

interface FileStore {
  users: User[];
  solves: Solve[];
  hints: HintUnlock[];
  content: ContentRow[];
  registrations: Record<string, unknown>[];
  resets: { userId: string; tokenHash: string; expiresAt: string; used: boolean }[];
  starts: ChallengeStart[];
  events: IntegrityEvent[];
  subscribers: { email: string; createdAt: string }[];
}

const EMPTY: FileStore = {
  users: [],
  solves: [],
  hints: [],
  content: [],
  registrations: [],
  resets: [],
  starts: [],
  events: [],
  subscribers: [],
};

/* -------------------------------------------------------------------------- */
/* Postgres                                                                   */
/* -------------------------------------------------------------------------- */

type PgPool = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
};

const globalForDb = globalThis as unknown as { __sntPool?: PgPool; __sntInit?: Promise<void> };

async function pool(): Promise<PgPool> {
  if (globalForDb.__sntPool) return globalForDb.__sntPool;
  const { Pool } = await import("pg");
  const p = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : undefined,
    max: 5,
  });
  globalForDb.__sntPool = p as unknown as PgPool;
  return globalForDb.__sntPool;
}

const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE TABLE IF NOT EXISTS solves (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_slug TEXT NOT NULL,
  points INTEGER NOT NULL,
  hint_cost INTEGER NOT NULL DEFAULT 0,
  season TEXT NOT NULL,
  solved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, challenge_slug)
);
CREATE TABLE IF NOT EXISTS hint_unlocks (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_slug TEXT NOT NULL,
  hint_index INTEGER NOT NULL,
  cost INTEGER NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, challenge_slug, hint_index)
);
CREATE TABLE IF NOT EXISTS content (
  type TEXT NOT NULL,
  slug TEXT NOT NULL,
  data JSONB NOT NULL,
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (type, slug)
);
CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  year TEXT NOT NULL,
  field TEXT NOT NULL,
  interests JSONB NOT NULL DEFAULT '[]',
  motivation TEXT NOT NULL,
  intent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS solves_challenge_idx ON solves (challenge_slug);
CREATE INDEX IF NOT EXISTS solves_user_idx ON solves (user_id);

CREATE TABLE IF NOT EXISTS password_resets (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_starts (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_slug TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, challenge_slug)
);

CREATE TABLE IF NOT EXISTS integrity_events (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_slug TEXT NOT NULL,
  kind TEXT NOT NULL,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS integrity_events_user_idx ON integrity_events (user_id, challenge_slug);

CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

async function ready() {
  if (!hasDatabase) return;
  if (!globalForDb.__sntInit) {
    globalForDb.__sntInit = (async () => {
      const p = await pool();
      await p.query(DDL);
    })();
  }
  return globalForDb.__sntInit;
}

/* -------------------------------------------------------------------------- */
/* File store helpers                                                         */
/* -------------------------------------------------------------------------- */

let writeChain: Promise<unknown> = Promise.resolve();

async function readStore(): Promise<FileStore> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<FileStore>;
    return { ...EMPTY, ...parsed };
  } catch {
    return structuredClone(EMPTY);
  }
}

async function writeStore(store: FileStore) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${STORE_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store, null, 2));
  await fs.rename(tmp, STORE_FILE);
}

/** Serialise mutations so concurrent requests cannot clobber the JSON file. */
function mutate<T>(fn: (store: FileStore) => T | Promise<T>): Promise<T> {
  const next = writeChain.then(async () => {
    const store = await readStore();
    const result = await fn(store);
    await writeStore(store);
    return result;
  });
  writeChain = next.catch(() => undefined);
  return next;
}

const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : String(v));
const uuid = () => crypto.randomUUID();

/* -------------------------------------------------------------------------- */
/* Users                                                                      */
/* -------------------------------------------------------------------------- */

export async function findUserByEmail(email: string): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  if (hasDatabase) {
    await ready();
    const p = await pool();
    const { rows } = await p.query("SELECT * FROM users WHERE lower(email) = $1 LIMIT 1", [normalized]);
    const r = rows[0];
    if (!r) return null;
    return {
      id: String(r.id),
      email: String(r.email),
      name: String(r.name),
      passwordHash: String(r.password_hash),
      role: r.role === "admin" ? "admin" : r.role === "pending" ? "pending" : "member",
      createdAt: iso(r.created_at),
      profile: (r.profile ?? {}) as User["profile"],
    };
  }
  const store = await readStore();
  return store.users.find((u) => u.email.toLowerCase() === normalized) ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    const { rows } = await p.query("SELECT * FROM users WHERE id = $1 LIMIT 1", [id]);
    const r = rows[0];
    if (!r) return null;
    return {
      id: String(r.id),
      email: String(r.email),
      name: String(r.name),
      passwordHash: String(r.password_hash),
      role: r.role === "admin" ? "admin" : r.role === "pending" ? "pending" : "member",
      createdAt: iso(r.created_at),
      profile: (r.profile ?? {}) as User["profile"],
    };
  }
  const store = await readStore();
  return store.users.find((u) => u.id === id) ?? null;
}

export async function listUsers(): Promise<User[]> {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    const { rows } = await p.query("SELECT * FROM users ORDER BY created_at ASC");
    return rows.map((r) => ({
      id: String(r.id),
      email: String(r.email),
      name: String(r.name),
      passwordHash: String(r.password_hash),
      role: r.role === "admin" ? "admin" : r.role === "pending" ? "pending" : "member",
      createdAt: iso(r.created_at),
      profile: (r.profile ?? {}) as User["profile"],
    }));
  }
  return (await readStore()).users;
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<void> {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    await p.query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, id]);
    return;
  }
  await mutate((store) => {
    const user = store.users.find((u) => u.id === id);
    if (user) user.passwordHash = passwordHash;
  });
}

export async function updateUserRole(id: string, role: "pending" | "member" | "admin"): Promise<void> {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    await p.query("UPDATE users SET role = $1 WHERE id = $2", [role, id]);
    return;
  }
  await mutate((store) => {
    const user = store.users.find((u) => u.id === id);
    if (user) user.role = role;
  });
}

export async function countUsers(): Promise<number> {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    const { rows } = await p.query("SELECT count(*)::int AS n FROM users");
    return Number(rows[0]?.n ?? 0);
  }
  return (await readStore()).users.length;
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  role?: "pending" | "member" | "admin";
  profile?: User["profile"];
}): Promise<User> {
  const user: User = {
    id: uuid(),
    email: input.email.trim().toLowerCase(),
    name: input.name.trim().slice(0, 80),
    passwordHash: input.passwordHash,
    role: input.role ?? "member",
    createdAt: new Date().toISOString(),
    profile: input.profile ?? {},
  };

  if (hasDatabase) {
    await ready();
    const p = await pool();
    await p.query(
      "INSERT INTO users (id, email, name, password_hash, role, profile) VALUES ($1,$2,$3,$4,$5,$6)",
      [user.id, user.email, user.name, user.passwordHash, user.role, JSON.stringify(user.profile ?? {})],
    );
    return user;
  }

  await mutate((s) => {
    if (s.users.some((u) => u.email === user.email)) throw new Error("EMAIL_TAKEN");
    s.users.push(user);
  });
  return user;
}

/* -------------------------------------------------------------------------- */
/* Solves & hints                                                             */
/* -------------------------------------------------------------------------- */

export async function getSolves(userId: string): Promise<Solve[]> {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    const { rows } = await p.query("SELECT * FROM solves WHERE user_id = $1", [userId]);
    return rows.map((r) => ({
      userId: String(r.user_id),
      challengeSlug: String(r.challenge_slug),
      points: Number(r.points),
      hintCost: Number(r.hint_cost),
      season: String(r.season),
      solvedAt: iso(r.solved_at),
    }));
  }
  return (await readStore()).solves.filter((s) => s.userId === userId);
}

export async function getAllSolves(): Promise<Solve[]> {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    const { rows } = await p.query("SELECT * FROM solves");
    return rows.map((r) => ({
      userId: String(r.user_id),
      challengeSlug: String(r.challenge_slug),
      points: Number(r.points),
      hintCost: Number(r.hint_cost),
      season: String(r.season),
      solvedAt: iso(r.solved_at),
    }));
  }
  return (await readStore()).solves;
}

export async function addSolve(solve: Solve): Promise<boolean> {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    const { rows } = await p.query(
      `INSERT INTO solves (user_id, challenge_slug, points, hint_cost, season)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (user_id, challenge_slug) DO NOTHING
       RETURNING challenge_slug`,
      [solve.userId, solve.challengeSlug, solve.points, solve.hintCost, solve.season],
    );
    return rows.length > 0;
  }
  return mutate((s) => {
    if (s.solves.some((x) => x.userId === solve.userId && x.challengeSlug === solve.challengeSlug)) {
      return false;
    }
    s.solves.push(solve);
    return true;
  });
}

export async function getHintUnlocks(userId: string): Promise<HintUnlock[]> {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    const { rows } = await p.query("SELECT * FROM hint_unlocks WHERE user_id = $1", [userId]);
    return rows.map((r) => ({
      userId: String(r.user_id),
      challengeSlug: String(r.challenge_slug),
      hintIndex: Number(r.hint_index),
      cost: Number(r.cost),
      unlockedAt: iso(r.unlocked_at),
    }));
  }
  return (await readStore()).hints.filter((h) => h.userId === userId);
}

export async function unlockHint(hint: HintUnlock): Promise<boolean> {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    const { rows } = await p.query(
      `INSERT INTO hint_unlocks (user_id, challenge_slug, hint_index, cost)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT DO NOTHING RETURNING hint_index`,
      [hint.userId, hint.challengeSlug, hint.hintIndex, hint.cost],
    );
    return rows.length > 0;
  }
  return mutate((s) => {
    const exists = s.hints.some(
      (h) =>
        h.userId === hint.userId &&
        h.challengeSlug === hint.challengeSlug &&
        h.hintIndex === hint.hintIndex,
    );
    if (exists) return false;
    s.hints.push(hint);
    return true;
  });
}

/* -------------------------------------------------------------------------- */
/* Dynamic content (admin CMS overrides)                                      */
/* -------------------------------------------------------------------------- */

export async function listOverrides<T = unknown>(type: string): Promise<ContentRow<T>[]> {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    const { rows } = await p.query("SELECT * FROM content WHERE type = $1", [type]);
    return rows.map((r) => ({
      type: String(r.type),
      slug: String(r.slug),
      data: r.data as T,
      deleted: Boolean(r.deleted),
      updatedAt: iso(r.updated_at),
    }));
  }
  return (await readStore()).content.filter((c) => c.type === type) as ContentRow<T>[];
}

export async function upsertContent(type: string, slug: string, data: unknown) {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    await p.query(
      `INSERT INTO content (type, slug, data, deleted, updated_at)
       VALUES ($1,$2,$3,false,NOW())
       ON CONFLICT (type, slug) DO UPDATE SET data = $3, deleted = false, updated_at = NOW()`,
      [type, slug, JSON.stringify(data)],
    );
    return;
  }
  await mutate((s) => {
    const idx = s.content.findIndex((c) => c.type === type && c.slug === slug);
    const row: ContentRow = { type, slug, data, deleted: false, updatedAt: new Date().toISOString() };
    if (idx >= 0) s.content[idx] = row;
    else s.content.push(row);
  });
}

export async function deleteContent(type: string, slug: string) {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    await p.query(
      `INSERT INTO content (type, slug, data, deleted, updated_at)
       VALUES ($1,$2,'{}'::jsonb,true,NOW())
       ON CONFLICT (type, slug) DO UPDATE SET deleted = true, updated_at = NOW()`,
      [type, slug],
    );
    return;
  }
  await mutate((s) => {
    const idx = s.content.findIndex((c) => c.type === type && c.slug === slug);
    const row: ContentRow = { type, slug, data: {}, deleted: true, updatedAt: new Date().toISOString() };
    if (idx >= 0) s.content[idx] = row;
    else s.content.push(row);
  });
}

/* -------------------------------------------------------------------------- */
/* Registrations & newsletter                                                 */
/* -------------------------------------------------------------------------- */

export async function addRegistration(reg: Record<string, unknown>) {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    await p.query(
      `INSERT INTO registrations (id,name,email,year,field,interests,motivation,intent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        uuid(),
        String(reg.name ?? ""),
        String(reg.email ?? ""),
        String(reg.year ?? ""),
        String(reg.field ?? ""),
        JSON.stringify(reg.interests ?? []),
        String(reg.motivation ?? ""),
        String(reg.intent ?? "membership"),
      ],
    );
    return;
  }
  await mutate((s) => {
    s.registrations.push({ ...reg, id: uuid(), createdAt: new Date().toISOString() });
  });
}

export async function listRegistrations(): Promise<Record<string, unknown>[]> {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    const { rows } = await p.query("SELECT * FROM registrations ORDER BY created_at DESC LIMIT 500");
    return rows;
  }
  return (await readStore()).registrations.slice().reverse();
}

export async function addSubscriber(email: string) {
  const normalized = email.trim().toLowerCase();
  if (hasDatabase) {
    await ready();
    const p = await pool();
    await p.query("INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT DO NOTHING", [normalized]);
    return;
  }
  await mutate((s) => {
    if (!s.subscribers.some((x) => x.email === normalized)) {
      s.subscribers.push({ email: normalized, createdAt: new Date().toISOString() });
    }
  });
}

export async function countRegistrations(): Promise<number> {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    const { rows } = await p.query("SELECT count(*)::int AS n FROM registrations");
    return Number(rows[0]?.n ?? 0);
  }
  return (await readStore()).registrations.length;
}

// ---------------------------------------------------------------- password resets

export async function createPasswordReset(
  userId: string,
  tokenHash: string,
  expiresAt: string,
): Promise<void> {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    await p.query(
      "INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
      [userId, tokenHash, expiresAt],
    );
    return;
  }
  await mutate((store) => {
    store.resets = store.resets.filter((r) => r.userId !== userId);
    store.resets.push({ userId, tokenHash, expiresAt, used: false });
  });
}

/** Returns the user id for a valid, unused, unexpired token and burns it. */
export async function consumePasswordReset(tokenHash: string): Promise<string | null> {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    const { rows } = await p.query(
      `UPDATE password_resets SET used = TRUE
       WHERE token_hash = $1 AND used = FALSE AND expires_at > NOW()
       RETURNING user_id`,
      [tokenHash],
    );
    return rows[0] ? String(rows[0].user_id) : null;
  }
  return mutate((store) => {
    const row = store.resets.find((r) => r.tokenHash === tokenHash);
    if (!row || row.used || new Date(row.expiresAt).getTime() < Date.now()) return null;
    row.used = true;
    return row.userId;
  });
}


/* -------------------------------------------------------------------------- */
/* Challenge activity (time-to-solve + integrity signals)                      */
/* -------------------------------------------------------------------------- */

/** Remember the first time a member opened a challenge. Later opens are ignored. */
export async function recordChallengeStart(userId: string, challengeSlug: string): Promise<void> {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    await p.query(
      `INSERT INTO challenge_starts (user_id, challenge_slug) VALUES ($1,$2)
       ON CONFLICT (user_id, challenge_slug) DO NOTHING`,
      [userId, challengeSlug],
    );
    return;
  }
  await mutate((s) => {
    if (!s.starts.some((x) => x.userId === userId && x.challengeSlug === challengeSlug)) {
      s.starts.push({ userId, challengeSlug, startedAt: new Date().toISOString() });
    }
  });
}

export async function getAllStarts(): Promise<ChallengeStart[]> {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    const { rows } = await p.query("SELECT * FROM challenge_starts");
    return rows.map((r) => ({
      userId: String(r.user_id),
      challengeSlug: String(r.challenge_slug),
      startedAt: iso(r.started_at),
    }));
  }
  return (await readStore()).starts;
}

export async function recordIntegrityEvent(
  userId: string,
  challengeSlug: string,
  kind: IntegrityKind,
): Promise<void> {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    await p.query("INSERT INTO integrity_events (user_id, challenge_slug, kind) VALUES ($1,$2,$3)", [
      userId,
      challengeSlug,
      kind,
    ]);
    return;
  }
  await mutate((s) => {
    s.events.push({ userId, challengeSlug, kind, at: new Date().toISOString() });
  });
}

export async function getAllIntegrityEvents(): Promise<IntegrityEvent[]> {
  if (hasDatabase) {
    await ready();
    const p = await pool();
    const { rows } = await p.query("SELECT * FROM integrity_events ORDER BY at DESC LIMIT 5000");
    return rows.map((r) => ({
      userId: String(r.user_id),
      challengeSlug: String(r.challenge_slug),
      kind: String(r.kind) as IntegrityKind,
      at: iso(r.at),
    }));
  }
  return (await readStore()).events;
}
