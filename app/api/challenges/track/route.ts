import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { canUseChallenges } from "@/lib/access";
import { getChallenge } from "@/lib/challenges";
import { recordChallengeStart, recordIntegrityEvent } from "@/lib/db";
import { hit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  slug: z.string().min(1).max(80),
  kind: z.enum(["start", "copy", "screenshot", "print", "menu"]),
});

/**
 * Records that a member opened a challenge ("start") or attempted something
 * suspicious while viewing it. Admins are never tracked so testing a challenge
 * does not pollute the numbers.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role;
  if (!userId || !canUseChallenges(role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (role === "admin") return NextResponse.json({ ok: true, skipped: true });

  const limit = hit(`track:${userId}`, { limit: 40, windowMs: 10 * 60_000, blockMs: 10 * 60_000 });
  if (!limit.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const { slug, kind } = parsed.data;
  const challenge = await getChallenge(slug);
  if (!challenge) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (kind === "start") await recordChallengeStart(userId, slug);
  else await recordIntegrityEvent(userId, slug, kind);

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
