import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createUser, findUserByEmail } from "@/lib/db";
import { clientIp, hit } from "@/lib/rate-limit";
import { ensureSeed } from "@/lib/seed";
import { getViewer } from "@/lib/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  code: z.string().trim().max(60).optional(),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(128),
  university: z.string().trim().min(2).max(120),
  year: z.string().trim().min(1).max(40),
  field: z.string().trim().min(2).max(120),
  motivation: z.string().trim().min(20).max(1200),
});

export async function POST(req: Request) {
  // One session at a time: an authenticated visitor never creates a second
  // account from the browser. They see the status panel instead of this form.
  const viewer = await getViewer().catch(() => null);
  if (viewer) {
    return NextResponse.json({ error: "already_signed_in" }, { status: 409 });
  }

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
  let created: { id: string } | null = null;
  try {
    created = await createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: approved ? "member" : "pending",
      profile: {
        university: parsed.data.university,
        year: parsed.data.year,
        field: parsed.data.field,
        motivation: parsed.data.motivation,
      },
    });
  } catch (error) {
    if ((error as Error).message === "EMAIL_TAKEN") {
      return NextResponse.json({ error: "email_taken" }, { status: 409 });
    }
    console.error("[register]", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  if (!approved && created) {
    const { createActionToken } = await import("@/lib/approve-token");
    const { notifyAdmin } = await import("@/lib/notify");
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
    const token = createActionToken("approve", created.id);
    await notifyAdmin(
      "New account awaiting approval",
      [
        ["Name", parsed.data.name],
        ["Email", parsed.data.email],
        ["Status", "pending"],
      ],
      { label: "Review and approve", url: `${base}/admin/approve?token=${token}` },
    ).catch((error) => console.error("[notify] register", error));
  }

  return NextResponse.json({ ok: true, pending: !approved });
}
