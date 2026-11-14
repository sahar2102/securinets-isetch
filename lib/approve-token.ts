import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed, expiring tokens for one-click admin actions in email.
 * Format: base64url(`${action}:${userId}:${exp}`) + "." + base64url(hmac)
 */

const secret = () => process.env.ADMIN_ACTION_SECRET ?? process.env.AUTH_SECRET ?? "dev-secret";

const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("base64url");

export function createActionToken(action: "approve", userId: string, ttlMinutes = 60 * 24 * 3) {
  const exp = Date.now() + ttlMinutes * 60_000;
  const payload = `${action}:${userId}:${exp}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

export function verifyActionToken(token: string): { action: string; userId: string } | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  let payload: string;
  try {
    payload = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const [action, userId, exp] = payload.split(":");
  if (!action || !userId || Number(exp) < Date.now()) return null;
  return { action, userId };
}
