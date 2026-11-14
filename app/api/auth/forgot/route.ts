import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createPasswordReset, findUserByEmail } from "@/lib/db";
import { sendPasswordReset } from "@/lib/mail";
import { clientIp, hit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().trim().email().max(160) });

export async function POST(req: Request) {
  if (!hit(`forgot:${clientIp(req)}`, { limit: 5, windowMs: 60 * 60_000 }).ok) {
    return NextResponse.json({ ok: true });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: true });

  const email = parsed.data.email.toLowerCase();
  const user = await findUserByEmail(email).catch(() => null);

  if (user) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60_000).toISOString();
    await createPasswordReset(user.id, tokenHash, expiresAt);
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
    await sendPasswordReset(user.email, user.name, `${base}/reset-password?token=${token}`).catch(
      (error) => console.error("[mail] send failed", error),
    );
  }

  // Always the same answer: never reveal whether an address has an account.
  return NextResponse.json({ ok: true });
}
