#!/usr/bin/env node
/**
 * Send a test email with the same SMTP settings the site uses:
 *
 *   npm run mail:test -- you@example.com
 */
import nodemailer from "nodemailer";

const to = process.argv[2];
if (!to) {
  console.error("Usage: npm run mail:test -- you@example.com");
  process.exit(1);
}

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

if (!user || !pass) {
  console.error("SMTP_USER / SMTP_PASS are missing in this environment.");
  process.exit(1);
}

console.log("SMTP_USER:", user);
console.log("SMTP_PASS length:", pass.length, "(Gmail app passwords are 16)");

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: Number(process.env.SMTP_PORT ?? 465) === 465,
  auth: { user, pass },
});

try {
  await transport.verify();
  console.log("SMTP connection OK");
  const info = await transport.sendMail({
    from: process.env.MAIL_FROM ?? `Securinets ISET Charguia <${user}>`,
    to,
    subject: "Securinets ISET Charguia — SMTP test",
    text: "If you can read this, password reset and admin notifications will work.",
  });
  console.log("Sent:", info.messageId);
} catch (error) {
  console.error("FAILED:", error.message);
  process.exit(1);
}
