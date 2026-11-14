import { categories } from "@/data/site";
import type { ChallengeRecord, HintUnlock, Progress, Solve } from "./types";

export const CURRENT_SEASON = "2026";

export function seasonOf(date = new Date()): string {
  return String(date.getUTCFullYear());
}

export function totalScore(solves: Solve[], hints: Pick<HintUnlock, "cost">[]): number {
  const earned = solves.reduce((sum, s) => sum + s.points, 0);
  const spent = hints.reduce((sum, h) => sum + h.cost, 0);
  return Math.max(0, earned - spent);
}

export function computeAchievements(
  solves: Solve[],
  hints: HintUnlock[],
  challenges: ChallengeRecord[],
): string[] {
  const solvedSlugs = new Set(solves.map((s) => s.challengeSlug));
  const solved = challenges.filter((c) => solvedSlugs.has(c.slug));
  const score = totalScore(solves, hints);
  const out = new Set<string>();

  if (solved.length > 0) out.add("first-blood");

  for (const cat of categories) {
    const inCat = challenges.filter((c) => c.category === cat.slug);
    if (inCat.length >= 3 && inCat.every((c) => solvedSlugs.has(c.slug))) {
      if (cat.slug === "web") out.add("web-master");
      if (cat.slug === "crypto") out.add("crypto-nerd");
      if (cat.slug === "network") out.add("ghost");
    }
  }

  if (new Set(solved.map((c) => c.category)).size >= 5) out.add("polyglot");
  if (solved.some((c) => c.difficulty === "expert")) out.add("insane");
  if (score >= 1000) out.add("century");

  const days = new Map<string, number>();
  for (const s of solves) {
    const day = s.solvedAt.slice(0, 10);
    days.set(day, (days.get(day) ?? 0) + 1);
  }
  if ([...days.values()].some((n) => n >= 3)) out.add("streak");

  return [...out];
}

export function computeProgress(
  solves: Solve[],
  hints: HintUnlock[],
  challenges: ChallengeRecord[],
): Progress {
  const solvedSet = new Set(solves.map((s) => s.challengeSlug));
  const byCategory: Progress["byCategory"] = {};

  for (const cat of categories) {
    const inCat = challenges.filter((c) => c.category === cat.slug);
    const done = inCat.filter((c) => solvedSet.has(c.slug));
    byCategory[cat.slug] = {
      solved: done.length,
      total: inCat.length,
      points: done.reduce((sum, c) => sum + c.points, 0),
    };
  }

  return {
    score: totalScore(solves, hints),
    solved: [...solvedSet],
    hintSpend: hints.reduce((sum, h) => sum + h.cost, 0),
    byCategory,
    achievements: computeAchievements(solves, hints, challenges),
    rank: null,
  };
}

/** Rank rows by score, ties broken by who got there first. */
export function rankRows<T extends { score: number; lastSolve: string | null }>(rows: T[]): (T & { rank: number })[] {
  return rows
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.lastSolve ?? "9999").localeCompare(b.lastSolve ?? "9999");
    })
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export const badgeMeta: Record<string, { name: string; desc: string; icon: string }> = {
  "first-blood": { name: "First Blood", desc: "Solve your first challenge.", icon: "droplet" },
  "web-master": { name: "Web Master", desc: "Clear every Web challenge.", icon: "globe" },
  "crypto-nerd": { name: "Crypto Nerd", desc: "Clear every Cryptography challenge.", icon: "key" },
  ghost: { name: "Ghost in the Wires", desc: "Clear every Network challenge.", icon: "network" },
  polyglot: { name: "Polyglot", desc: "Solve challenges in 5+ categories.", icon: "layers" },
  insane: { name: "Certified Insane", desc: "Solve an Expert challenge.", icon: "skull" },
  streak: { name: "Hat Trick", desc: "Solve 3 challenges in one day.", icon: "flame" },
  century: { name: "Century", desc: "Reach 1,000 points.", icon: "trophy" },
};
