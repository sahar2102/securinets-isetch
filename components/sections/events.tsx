"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { EventItem } from "@/lib/types";
import gallery from "@/data/gallery.json";
import { Reel } from "./reel";
import { useI18n } from "@/lib/i18n";
import { PageHero } from "@/components/layout/page-hero";
import { Icon } from "@/components/ui/icons";
import { cn, daysUntil, formatDate } from "@/lib/utils";

type Tab = "upcoming" | "past" | "calendar";

export function EventsPage({ events }: { events: EventItem[] }) {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(null);

  const upcoming = useMemo(
    () => events.filter((e) => e.status === "upcoming").sort((a, b) => (a.date > b.date ? 1 : -1)),
    [events],
  );
  const past = useMemo(
    () => events.filter((e) => e.status === "past").sort((a, b) => (a.date < b.date ? 1 : -1)),
    [events],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: "upcoming", label: t.events.upcoming },
    { key: "past", label: t.events.past },
    { key: "calendar", label: t.events.calendar },
  ];

  return (
    <>
      <PageHero
        kicker={t.events.kicker}
        title={t.events.title}
        intro={t.events.intro}
        actions={
          <>
            <Link href="/register" className="btn-primary">
              {t.events.register}
              <Icon name="arrowRight" size={15} />
            </Link>
            <Link href="#calendar" onClick={() => setTab("calendar")} className="btn-ghost">
              <Icon name="calendar" size={15} />
              {t.events.calendar}
            </Link>
          </>
        }
        meta={
          <>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="calendar" size={13} className="text-ember" />
              {events.length} events on record
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="users" size={13} className="text-ember" />
            </span>
          </>
        }
      />

      <Reel />

      <section className="section" id="calendar">
        <div className="container-x">
          <div className="mb-10 flex w-full items-center gap-1 rounded-full border border-line/10 bg-elev/40 p-1 sm:w-fit">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                aria-pressed={tab === item.key}
                className={cn(
                  "relative flex-1 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors sm:flex-none",
                  tab === item.key ? "text-white" : "text-muted hover:text-ink",
                )}
              >
                {tab === item.key ? (
                  <motion.span
                    layoutId="event-tab"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-crimson-deep to-crimson"
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  />
                ) : null}
                <span className="relative">{item.label}</span>
                {item.key === "upcoming" && upcoming.length ? (
                  <span className="relative ms-1.5 font-mono text-[10px] opacity-70">{upcoming.length}</span>
                ) : null}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === "upcoming" ? (
              <motion.div
                key="upcoming"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {upcoming.length === 0 ? (
                  <p className="rounded-2xl border border-line/10 bg-elev/40 p-10 text-center text-sm text-muted">
                    {t.events.noUpcoming}
                  </p>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {upcoming.map((event) => (
                      <UpcomingCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : null}

            {tab === "past" ? (
              <motion.div
                key="past"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="relative"
              >
                <div
                  aria-hidden
                  className="absolute bottom-4 start-[85px] top-4 hidden w-px bg-gradient-to-b from-ember/40 via-line/15 to-transparent sm:block"
                />
                <div className="space-y-6">
                  {past.map((event) => (
                    <article key={event.id} className="relative sm:grid sm:grid-cols-[86px_1fr] sm:gap-6">
                      <div className="mb-3 flex items-baseline gap-3 sm:mb-0 sm:block sm:text-end">
                        <p className="font-display text-2xl font-semibold text-ink">
                          {new Date(`${event.date}T00:00:00Z`).getUTCDate()}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ember">
                          {new Date(`${event.date}T00:00:00Z`).toLocaleString("en-GB", {
                            month: "short",
                            year: "numeric",
                            timeZone: "UTC",
                          })}
                        </p>
                        <span className="mt-2 hidden h-2.5 w-2.5 translate-x-[5px] rounded-full border border-ember/50 bg-canvas sm:block sm:ms-auto" />
                      </div>

                      <div className="overflow-hidden rounded-2xl border border-line/10 bg-elev/40">
                        <div className="flex flex-wrap items-center gap-2 border-b border-line/8 px-5 py-3">
                          <span className="chip !border-ember/30 !text-ember">{event.kind}</span>
                          {event.slug === "introduction-a-la-cybersecurite" ? (
                            <span className="chip !border-jade/30 !text-jade">{t.events.firstEventBadge}</span>
                          ) : null}
                          <span className="ms-auto font-mono text-[10px] text-muted/60">
                            {event.attendees ? `${event.attendees} ${t.events.attendees}` : ""}
                          </span>
                        </div>

                        <div className="p-5 sm:p-6">
                          <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                            {locale === "fr" ? event.title : event.titleEn ?? event.title}
                          </h2>
                          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted">
                            {locale === "fr" ? event.summary : event.summaryEn ?? event.summary}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] text-muted">
                            <span className="inline-flex items-center gap-1.5">
                              <Icon name="mapPin" size={12} className="text-ember" />
                              {event.location}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Icon name="clock" size={12} className="text-ember" />
                              {event.time}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Icon name="users" size={12} className="text-ember" />
                              {event.speakers.join(", ")}
                            </span>
                          </div>

                          {event.gallery?.length ? (
                            <div className="mt-5 grid grid-cols-3 gap-2">
                              {event.gallery.map((image) => (
                                <button
                                  key={image.src}
                                  type="button"
                                  onClick={() => setLightbox(image)}
                                  className="group relative aspect-[16/10] overflow-hidden rounded-lg border border-line/10"
                                >
                                  <Image
                                    src={image.src}
                                    alt={image.caption}
                                    fill
                                    sizes="(max-width: 768px) 30vw, 220px"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                  <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                  <span className="absolute inset-x-2 bottom-1.5 line-clamp-1 text-start text-[10px] text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
                                    {image.caption}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : null}

                          {event.recording ? (
                            <a
                              href={event.recording}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] text-ember hover:underline"
                            >
                              {t.events.recording}
                              <Icon name="external" size={12} />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </motion.div>
            ) : null}

            {tab === "calendar" ? (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="grid gap-6 lg:grid-cols-[1.4fr_1fr]"
              >
                <SeasonCalendar events={events} />
                <div className="rounded-2xl border border-line/10 bg-elev/40 p-6">
                  <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    {t.events.upcoming}
                  </h2>
                  <ul className="mt-4 space-y-4">
                    {upcoming.map((event) => (
                      <li key={event.id} className="flex gap-3">
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-ember" />
                        <div>
                          <p className="text-[13.5px] font-medium text-ink">{event.title}</p>
                          <p className="mt-0.5 font-mono text-[10.5px] text-muted">
                            {formatDate(event.date)} · {event.time} · {event.location}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 border-t border-line/10 pt-5">
                    <p className="text-[12.5px] leading-relaxed text-muted">
                      {t.events.intro}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {lightbox ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={lightbox.caption}
            onClick={() => setLightbox(null)}
          >
            <motion.figure
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0f]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[3/2] w-full">
                <Image src={lightbox.src} alt={lightbox.caption} fill sizes="90vw" className="object-cover" />
              </div>
              <figcaption className="flex items-center justify-between gap-4 px-5 py-4">
                <span className="text-[13px] text-white/80">{lightbox.caption}</span>
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  className="rounded-full border border-white/15 p-2 text-white/70 hover:text-white"
                  aria-label={t.common.close}
                >
                  <Icon name="close" size={16} />
                </button>
              </figcaption>
            </motion.figure>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function UpcomingCard({ event }: { event: EventItem }) {
  const { t, locale } = useI18n();
  const days = daysUntil(event.date);
  const closed = event.registrationOpen === false;
  const pct = event.capacity ? Math.min(100, Math.round(((event.registered ?? 0) / event.capacity) * 100)) : null;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line/10 bg-elev/40 transition-colors hover:border-ember/30">
      {event.featured ? (
        <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember to-transparent" />
      ) : null}
      <div className="flex flex-wrap items-center gap-2 border-b border-line/8 px-5 py-3">
        <span className="chip !border-ember/30 !text-ember">{event.kind}</span>
        <span className="chip">{event.level}</span>
        {days >= 0 ? (
          <span className="ms-auto font-mono text-[10px] uppercase tracking-[0.14em] text-ember">
            in {days} days
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold leading-snug tracking-tight text-ink">
          {locale === "fr" ? event.title : event.titleEn ?? event.title}
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
          {locale === "fr" ? event.summary : event.summaryEn ?? event.summary}
        </p>

        <div className="mt-4 grid gap-2 font-mono text-[11px] text-muted">
          <span className="inline-flex items-center gap-2">
            <Icon name="calendar" size={13} className="text-ember" />
            {formatDate(event.date)} · {event.time}
          </span>
          <span className="inline-flex items-center gap-2">
            <Icon name="mapPin" size={13} className="text-ember" />
            {event.location}
          </span>
          <span className="inline-flex items-center gap-2">
            <Icon name="mic" size={13} className="text-ember" />
            {event.speakers.join(" · ")}
          </span>
        </div>

        {event.prizes?.length ? (
          <div className="mt-4 rounded-lg border border-line/8 bg-line/[0.02] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">{t.events.prizes}</p>
            <ul className="mt-1.5 space-y-0.5">
              {event.prizes.map((prize) => (
                <li key={prize} className="text-[12px] text-muted">
                  {prize}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {pct !== null ? (
          <div className="mt-5">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              <span>
                {event.registered}/{event.capacity} {t.events.registered}
              </span>
              <span>{pct}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-crimson-deep via-crimson to-ember"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-auto pt-5">
          {closed ? (
            <span className="inline-flex w-full items-center justify-center rounded-full border border-line/10 px-4 py-2.5 text-[12.5px] text-muted">
              {t.events.registrationClosed}
            </span>
          ) : (
            <Link href={event.registrationUrl ?? "/register"} className="btn-primary w-full !py-2.5 !text-[13px]">
              {t.events.register}
              <Icon name="arrowRight" size={15} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function SeasonCalendar({ events }: { events: EventItem[] }) {
  // Show the months that actually contain events, max 3.
  const months = Array.from(
    new Set(events.map((e) => e.date.slice(0, 7))),
  ).sort() as string[];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {months.slice(-4).map((month) => {
        const [year, m] = month.split("-").map(Number);
        const first = new Date(Date.UTC(year, m - 1, 1));
        const daysInMonth = new Date(Date.UTC(year, m, 0)).getUTCDate();
        const startOffset = (first.getUTCDay() + 6) % 7; // Monday first
        const dayEvents = events.filter((e) => e.date.startsWith(month));

        return (
          <div key={month} className="rounded-2xl border border-line/10 bg-elev/40 p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-[15px] font-semibold text-ink">
                {first.toLocaleString("en-GB", { month: "long", timeZone: "UTC" })} {year}
              </h3>
              <span className="font-mono text-[10px] text-muted/60">{dayEvents.length} events</span>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1 text-center font-mono text-[9px] text-muted/40">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={`${d}-${i}`}>{d}</span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {Array.from({ length: startOffset }).map((_, i) => (
                <span key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const iso = `${month}-${String(day).padStart(2, "0")}`;
                const items = dayEvents.filter((e) => e.date === iso);
                return (
                  <div
                    key={iso}
                    title={items.map((e) => e.title).join(" · ")}
                    className={cn(
                      "relative grid aspect-square place-items-center rounded-md text-[11px]",
                      items.length
                        ? "bg-ember/15 font-semibold text-ember"
                        : "text-muted/60 hover:bg-line/5",
                    )}
                  >
                    {day}
                    {items.length ? (
                      <span className="absolute bottom-1 h-0.5 w-0.5 rounded-full bg-ember" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <section className="border-t border-line/10 py-16">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember">Gallery</p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
                Straight from the room.
              </h2>
            </div>
            <a href="/#archive" className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted hover:text-ember">
              full archive →
            </a>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.photos.slice(0, 12).map((photo) => (
              <div key={photo.src} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line/10">
                <Image src={photo.src} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition duration-500 hover:scale-105" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
