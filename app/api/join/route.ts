import { NextResponse } from "next/server";
import { z } from "zod";
import { addRegistration } from "@/lib/db";
import { notifyAdmin } from "@/lib/notify";
import { clientIp, hit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(3).max(80),
  email: z.string().trim().email().max(160),
  year: z.string().trim().min(1).max(40),
  field: z.string().trim().min(2).max(80),
  interests: z.array(z.string().max(40)).max(12).default([]),
  motivation: z.string().trim().min(40).max(1200),
  consent: z.literal(true),
  intent: z.string().max(40).optional(),
  /** Honeypot: bots fill it, humans never see it. */
  website: z.string().max(0).optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = hit(`join:${ip}`, { limit: 5, windowMs: 60 * 60_000, blockMs: 30 * 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfter: limit.retryAfter },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const { website: _honeypot, ...data } = parsed.data;
  await addRegistration({ ...data, createdAt: new Date().toISOString() });

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  await notifyAdmin(
    "New membership application",
    [
      ["Name", data.name],
      ["Email", data.email],
      ["Year", data.year],
      ["Field", data.field],
      ["Interests", data.interests.join(", ") || "—"],
      ["Motivation", data.motivation],
    ],
    { label: "Open the admin panel", url: `${base}/admin` },
  ).catch((error) => console.error("[notify] join", error));

  return NextResponse.json({ ok: true });
}
