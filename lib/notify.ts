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

const shell = (title: string, body: string, cta?: { label: string; url: string }) => `
<div style="background:#0a0a0c;padding:28px;font-family:system-ui,sans-serif;color:#f4f2f5">
  <div style="max-width:520px;margin:0 auto">
    <p style="font-family:monospace;font-size:11px;letter-spacing:.18em;color:#ff5a66;margin:0 0 18px">SECURINETS · ISET CHARGUIA</p>
    <h1 style="font-size:22px;margin:0 0 14px">${title}</h1>
    <div style="font-size:14px;line-height:1.6;color:#d8d4dc">${body}</div>
    ${
      cta
        ? `<p style="margin:26px 0 0"><a href="${cta.url}" style="background:#b3001b;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;display:inline-block">${cta.label}</a></p>`
        : ""
    }
    <p style="margin-top:26px;font-size:12px;color:#8f8a97">Securinets ISET Charguia · Tunis · <a href="${site.url}" style="color:#ff5a66">${site.url}</a></p>
  </div>
</div>`;

/** Tells a member their account was approved, so they know why login now works. */
export async function sendApproved(to: string, name: string) {
  const link = `${site.url}/login`;
  if (!transport) {
    console.log(`[mail] approved ${to} (SMTP not configured)`);
    return;
  }
  await transport.sendMail({
    from: process.env.MAIL_FROM ?? `Securinets ISET Charguia <${process.env.SMTP_USER}>`,
    to,
    subject: "Your club account is approved — welcome",
    html: shell(
      `Welcome, ${name.split(" ")[0]}`,
      "Your membership was approved. The full challenge range, hints and the scoreboard are now open to you.<br/><br/>Use the email and password you chose when you registered.",
      { label: "Open the challenge range", url: link },
    ),
  });
}

/** Confirms a newsletter subscription so the form is not a dead end. */
export async function sendSubscribed(to: string) {
  if (!transport) {
    console.log(`[mail] subscribed ${to} (SMTP not configured)`);
    return;
  }
  await transport.sendMail({
    from: process.env.MAIL_FROM ?? `Securinets ISET Charguia <${process.env.SMTP_USER}>`,
    to,
    subject: "You're on the list — Securinets ISET Charguia",
    html: shell(
      "You're on the list",
      "We send one email a month: workshop dates, CTF announcements, and writeups.<br/><br/>This is only the mailing list — it does not create an account. To access the challenge range, register and wait for approval.",
      { label: "Create an account", url: `${site.url}/register` },
    ),
  });
}
