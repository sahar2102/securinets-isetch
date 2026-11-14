import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { consumePasswordReset, updateUserPassword } from "@/lib/db";
import { clientIp, hit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  if (!hit(`reset:${clientIp(req)}`, { limit: 10, windowMs: 60 * 60_000 }).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const userId = await consumePasswordReset(tokenHash);
  if (!userId) return NextResponse.json({ error: "invalid_token" }, { status: 400 });

  await updateUserPassword(userId, await bcrypt.hash(parsed.data.password, 11));
  return NextResponse.json({ ok: true });
}
