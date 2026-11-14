import { getAllChallenges } from "./challenges";
import { getHintUnlocks, getSolves, listOverrides } from "./db";
import { getLeaderboard } from "./leaderboard";
import { computeProgress } from "./scoring";
import type { ChallengeRecord, HintUnlock, Progress } from "./types";

export interface ServerProgress extends Progress {
  hints: Record<string, number[]>;
}

export async function progressForUser(userId: string): Promise<ServerProgress> {
  const [challenges, solves, unlocks, overrides] = await Promise.all([
    getAllChallenges(),
    getSolves(userId),
    getHintUnlocks(userId),
    listOverrides<ChallengeRecord>("challenge").catch(() => []),
  ]);

  const deleted = new Set(overrides.filter((o) => o.deleted).map((o) => o.slug));
  const visible = challenges.filter((c) => !deleted.has(c.slug));
  const base = computeProgress(solves, unlocks, visible);

  const hints: Record<string, number[]> = {};
  for (const unlock of unlocks) {
    hints[unlock.challengeSlug] = [...(hints[unlock.challengeSlug] ?? []), unlock.hintIndex];
  }

  let rank: number | null = null;
  try {
    const board = await getLeaderboard("all");
    rank = board.find((row) => row.userId === userId)?.rank ?? null;
  } catch {
    rank = null;
  }

  return { ...base, hints, rank };
}

export function hintCostFor(
  challenge: ChallengeRecord,
  unlocks: HintUnlock[],
  slug: string,
): number {
  return unlocks
    .filter((u) => u.challengeSlug === slug)
    .reduce((sum, u) => sum + (challenge.hints?.[u.hintIndex]?.cost ?? u.cost), 0);
}
