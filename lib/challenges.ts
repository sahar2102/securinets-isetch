import { createHash, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { listOverrides } from "./db";
import type { ChallengeRecord, PublicChallenge } from "./types";

const DIR = path.join(process.cwd(), "data", "challenges");

const byPoints = (a: ChallengeRecord, b: ChallengeRecord) =>
  a.difficulty === b.difficulty ? a.points - b.points : a.points - b.points;

/** Reads and merges the JSON seed with admin overrides stored in the DB. */
export const getAllChallenges = cache(async (includeHidden = false): Promise<ChallengeRecord[]> => {
  const files = (await fs.readdir(DIR)).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
  const seed: ChallengeRecord[] = [];
  for (const file of files) {
    const raw = await fs.readFile(path.join(DIR, file), "utf8");
    const parsed = JSON.parse(raw) as { challenges: ChallengeRecord[] };
    seed.push(...parsed.challenges);
  }

  let overrides: Awaited<ReturnType<typeof listOverrides<ChallengeRecord>>> = [];
  try {
    overrides = await listOverrides<ChallengeRecord>("challenge");
  } catch (error) {
    console.warn("[challenges] overrides unavailable:", (error as Error).message);
  }

  const map = new Map(seed.map((c) => [c.slug, c]));
  for (const row of overrides) {
    if (row.deleted) {
      map.delete(row.slug);
      continue;
    }
    const data = row.data as ChallengeRecord;
    const prev = map.get(row.slug);
    map.set(row.slug, {
      ...prev,
      ...data,
      slug: row.slug,
      id: data.id ?? prev?.id ?? row.slug,
      solves: data.solves ?? prev?.solves ?? 0,
      tags: data.tags ?? prev?.tags ?? [],
      hidden: data.hidden ?? prev?.hidden,
    });
  }

  return [...map.values()]
    .filter((c) => includeHidden || !c.hidden)
    .sort(byPoints);
});

/** Strips secrets before anything reaches the browser. */
export function toPublic(c: ChallengeRecord): PublicChallenge {
  const { flag: _flag, flagHash: _hash, salt: _salt, hidden: _hidden, ...rest } = c;
  return rest;
}

export async function getPublicChallenges(): Promise<PublicChallenge[]> {
  return (await getAllChallenges()).map(toPublic);
}

export async function getChallenge(slug: string): Promise<ChallengeRecord | null> {
  return (await getAllChallenges()).find((c) => c.slug === slug) ?? null;
}

export async function getChallengeStats() {
  const all = await getAllChallenges();
  return {
    total: all.length,
    solves: all.reduce((sum, c) => sum + (c.solves ?? 0), 0),
    byCategory: all.reduce<Record<string, number>>((acc, c) => {
      acc[c.category] = (acc[c.category] ?? 0) + 1;
      return acc;
    }, {}),
  };
}

/* -------------------------------------------------------------------------- */
/* Flag verification                                                          */
/* -------------------------------------------------------------------------- */

export function normalizeFlag(input: string): string {
  return input.trim().replace(/\s+/g, " ").replace(/\u00a0/g, " ");
}

export function hashFlag(flag: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${normalizeFlag(flag)}`).digest("hex");
}

/**
 * Constant-time check against the stored hash. Falls back to hashing a
 * plaintext `flag` field (development convenience) when no hash exists yet.
 */
export function checkFlag(challenge: ChallengeRecord, submitted: string): boolean {
  const salt = challenge.salt ?? "snt-isetch-2026";
  const expected = challenge.flagHash ?? (challenge.flag ? hashFlag(challenge.flag, salt) : null);
  if (!expected) return false;
  const actual = hashFlag(submitted, salt);
  if (actual.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function makeFlagHash(flag: string): { salt: string; flagHash: string } {
  const salt = createHash("sha256")
    .update(`${flag}:${Date.now()}:${Math.random()}`)
    .digest("hex")
    .slice(0, 16);
  return { salt, flagHash: hashFlag(flag, salt) };
}
