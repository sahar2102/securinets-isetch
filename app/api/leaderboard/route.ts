import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/leaderboard";
import { ensureSeed } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const range = new URL(req.url).searchParams.get("range") === "season" ? "season" : "all";
  await ensureSeed().catch(() => undefined);
  const rows = await getLeaderboard(range);
  return NextResponse.json(
    { range, rows, updatedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
