import { NextResponse } from "next/server";
import { z } from "zod";
import { addSubscriber } from "@/lib/db";
import { notifyAdmin } from "@/lib/notify";
import { clientIp, hit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().trim().email().max(160) });

export async function POST(req: Request) {
  if (!hit(`news:${clientIp(req)}`, { limit: 6, windowMs: 60 * 60_000 }).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_email" }, { status: 422 });

  await addSubscriber(parsed.data.email);
  await notifyAdmin("New newsletter subscriber", [["Email", parsed.data.email]]).catch((error) =>
    console.error("[notify] newsletter", error),
  );
  return NextResponse.json({ ok: true });
}
