import nodemailer from "nodemailer";
import { site } from "@/data/site";

const configured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

const transport = configured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT ?? 465),
      secure: Number(process.env.SMTP_PORT ?? 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

export const adminEmail = () => process.env.ADMIN_NOTIFY_EMAIL ?? site.email;

type Row = [label: string, value: string];

/** Plain, readable admin notification. Logged when SMTP is not configured. */
export async function notifyAdmin(subject: string, rows: Row[], action?: { label: string; url: string }) {
  const to = adminEmail();
  const text = [
    subject,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    action ? `${action.label}: ${action.url}` : "",
    "",
    `— ${site.name}`,
  ].join("\n");

  if (!transport) {
    console.info(`[notify] SMTP not configured — ${subject}\n${text}`);
    return { sent: false as const };
  }

  const html = `<div style="background:#0a0a0c;padding:28px;font-family:Inter,Arial,sans-serif;color:#f4f2f5">
    <div style="max-width:540px;margin:0 auto;background:#121216;border:1px solid #2a1116;border-radius:14px;padding:24px">
      <p style="font-family:monospace;font-size:11px;letter-spacing:.2em;color:#ff6a74;margin:0 0 14px">SECURINETS · ADMIN</p>
      <h1 style="font-size:20px;margin:0 0 16px;color:#fff">${subject}</h1>
      <table style="width:100%;font-size:14px;border-collapse:collapse">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="padding:5px 0;color:#8f8a98;width:38%">${label}</td><td style="padding:5px 0;color:#f4f2f5">${value}</td></tr>`,
          )
          .join("")}
      </table>
      ${
        action
          ? `<a href="${action.url}" style="display:inline-block;margin-top:18px;background:#b3001b;color:#fff;text-decoration:none;padding:11px 18px;border-radius:9px;font-weight:600;font-size:14px">${action.label}</a>`
          : ""
      }
    </div>
  </div>`;

  await transport.sendMail({
    from: process.env.MAIL_FROM ?? `Securinets ISET Charguia <${process.env.SMTP_USER}>`,
    to,
    subject: `[${site.shortName}] ${subject}`,
    text,
    html,
  });
  return { sent: true as const };
}
