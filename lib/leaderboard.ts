import { getAllSolves, listUsers } from "./db";
import { CURRENT_SEASON, rankRows, totalScore } from "./scoring";
import type { LeaderboardRow, Solve } from "./types";

export type LeaderboardRange = "all" | "season";

export async function getLeaderboard(range: LeaderboardRange = "all"): Promise<LeaderboardRow[]> {
  const [solves, users] = await Promise.all([getAllSolves(), listUsers()]);
  const filtered = range === "season" ? solves.filter((s) => s.season === CURRENT_SEASON) : solves;

  const nameById = new Map(users.map((u) => [u.id, u.name]));
  const demoIds = new Set(users.filter((u) => u.email.endsWith("@demo.securinets.local")).map((u) => u.id));
  const byUser = new Map<string, Solve[]>();

  for (const solve of filtered) {
    const list = byUser.get(solve.userId) ?? [];
    list.push(solve);
    byUser.set(solve.userId, list);
  }

  const rows = [...byUser.entries()].map(([userId, userSolves]) => ({
    userId,
    name: nameById.get(userId) ?? "Anonymous",
    score: totalScore(userSolves, userSolves.map((s) => ({ cost: s.hintCost }))),
    solves: userSolves.length,
    lastSolve: userSolves
      .map((s) => s.solvedAt)
      .sort()
      .at(-1) ?? null,
    isDemo: demoIds.has(userId),
  }));

  return rankRows(rows).slice(0, 100).map((r) => ({
    rank: r.rank,
    userId: r.userId,
    name: r.name,
    score: r.score,
    solves: r.solves,
    lastSolve: r.lastSolve,
    isDemo: r.isDemo,
  }));
}
