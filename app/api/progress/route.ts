import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { progressForUser } from "@/lib/progress-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ guest: true, solved: [], hints: {}, score: 0 }, { status: 401 });
  }

  const progress = await progressForUser(session.user.id);
  return NextResponse.json(
    {
      solved: progress.solved,
      hints: progress.hints,
      score: progress.score,
      rank: progress.rank,
      achievements: progress.achievements,
      byCategory: progress.byCategory,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
