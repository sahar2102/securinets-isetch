import { NextResponse } from "next/server";
import { pingDb, hasDatabase } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const dbHealth = await pingDb();
  const status = dbHealth.ok ? 200 : 503;
  return NextResponse.json(
    {
      status: dbHealth.ok ? "healthy" : "unhealthy",
      database: {
        configured: hasDatabase,
        dialect: dbHealth.dialect,
        connected: dbHealth.ok,
        error: dbHealth.error ?? null,
      },
      timestamp: new Date().toISOString(),
    },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
