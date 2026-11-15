-- ---------------------------------------------------------------------------
-- Securinets ISET Charguia — PostgreSQL / Supabase schema
--
-- The app creates these tables automatically on first boot (lib/db.ts).
-- This file exists for reviewers, for Supabase's SQL editor, and for people
-- who prefer to provision with migrations.
--
--   psql "$DATABASE_URL" -f db/schema.sql
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS solves (
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_slug TEXT NOT NULL,
  points         INTEGER NOT NULL CHECK (points >= 0),
  hint_cost      INTEGER NOT NULL DEFAULT 0 CHECK (hint_cost >= 0),
  season         TEXT NOT NULL,
  solved_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, challenge_slug)
);
CREATE INDEX IF NOT EXISTS solves_slug_idx ON solves (challenge_slug);
CREATE INDEX IF NOT EXISTS solves_season_idx ON solves (season);

CREATE TABLE IF NOT EXISTS hint_unlocks (
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_slug TEXT NOT NULL,
  hint_index     INTEGER NOT NULL,
  cost           INTEGER NOT NULL DEFAULT 0,
  unlocked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, challenge_slug, hint_index)
);

-- Admin-managed overrides merged over the JSON seed at read time.
-- `deleted = true` hides a seeded record without touching the file.
CREATE TABLE IF NOT EXISTS content (
  type       TEXT NOT NULL,
  slug       TEXT NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  deleted    BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (type, slug)
);
CREATE INDEX IF NOT EXISTS content_type_idx ON content (type);

CREATE TABLE IF NOT EXISTS registrations (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  year       TEXT NOT NULL,
  field      TEXT NOT NULL,
  interests  JSONB NOT NULL DEFAULT '[]'::jsonb,
  motivation TEXT NOT NULL,
  intent     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS registrations_created_idx ON registrations (created_at DESC);

CREATE TABLE IF NOT EXISTS subscribers (
  email      TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_starts (
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_slug TEXT NOT NULL,
  started_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, challenge_slug)
);

CREATE TABLE IF NOT EXISTS integrity_events (
  id             BIGSERIAL PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_slug TEXT NOT NULL,
  kind           TEXT NOT NULL,
  at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS integrity_events_user_idx ON integrity_events (user_id, challenge_slug);

-- ---------------------------------------------------------------------------
-- Supabase notes
-- ---------------------------------------------------------------------------
-- The app talks to Postgres with the connection string (service role), so RLS
-- can stay enabled without policies for the anon key: nothing is queried from
-- the browser. Enable RLS anyway so a leaked anon key cannot read the tables:
--
--   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
--   ALTER TABLE solves ENABLE ROW LEVEL SECURITY;
--   ALTER TABLE hint_unlocks ENABLE ROW LEVEL SECURITY;
--   ALTER TABLE content ENABLE ROW LEVEL SECURITY;
--   ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
--   ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
--
-- Flags live in `content.data->>'flagHash'` for admin-created challenges and in
-- data/challenges/*.json for seeded ones. Both are salted SHA-256 hashes.

-- Performance: the range page and scoreboard count solves per challenge.
CREATE INDEX IF NOT EXISTS solves_challenge_idx ON solves (challenge_slug);
CREATE INDEX IF NOT EXISTS solves_user_idx ON solves (user_id);

-- Password recovery (added Nov 2026)
CREATE TABLE IF NOT EXISTS password_resets (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
