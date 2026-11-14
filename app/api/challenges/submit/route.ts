import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { canUseChallenges } from "@/lib/access";
import { checkFlag, getChallenge } from "@/lib/challenges";
import { addSolve, getHintUnlocks, getSolves } from "@/lib/db";
import { clientIp, hit } from "@/lib/rate-limit";
import { CURRENT_SEASON } from "@/lib/scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  slug: z.string().min(1).max(80),
  flag: z.string().min(1).max(300),
});

export async function POST(req: Request) {
  const ip = clientIp(req);

  // Coarse limit: 20 submissions / minute / IP, then a 5 minute cool-down.
  const burst = hit(`submit:${ip}`, { limit: 20, windowMs: 60_000, blockMs: 5 * 60_000 });
  if (!burst.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfter: burst.retryAfter },
      { status: 429, headers: { "Retry-After": String(burst.retryAfter) } },
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { slug, flag } = parsed.data;

  // Per-challenge brute-force protection: 8 wrong attempts per 10 minutes.
  const attemptKey = `attempt:${ip}:${slug}`;
  const attempt = hit(attemptKey, { limit: 8, windowMs: 10 * 60_000, blockMs: 10 * 60_000 });

  const challenge = await getChallenge(slug);
  if (!challenge) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const session = await auth();
  if (!canUseChallenges(session?.user?.role)) {
    return NextResponse.json({ error: "members_only" }, { status: 403 });
  }
  const userId = session?.user?.id;

  const correct = checkFlag(challenge, flag);

  if (!correct) {
    if (!attempt.ok) {
      return NextResponse.json(
        { correct: false, error: "rate_limited", retryAfter: attempt.retryAfter },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { correct: false, remaining: attempt.remaining },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!userId) {
    return NextResponse.json(
      {
        correct: true,
        guest: true,
        points: challenge.points,
        message: "Correct. Sign in to save this solve on the leaderboard.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const [existing, unlocks] = await Promise.all([getSolves(userId), getHintUnlocks(userId)]);
  if (existing.some((s) => s.challengeSlug === slug)) {
    return NextResponse.json({ correct: true, already: true, points: challenge.points });
  }

  const hintCost = unlocks
    .filter((u) => u.challengeSlug === slug)
    .reduce((sum, u) => sum + (challenge.hints?.[u.hintIndex]?.cost ?? u.cost), 0);

  const inserted = await addSolve({
    userId,
    challengeSlug: slug,
    points: challenge.points,
    hintCost,
    season: CURRENT_SEASON,
    solvedAt: new Date().toISOString(),
  });

  if (!inserted) {
    return NextResponse.json({ correct: true, already: true, points: challenge.points });
  }

  return NextResponse.json(
    {
      correct: true,
      points: challenge.points,
      hintCost,
      message: "Flag captured.",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
