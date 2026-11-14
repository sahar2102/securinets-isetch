import { NextResponse } from "next/server";
import { countUsers } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lightweight uptime probe: 200 when the app and the database answer. */
export async function GET() {
  const started = Date.now();
  try {
    const users = await countUsers();
    return NextResponse.json(
      {
        status: "ok",
        database: "up",
        mail: process.env.SMTP_USER && process.env.SMTP_PASS ? "configured" : "missing",
        users,
        latencyMs: Date.now() - started,
        timestamp: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[health]", error);
    return NextResponse.json(
      { status: "degraded", database: "down", timestamp: new Date().toISOString() },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
