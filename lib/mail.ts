import nodemailer from "nodemailer";
import { site } from "@/data/site";

export const mailConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

const transport = mailConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT ?? 465),
      secure: Number(process.env.SMTP_PORT ?? 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

export async function sendPasswordReset(to: string, name: string, link: string) {
  if (!transport) {
    console.warn(`[mail] SMTP not configured. Password reset link for ${to}: ${link}`);
    return { sent: false as const };
  }
  const from = process.env.MAIL_FROM ?? `Securinets ISET Charguia <${process.env.SMTP_USER}>`;
  await transport.sendMail({
    from,
    to,
    subject: "Reset your Securinets ISET Charguia password",
    text: `Hi ${name},\n\nReset your password (valid 30 minutes):\n${link}\n\nIf you did not ask for this, ignore this email.\n\n— ${site.name}`,
    html: `<div style="background:#0a0a0c;padding:32px;font-family:Inter,Arial,sans-serif;color:#f4f2f5">
      <div style="max-width:520px;margin:0 auto;background:#121216;border:1px solid #2a1116;border-radius:16px;padding:28px">
        <p style="font-family:monospace;font-size:11px;letter-spacing:.22em;color:#ff6a74;margin:0 0 16px">SECURINETS · ISET CHARGUIA</p>
        <h1 style="font-size:22px;margin:0 0 12px;color:#fff">Reset your password</h1>
        <p style="color:#a8a3b0;font-size:14px;line-height:1.6;margin:0 0 20px">
          Hi ${name}, we received a request to reset the password of your club account.
          The link below is valid for 30 minutes and can be used once.
        </p>
        <a href="${link}" style="display:inline-block;background:#b3001b;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;font-size:14px">Choose a new password</a>
        <p style="color:#6f6a78;font-size:12px;line-height:1.6;margin:22px 0 0">
          If you did not ask for this, ignore the email — your password stays unchanged.
        </p>
      </div>
    </div>`,
  });
  return { sent: true as const };
}
