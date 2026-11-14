"use client";

import Link from "next/link";
import { useState } from "react";
import { categories, faq } from "@/data/site";
import { useI18n } from "@/lib/i18n";
import { PageHero } from "@/components/layout/page-hero";
import { Icon, type IconName } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<"name" | "email" | "year" | "field" | "motivation" | "consent", string>>;

export function JoinPage() {
  const { t } = useI18n();
  const [values, setValues] = useState({
    name: "",
    email: "",
    year: "",
    field: "",
    motivation: "",
    consent: false,
    website: "",
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const set = (key: keyof typeof values, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next: Errors = {};
    if (values.name.trim().length < 3) next.name = t.join.validation.name;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) next.email = t.join.validation.email;
    if (!values.year) next.year = t.join.validation.year;
    if (values.field.trim().length < 2) next.field = t.join.validation.field;
    if (values.motivation.trim().length < 40) next.motivation = t.join.validation.motivation;
    if (!values.consent) next.consent = t.join.validation.consent;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, interests, consent: true }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <>
        <PageHero kicker={t.join.kicker} title={t.join.successTitle} intro={t.join.successBody} />
        <section className="section">
          <div className="container-x max-w-2xl">
            <div className="rounded-2xl border border-jade/25 bg-jade/[0.06] p-8">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-jade/40 text-jade">
                <Icon name="check" size={20} />
              </span>
              <p className="mt-4 text-[14px] leading-relaxed text-muted">{t.join.successBody}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/challenges" className="btn-primary">
                  {t.home.ctaChallenges}
                  <Icon name="arrowRight" size={15} />
                </Link>
                <Link href="/events" className="btn-ghost">
                  {t.nav.events}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        kicker={t.join.kicker}
        title={t.join.title}
        intro={t.join.intro}
        meta={
          <>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="clock" size={13} className="text-ember" />
              2 minutes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="check" size={13} className="text-ember" />
              {t.common.free} · ISET Charguia
            </span>
          </>
        }
      />

      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">{t.join.whyTitle}</h2>
            <ul className="mt-6 space-y-4">
              {t.join.why.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-ember/30 bg-ember/10 text-ember">
                    <Icon name="check" size={11} />
                  </span>
                  <span className="text-[13.5px] leading-relaxed text-muted">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-line/10 bg-elev/40 p-5">
              <div className="flex items-center gap-2">
                <Icon name="shield" size={15} className="text-ember" />
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  {t.about.conductTitle}
                </p>
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{t.about.conductBody}</p>
            </div>

            <div className="mt-8 border-t border-line/10 pt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{t.join.faqTitle}</p>
              <ul className="mt-3 space-y-2">
                {faq.slice(0, 3).map((item) => (
                  <li key={item.q}>
                    <Link
                      href="/contact#faq"
                      className="flex items-center justify-between gap-3 rounded-lg py-1.5 text-[12.5px] text-muted hover:text-ink"
                    >
                      {item.q}
                      <Icon name="chevronRight" size={13} className="shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <form
            onSubmit={submit}
            noValidate
            className="rounded-2xl border border-line/10 bg-elev/40 p-6 sm:p-8"
          >
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{t.join.formTitle}</h2>
            <p className="mt-1 text-[12.5px] text-muted">{t.join.formNote}</p>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="name">
                  {t.join.name} <span className="text-ember">*</span>
                </label>
                <input
                  id="name"
                  className="input"
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder={t.join.namePlaceholder}
                  aria-invalid={Boolean(errors.name)}
                  autoComplete="name"
                />
                {errors.name ? <p className="mt-1.5 text-[11px] text-ember">{errors.name}</p> : null}
              </div>

              <div className="sm:col-span-2">
                <label className="label" htmlFor="email">
                  {t.join.email} <span className="text-ember">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  value={values.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder={t.join.emailPlaceholder}
                  aria-invalid={Boolean(errors.email)}
                  autoComplete="email"
                />
                {errors.email ? <p className="mt-1.5 text-[11px] text-ember">{errors.email}</p> : null}
              </div>

              <div>
                <label className="label" htmlFor="year">
                  {t.join.year} <span className="text-ember">*</span>
                </label>
                <select
                  id="year"
                  className="input"
                  value={values.year}
                  onChange={(e) => set("year", e.target.value)}
                  aria-invalid={Boolean(errors.year)}
                >
                  <option value="">{t.join.yearPlaceholder}</option>
                  {t.join.years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.year ? <p className="mt-1.5 text-[11px] text-ember">{errors.year}</p> : null}
              </div>

              <div>
                <label className="label" htmlFor="field">
                  {t.join.field} <span className="text-ember">*</span>
                </label>
                <input
                  id="field"
                  className="input"
                  value={values.field}
                  onChange={(e) => set("field", e.target.value)}
                  placeholder={t.join.fieldPlaceholder}
                  aria-invalid={Boolean(errors.field)}
                />
                {errors.field ? <p className="mt-1.5 text-[11px] text-ember">{errors.field}</p> : null}
              </div>

              <div className="sm:col-span-2">
                <span className="label">{t.join.interests}</span>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => {
                    const on = interests.includes(cat.slug);
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() =>
                          setInterests((prev) =>
                            on ? prev.filter((x) => x !== cat.slug) : [...prev, cat.slug],
                          )
                        }
                        aria-pressed={on}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] transition-colors",
                          on ? "text-ink" : "border-line/12 text-muted hover:text-ink",
                        )}
                        style={on ? { borderColor: `${cat.accent}66`, backgroundColor: `${cat.accent}14` } : undefined}
                      >
                        <Icon name={cat.icon as IconName} size={12} style={{ color: cat.accent }} />
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-[11px] text-muted/60">{t.join.interestsNote}</p>
              </div>

              <div className="sm:col-span-2">
                <label className="label" htmlFor="motivation">
                  {t.join.motivation} <span className="text-ember">*</span>
                </label>
                <textarea
                  id="motivation"
                  rows={4}
                  className="input resize-y"
                  value={values.motivation}
                  onChange={(e) => set("motivation", e.target.value)}
                  placeholder={t.join.motivationPlaceholder}
                  aria-invalid={Boolean(errors.motivation)}
                />
                <div className="mt-1.5 flex items-start justify-between gap-3">
                  {errors.motivation ? (
                    <p className="text-[11px] text-ember">{errors.motivation}</p>
                  ) : (
                    <span />
                  )}
                  <span className="shrink-0 font-mono text-[10px] text-muted/50">
                    {values.motivation.trim().length}/40
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line/10 bg-base/30 p-4">
                  <input
                    type="checkbox"
                    checked={values.consent}
                    onChange={(e) => set("consent", e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#B3001B]"
                    aria-invalid={Boolean(errors.consent)}
                  />
                  <span className="text-[12.5px] leading-relaxed text-muted">{t.join.consent}</span>
                </label>
                {errors.consent ? <p className="mt-1.5 text-[11px] text-ember">{errors.consent}</p> : null}
              </div>

              {/* honeypot */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.website}
                  onChange={(e) => set("website", e.target.value)}
                />
              </div>
            </div>

            {status === "error" ? (
              <p className="mt-5 rounded-lg bg-ember/10 px-3 py-2 text-[12px] text-ember">{t.join.error}</p>
            ) : null}

            <button type="submit" disabled={status === "loading"} className="btn-primary mt-7 w-full">
              {status === "loading" ? t.join.submitting : t.join.submit}
              <Icon name="arrowRight" size={16} />
            </button>
            <p className="mt-3 text-center font-mono text-[10px] text-muted/50">
              We never share your data. Unsubscribe any time.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
