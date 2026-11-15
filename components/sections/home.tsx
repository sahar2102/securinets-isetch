"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { categories, partners, pillars, site, stats, values } from "@/data/site";
import type { EventItem, PublicChallenge } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { MatrixRain } from "@/components/effects/matrix-rain";
import { Terminal } from "@/components/effects/terminal";
import { Seal } from "@/components/ui/brand";
import { Counter, Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import { Icon, type IconName } from "@/components/ui/icons";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { PhotoWall } from "./photo-wall";

import { Playground } from "./playground";
import { cn, daysUntil, formatDate } from "@/lib/utils";

interface HomeProps {
  challenges: PublicChallenge[];
  featured: PublicChallenge[];
  nextEvent: EventItem | null;
  counts: { total: number; solves: number };
  announcements: { id: string; title: string; body: string; tag: string; date: string }[];
}


function OpsBar({ event }: { event: EventItem | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  if (!event) return null;
  const target = new Date(`${event.date}T14:00:00`).getTime();
  const days = Math.max(0, Math.ceil((target - now) / 86_400_000));
  return (
    <section className="border-y border-line/10 bg-ember/[0.04]">
      <div className="container-x flex flex-wrap items-center gap-x-8 gap-y-3 py-4">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ember">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ember" />
          </span>
          next operation
        </span>
        <span className="text-[13px] font-medium text-ink">{event.title}</span>
        <span className="font-mono text-[11px] text-muted">
          {formatDate(event.date)} · {event.time} · {event.location}
        </span>
        <span className="ms-auto font-mono text-[11px] uppercase tracking-[0.14em] text-ember">
          {days === 0 ? "today" : `T-${days} days`}
        </span>
        <Link href="/events" className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink/80 hover:text-ember">
          briefing →
        </Link>
      </div>
    </section>
  );
}


function Hero({ challengeCount }: { challengeCount: number }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate -mt-[68px] flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28">
      {/* backdrop */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-canvas" />
      <div aria-hidden className="absolute inset-0 -z-10 grid-lines mask-fade-b opacity-70" />
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.55] [mask-image:radial-gradient(ellipse_at_60%_35%,black,transparent_72%)]">
        <MatrixRain />
      </div>
      <div
        aria-hidden
        className="absolute -top-32 right-[-10%] -z-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(179,0,27,0.4),transparent_65%)] blur-3xl"
      />
      <div
        aria-hidden
        className="absolute bottom-[-20%] left-[-10%] -z-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,45,61,0.18),transparent_70%)] blur-3xl"
      />

      <div className="container-x relative w-full">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2.5 rounded-full border border-ember/25 bg-ember/[0.07] px-3 py-1.5"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ember" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember/90">
                {t.home.badge}
              </span>
            </motion.div>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-display-md font-display font-bold tracking-[-0.04em] text-ink hero-title"
            >
              {t.home.titleTop}
              <span className="mt-1 block bg-[linear-gradient(92deg,#FF5A66_0%,#B3001B_55%,#7a0013_100%)] bg-clip-text text-transparent">
                {t.home.titleAccent}
              </span>
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-xl text-pretty text-[15px] leading-relaxed text-muted sm:text-base"
            >
              {t.home.subtitle}
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.26 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link href="/join" className="btn-primary group">
                {t.home.ctaJoin}
                <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/challenges" className="btn-ghost group !border-ember/30 hover:!bg-ember/[0.06]">
                <span className="font-mono text-ember">&gt;_</span>
                {t.home.ctaChallenges}
              </Link>
            </motion.div>

            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted/70"
            >
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check" size={12} className="text-jade" />
                {t.home.ctaNote}
              </span>
            </motion.p>
          </div>

          {/* seal + terminal */}
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-[520px]"
          >
            <div className="pointer-events-none absolute -right-6 -top-10 hidden opacity-90 sm:block lg:-right-10">
              <Seal size={300} />
            </div>

            <div className="relative mt-4 sm:mt-32 lg:mt-40">
              <div
                aria-hidden
                className="absolute -inset-x-6 -inset-y-6 rounded-[28px] bg-[radial-gradient(ellipse_at_top,rgba(255,45,61,0.18),transparent_60%)] blur-xl"
              />
              <Terminal className="relative" />

            </div>
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted/50">
          {t.home.scroll}
        </span>
        <span className="h-8 w-px bg-gradient-to-b from-ember/60 to-transparent" />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function TrustStrip() {
  const items = categories.map((c) => c.name);
  return (
    <div className="relative overflow-hidden border-y border-line/10 bg-soft/60 py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-canvas to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-canvas to-transparent" />
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center gap-8" aria-hidden={dup === 1}>
            {items.map((item, i) => (
              <span key={item} className="flex items-center gap-8">
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted/60">
                  {item}
                </span>
                <span className="h-1 w-1 rounded-full bg-ember/50" />
                {i === items.length - 1 ? (
                  <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-ember/70">
                    CTF
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function NoticeBar({ items }: { items: HomeProps["announcements"] }) {
  const { t } = useI18n();
  if (!items.length) return null;
  const latest = items[0];

  return (
    <div className="border-b border-line/10 bg-elev/30">
      <div className="container-x flex flex-wrap items-center gap-x-4 gap-y-1.5 py-3">
        <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-ember">
          <span className="h-1.5 w-1.5 rounded-full bg-ember" />
          {latest.tag}
        </span>
        <p className="min-w-0 flex-1 truncate text-[12.5px] text-muted">
          <span className="text-ink">{latest.title}</span> — {latest.body}
        </p>
        <Link
          href="/events"
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted transition-colors hover:text-ink"
        >
          {t.home.upcomingCta} ↗
        </Link>
      </div>
    </div>
  );
}

function StatsBar({ challengeCount }: { challengeCount: number }) {
  const { t } = useI18n();
  const items = [
    { value: 84, suffix: "+", label: t.home.stats.members },
    { value: challengeCount, suffix: "", label: t.home.stats.challenges },
    { value: 12, suffix: "", label: t.home.stats.events },
    { value: 27, suffix: "", label: t.home.stats.writeups },
  ];

  return (
    <section className="border-b border-line/10">
      <div className="container-x">
        <dl className="grid grid-cols-2 divide-line/10 lg:grid-cols-4 lg:divide-x">
          {items.map((item, i) => (
            <Reveal key={item.label} delay={i * 0.06}>
              <div className={cn("px-2 py-8 sm:px-6", i > 1 && "border-t border-line/10 lg:border-t-0")}>
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{item.label}</dt>
                <dd className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                  <Counter value={item.value} suffix={item.suffix} />
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function AboutPreview() {
  const { t } = useI18n();

  return (
    <section className="section">
      <div className="container-x grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <div>
          <p className="eyebrow mb-4">
            <span className="inline-block h-1 w-6 bg-ember" />
            {t.home.aboutKicker}
          </p>
          <h2 className="text-balance font-display text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-4xl">
            {t.home.aboutTitle}
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-muted">{t.home.aboutBody}</p>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{t.home.aboutBody2}</p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link href="/about" className="btn-quiet group">
              {t.home.aboutCta}
              <Icon name="arrowRight" size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted/60">
              Est. 2026 · Tunis
            </span>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 border-t border-line/10 pt-8">
            <div>
              <p className="font-display text-2xl font-semibold text-ink">{site.founded}</p>
              <p className="mt-1 text-[12px] leading-snug text-muted">{t.footer.parent}</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-ink">
                {stats.find((item) => item.key === "members")?.value}+
              </p>
              <p className="mt-1 text-[12px] leading-snug text-muted">{t.home.stats.members}</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(179,0,27,0.12),transparent_70%)] blur-2xl" />
          <div className="overflow-hidden rounded-2xl border border-line/10 bg-elev/40">
            <div className="flex items-center justify-between border-b border-line/10 px-5 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                what-we-run
              </span>
              <span className="font-mono text-[10px] text-muted/50">4 modules</span>
            </div>
            <ul>
              {pillars.map((pillar, i) => (
                <li key={pillar.key}>
                  <Link
                    href="/about#what"
                    className="group flex items-start gap-4 border-b border-line/8 px-5 py-5 transition-colors last:border-0 hover:bg-line/[0.03]"
                  >
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line/10 bg-canvas/60 text-ember transition-colors group-hover:border-ember/40">
                      <Icon name={pillar.icon as IconName} size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-[14px] font-semibold text-ink">{pillar.title}</span>
                        <span className="font-mono text-[9px] text-muted/50">0{i + 1}</span>
                      </span>
                      <span className="mt-1 block text-[12.5px] leading-relaxed text-muted">
                        {pillar.body}
                      </span>
                      <span className="mt-2 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted/60">
                        {pillar.meta}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedChallenges({ challenges }: { challenges: PublicChallenge[] }) {
  const { t } = useI18n();

  return (
    <section className="relative border-y border-line/10 bg-soft/50 py-20 sm:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
      <div className="container-x relative">
        <SectionHeading
          kicker={t.home.challengesKicker}
          title={t.home.challengesTitle}
          body={t.home.challengesBody}
          action={
            <Link href="/challenges" className="btn-ghost group">
              {t.home.challengesCta}
              <Icon name="arrowRight" size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          }
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge, i) => (
            <ChallengeCard key={challenge.slug} challenge={challenge} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function UpcomingEvent({ event }: { event: EventItem }) {
  const { t, locale } = useI18n();
  const date = new Date(`${event.date}T00:00:00Z`);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = date.toLocaleString("en-GB", { month: "short", timeZone: "UTC" }).toUpperCase();
  const days = daysUntil(event.date);
  const pct = event.capacity ? Math.round(((event.registered ?? 0) / event.capacity) * 100) : null;

  return (
    <section className="section">
      <div className="container-x">
        <SectionHeading
          kicker={t.home.upcomingKicker}
          title={t.home.upcomingTitle}
          action={
            <Link href="/events" className="btn-ghost">
              {t.home.upcomingCta}
              <Icon name="arrowRight" size={15} />
            </Link>
          }
        />

        <Reveal className="mt-10">
          <div className="relative overflow-hidden rounded-3xl border border-ember/20 bg-[linear-gradient(120deg,rgba(139,0,0,0.22),rgba(18,18,22,0.6)_55%,rgba(10,10,12,0.9))] p-1">
            <div className="grid gap-0 overflow-hidden rounded-[22px] bg-canvas/60 lg:grid-cols-[auto_1fr_auto]">
              <div className="flex items-center gap-5 border-b border-line/10 p-6 lg:flex-col lg:justify-center lg:border-b-0 lg:border-e lg:px-10">
                <div className="text-center">
                  <p className="font-display text-5xl font-bold leading-none tracking-tight text-ink">{day}</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.24em] text-ember">{month}</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                    {date.getUTCFullYear()}
                  </p>
                </div>
                {days >= 0 ? (
                  <span className="rounded-full border border-ember/30 bg-ember/10 px-2.5 py-1 font-mono text-[10px] text-ember">
                    in {days} days
                  </span>
                ) : null}
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip !text-ember !border-ember/30">{event.kind.toUpperCase()}</span>
                  <span className="chip">{event.level}</span>
                  <span className="chip">{event.language}</span>
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink">
                  {event.title}
                </h3>
                <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-muted">
                  {locale === "fr" ? event.summary : event.summaryEn ?? event.summary}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="clock" size={13} className="text-ember" />
                    {event.time}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="mapPin" size={13} className="text-ember" />
                    {event.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="calendar" size={13} className="text-ember" />
                    {formatDate(event.date)}
                  </span>
                </div>

                {pct !== null ? (
                  <div className="mt-6 max-w-sm">
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                      <span>
                        {event.registered}/{event.capacity} {t.events.registered}
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-crimson-deep via-crimson to-ember"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center border-t border-line/10 p-6 lg:border-s lg:border-t-0 lg:px-8">
                <div className="w-full">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    {t.events.speakers}
                  </p>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-ink">
                    {event.speakers.join(" · ")}
                  </p>
                  <Link
                    href={event.registrationUrl ?? "/join"}
                    className="btn-primary mt-4 w-full !py-2.5 !text-[13px]"
                  >
                    {t.home.register}
                    <Icon name="arrowRight" size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Values() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden border-y border-line/10 bg-soft/40 py-20 sm:py-24">
      <div className="container-x">
        <SectionHeading
          kicker={t.home.valuesKicker}
          title={t.home.valuesTitle}
          align="center"
        />
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, i) => (
            <StaggerItem key={value.key}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-line/10 bg-canvas/40 p-6 transition-colors hover:border-ember/30">
                <span className="font-mono text-[11px] text-ember/70">0{i + 1}</span>
                <h3 className="mt-4 font-display text-[17px] font-semibold leading-snug tracking-tight text-ink">
                  {value.title}
                </h3>
                <p className="mt-2.5 text-[13px] leading-relaxed text-muted">{value.body}</p>
                <span className="absolute -bottom-6 -right-2 font-display text-7xl font-bold text-line/[0.04] transition-colors group-hover:text-ember/[0.06]">
                  0{i + 1}
                </span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Partners() {
  const { t } = useI18n();
  return (
    <section className="py-16">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow mb-3">
              <span className="inline-block h-1 w-6 bg-ember" />
              {t.home.partnersKicker}
            </p>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
              {t.home.partnersTitle}
            </h2>
          </div>
          <Link href="/contact" className="link-underline text-[13px] text-muted hover:text-ink">
            {t.home.partnerCta} ↗
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line/10 bg-line/10 sm:grid-cols-3 lg:grid-cols-6">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="group flex min-h-[92px] flex-col justify-center gap-1 bg-canvas px-4 py-5 transition-colors hover:bg-elev/60"
            >
              <span className="font-display text-[15px] font-semibold tracking-tight text-muted transition-colors group-hover:text-ink">
                {partner.name}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted/50">
                {partner.kind}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-4 max-w-xl text-[12.5px] leading-relaxed text-muted/70">{t.home.partnersBody}</p>
      </div>
    </section>
  );
}

function FinalCta() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden border-t border-line/10 py-20 sm:py-28">
      <div aria-hidden className="absolute inset-0 grid-lines opacity-40" />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(179,0,27,0.28),transparent_70%)] blur-3xl"
      />
      <div className="container-x relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow justify-center">
            <span className="h-1 w-6 bg-ember" />
            {t.home.contactKicker}
          </p>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">
            {t.home.contactTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {t.home.contactBody}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/join" className="btn-primary">
              {t.nav.join}
              <Icon name="arrowRight" size={16} />
            </Link>
            <Link href="/contact" className="btn-ghost">
              {t.home.contactCta}
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-line/10 bg-elev/40 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">{t.home.newsletterTitle}</h3>
              <p className="mt-1 text-[13px] text-muted">{t.home.newsletterBody}</p>
            </div>
            <div className="w-full sm:max-w-xs">
              <NewsletterForm compact />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeSections({ challenges, featured, nextEvent, counts, announcements }: HomeProps) {
  return (
    <>
      <Hero challengeCount={counts.total} />
      <TrustStrip />
      <NoticeBar items={announcements} />
      <StatsBar challengeCount={counts.total} />
      <Playground />
      {nextEvent ? <UpcomingEvent event={nextEvent} /> : null}
      <AboutPreview />
      <FeaturedChallenges challenges={featured} />
      <Values />
      <PhotoWall />
      <Partners />
      <FinalCta />
    </>
  );
}
