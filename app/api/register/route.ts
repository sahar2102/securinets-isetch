import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createUser, findUserByEmail } from "@/lib/db";
import { clientIp, hit } from "@/lib/rate-limit";
import { ensureSeed } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  code: z.string().trim().max(60).optional(),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  if (!hit(`register:${clientIp(req)}`, { limit: 5, windowMs: 60 * 60_000, blockMs: 30 * 60_000 }).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 422 });
  }

  await ensureSeed().catch(() => undefined);

  const existing = await findUserByEmail(parsed.data.email);
  if (existing) {
    return NextResponse.json({ error: "email_taken" }, { status: 409 });
  }

  const invite = process.env.MEMBERSHIP_CODE;
  const approved = Boolean(invite) && parsed.data.code === invite;
  const passwordHash = await bcrypt.hash(parsed.data.password, 11);
  try {
    await createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: approved ? "member" : "pending",
    });
  } catch (error) {
    if ((error as Error).message === "EMAIL_TAKEN") {
      return NextResponse.json({ error: "email_taken" }, { status: 409 });
    }
    console.error("[register]", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, pending: !approved });
}
