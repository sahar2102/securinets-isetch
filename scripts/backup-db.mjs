#!/usr/bin/env node
/**
 * Portable backup: exports every table to a timestamped JSON file.
 * Works without pg_dump, so it runs on Windows, macOS and any VPS.
 *
 *   npm run db:backup
 *
 * Restore is intentionally manual: read the JSON and re-insert with the
 * columns you need. Keeps a junior admin from wiping production by accident.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const TABLES = ["users", "solves", "hint_unlocks", "content", "registrations", "subscribers"];

const client = new pg.Client({ connectionString: url, ssl: url.includes("supabase") ? { rejectUnauthorized: false } : undefined });
await client.connect();

const dump = { exportedAt: new Date().toISOString(), tables: {} };
for (const table of TABLES) {
  try {
    const { rows } = await client.query(`SELECT * FROM ${table}`);
    dump.tables[table] = rows;
    console.log(`${table}: ${rows.length} rows`);
  } catch (error) {
    console.warn(`${table}: skipped (${error.message})`);
  }
}

await client.end();

const dir = path.join(process.cwd(), "backups");
await mkdir(dir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
const file = path.join(dir, `backup-${stamp}.json`);
await writeFile(file, JSON.stringify(dump, null, 2));
console.log(`\nwritten ${file}`);
