"use client";

import { useState } from "react";
import { faq, site } from "@/data/site";
import { useI18n } from "@/lib/i18n";
import { PageHero } from "@/components/layout/page-hero";
import { Icon, type IconName } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function ContactPage() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(0);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "" });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const body = encodeURIComponent(`${form.message}\n\n— Sent from securinets-isetch.tn`);
    const subject = encodeURIComponent(form.subject || "Message from the website");
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const channels = [
    { label: t.contact.general, email: site.email, icon: "mail" as IconName },
    { label: t.contact.partnerships, email: "partners@securinets-isetch.tn", icon: "spark" as IconName },
    { label: t.contact.security, email: "security@securinets-isetch.tn", icon: "shield" as IconName },
  ];

  return (
    <>
      <PageHero kicker={t.contact.kicker} title={t.contact.title} intro={t.contact.intro} />

      <section className="section !pt-12">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {channels.map((channel) => (
                <a
                  key={channel.email}
                  href={`mailto:${channel.email}`}
                  className="group flex items-center gap-4 rounded-2xl border border-line/10 bg-elev/40 p-5 transition-colors hover:border-ember/30"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-line/10 text-ember">
                    <Icon name={channel.icon} size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted">
                      {channel.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-ink group-hover:text-ember">
                      {channel.email}
                    </span>
                  </span>
                  <Icon name="arrowUpRight" size={14} className="ms-auto text-muted" />
                </a>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-line/10 bg-elev/30 p-5">
                <div className="flex items-center gap-2 text-ember">
                  <Icon name="mapPin" size={15} />
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted">
                    {t.contact.address}
                  </span>
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{site.address}</p>
              </div>
              <div className="rounded-2xl border border-line/10 bg-elev/30 p-5">
                <div className="flex items-center gap-2 text-ember">
                  <Icon name="clock" size={15} />
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted">
                    {t.contact.hours}
                  </span>
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{t.contact.hoursValue}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-ember/20 bg-ember/[0.05] p-5">
              <div className="flex items-center gap-2 text-ember">
                <Icon name="shield" size={15} />
                <span className="font-mono text-[10px] uppercase tracking-[0.16em]">
                  {t.contact.security}
                </span>
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{t.contact.securityNote}</p>
            </div>

            <div className="mt-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                {t.contact.socialTitle}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {site.socials.map((social) => (
                  <a
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line/12 px-3.5 py-2 text-[12px] text-muted transition-colors hover:border-ember/30 hover:text-ink"
                  >
                    <Icon name={social.key as IconName} size={14} />
                    {social.handle}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line/10 bg-elev/40 p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{t.contact.formTitle}</h2>
            <p className="mt-1 text-[12.5px] text-muted">{t.contact.formNote}</p>

            <form onSubmit={submit} className="mt-6 space-y-5">
              <div>
                <label className="label" htmlFor="subject">
                  {t.contact.subject}
                </label>
                <input
                  id="subject"
                  className="input"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder={t.contact.subjectPlaceholder}
                />
              </div>
              <div>
                <label className="label" htmlFor="message">
                  {t.contact.message}
                </label>
                <textarea
                  id="message"
                  required
                  rows={7}
                  className="input resize-y"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder={t.contact.messagePlaceholder}
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                {t.contact.send}
                <Icon name="send" size={15} />
              </button>
              {sent ? (
                <p className="rounded-lg bg-jade/10 px-3 py-2 text-[12px] text-jade">{t.contact.sent}</p>
              ) : (
                <p className="text-center font-mono text-[9.5px] text-muted/50">
                  opens your mail client · {site.email}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 border-t border-line/10 py-20">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow mb-3">
                <span className="inline-block h-1 w-6 bg-ember" />
                FAQ
              </p>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">{t.contact.faqTitle}</h2>
              <p className="mt-2 max-w-xl text-[13.5px] text-muted">{t.contact.faqNote}</p>
            </div>
          </div>

          <div className="mt-8 divide-y divide-line/10 border-y border-line/10">
            {faq.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 py-5 text-start"
                  >
                    <span className={cn("text-[14.5px] font-medium", isOpen ? "text-ink" : "text-muted")}>
                      {item.q}
                    </span>
                    <span
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-transform",
                        isOpen ? "rotate-45 border-ember/40 text-ember" : "border-line/12 text-muted",
                      )}
                    >
                      <Icon name="close" size={12} className={isOpen ? "" : "rotate-45"} />
                    </span>
                  </button>
                  <div
                    className={cn(
                      "grid transition-all duration-300",
                      isOpen ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <p className="overflow-hidden text-[13.5px] leading-relaxed text-muted">{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
