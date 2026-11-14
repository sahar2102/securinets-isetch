import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { canUseChallenges } from "@/lib/access";
import { getChallenge } from "@/lib/challenges";
import { getHintUnlocks, getSolves, unlockHint } from "@/lib/db";
import { progressForUser } from "@/lib/progress-server";
import { clientIp, hit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ slug: z.string().min(1), index: z.number().int().min(0).max(20) });

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!hit(`hint:${ip}`, { limit: 30, windowMs: 60_000 }).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const session = await auth();
  if (!canUseChallenges(session?.user?.role)) {
    return NextResponse.json({ error: "members_only" }, { status: 403 });
  }
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const { slug, index } = parsed.data;
  const challenge = await getChallenge(slug);
  const hint = challenge?.hints?.[index];
  if (!challenge || !hint) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const existing = await getHintUnlocks(session.user.id);
  const unlocked = existing.some((h) => h.challengeSlug === slug && h.hintIndex === index);
  if (unlocked) {
    return NextResponse.json({ text: hint.text, cost: 0, unlocked: true });
  }

  const [progress, solves] = await Promise.all([
    progressForUser(session.user.id),
    getSolves(session.user.id),
  ]);

  const solved = solves.some((s) => s.challengeSlug === slug);
  if (!solved && progress.score < hint.cost) {
    return NextResponse.json({ error: "not_enough_points" }, { status: 402 });
  }

  await unlockHint({
    userId: session.user.id,
    challengeSlug: slug,
    hintIndex: index,
    cost: hint.cost,
    unlockedAt: new Date().toISOString(),
  });

  return NextResponse.json({ text: hint.text, cost: hint.cost, unlocked: true });
}
