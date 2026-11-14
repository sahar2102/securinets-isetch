import { NextResponse } from "next/server";
import { verifyActionToken } from "@/lib/approve-token";
import { updateUserRole } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Approves a pending account from a signed email link.
 * POST only: mail clients and security scanners prefetch GET links, and we do
 * not want an inbox scan to grant access.
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const token = String(form?.get("token") ?? "");

  const claim = verifyActionToken(token);
  if (!claim || claim.action !== "approve") {
    return NextResponse.redirect(new URL("/admin/approve?error=invalid", req.url), 303);
  }

  await updateUserRole(claim.userId, "member");
  return NextResponse.redirect(new URL("/admin/approve?ok=1", req.url), 303);
}
