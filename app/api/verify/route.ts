import { NextResponse } from "next/server";
import { verifyCertificate } from "@/lib/content";
import { clientIp, hit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!hit(`verify:${clientIp(req)}`, { limit: 40, windowMs: 60_000 }).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const number = new URL(req.url).searchParams.get("number") ?? "";
  const certificate = await verifyCertificate(number);

  if (!certificate) {
    return NextResponse.json({ found: false }, { headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json(
    {
      found: true,
      certificate: {
        id: certificate.id,
        holder: certificate.holder,
        event: certificate.event,
        type: certificate.type,
        issuedAt: certificate.issuedAt,
        hours: certificate.hours ?? null,
        status: certificate.status,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
