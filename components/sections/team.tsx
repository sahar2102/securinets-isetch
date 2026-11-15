"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TeamMember } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { PageHero } from "@/components/layout/page-hero";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const ORDER: TeamMember["team"][] = ["board", "tech", "hr", "comms", "events"];

export function TeamPage({ members }: { members: TeamMember[] }) {
  const { t, locale } = useI18n();
  const [filter, setFilter] = useState<"all" | TeamMember["team"]>("all");
  const [active, setActive] = useState<TeamMember | null>(null);

  const groups = useMemo(
    () => ORDER.filter((key) => members.some((m) => m.team === key)),
    [members],
  );
  const visible = filter === "all" ? members : members.filter((m) => m.team === filter);

  return (
    <>
      <PageHero
        kicker={t.team.kicker}
        title={t.team.title}
        intro={t.team.intro}
        meta={
          <>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="users" size={13} className="text-ember" />
              {members.length} {t.team.people}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="layers" size={13} className="text-ember" />
              {groups.length} {t.team.teams}
            </span>
          </>
        }
      />

      <section className="section pt-12">
        <div className="container-x">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              aria-pressed={filter === "all"}
              className={cn("chip transition", filter === "all" && "!border-ember/40 !bg-ember/10 !text-ember")}
            >
              {t.team.groups.all}
            </button>
            {groups.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={cn("chip transition", filter === key && "!border-ember/40 !bg-ember/10 !text-ember")}
              >
                {t.team.groups[key]}
              </button>
            ))}
          </div>

          {/* constellation: circles that lift, turn and open on touch */}
          <div className="mt-14 flex flex-wrap justify-center gap-x-4 gap-y-12 sm:gap-x-8">
            {visible.map((member, index) => (
              <motion.button
                key={member.id}
                type="button"
                onClick={() => setActive(member)}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (index % 6) * 0.05 }}
                className={cn(
                  "group relative flex w-[140px] flex-col items-center sm:w-[164px]",
                  index % 2 === 1 && "sm:translate-y-8",
                  index % 3 === 2 && "sm:-translate-y-3",
                )}
                aria-label={`${member.name} — ${member.role}`}
              >
                <span className="relative block h-[124px] w-[124px] sm:h-[148px] sm:w-[148px]">
                  {/* rotating dashed orbit */}
                  <span
                    aria-hidden
                    className="absolute -inset-2 rounded-full border border-dashed border-line/20 transition-all duration-700 group-hover:rotate-90 group-hover:border-ember/45"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full opacity-60 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: `radial-gradient(circle, ${member.accent}55, transparent 68%)` }}
                  />
                  <span className="relative block h-full w-full overflow-hidden rounded-full ring-1 ring-white/15">
                    <Image
                      src={member.photo || "/images/team/hacker.png"}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover grayscale-[55%] transition-all duration-700 group-hover:scale-[1.06] group-hover:grayscale-0"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-full mix-blend-screen"
                      style={{ background: `radial-gradient(circle at 30% 20%, ${member.accent}33, transparent 60%)` }}
                    />
                  </span>
                  <span
                    aria-hidden
                    className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-canvas transition-transform duration-500 group-hover:scale-125"
                    style={{ background: member.accent }}
                  />
                </span>

                <span className="mt-4 text-center">
                  <span className="block font-display text-[15px] font-semibold leading-tight text-ink transition-colors group-hover:text-ember">
                    {member.name}
                  </span>
                  <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                    {locale === "fr" && member.roleFr ? member.roleFr : member.role}
                  </span>
                </span>
                <span className="mt-2 h-px w-0 bg-ember/60 transition-all duration-500 group-hover:w-10" />
                <span className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 translate-y-2 whitespace-nowrap rounded-full border border-ember/35 bg-canvas/95 px-3 py-1 font-mono text-[8.5px] uppercase tracking-[0.14em] text-ember opacity-0 shadow-[0_10px_30px_-12px_rgba(255,45,61,0.7)] backdrop-blur transition-all duration-300 group-hover:-translate-y-4 group-hover:opacity-100">
                  {locale === "fr" && member.roleFr ? member.roleFr : member.role} · {t.team.groups[member.team]}
                </span>
              </motion.button>
            ))}
          </div>

          <p className="mt-16 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            tap a face to open the file
          </p>

          <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-2xl border border-line/10 bg-elev/40 p-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{t.team.joinTitle}</h2>
              <p className="mt-1.5 text-[13.5px] text-muted">{t.team.joinBody}</p>
            </div>
            <Link href="/join" className="btn-primary shrink-0">
              {t.team.joinCta}
              <Icon name="arrowRight" size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* profile sheet */}
      <AnimatePresence>
        {active ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
            aria-label={active.name}
          >
            <motion.div
              className="relative w-full max-w-md overflow-hidden rounded-t-2xl border border-line/15 bg-canvas sm:rounded-2xl"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-32 overflow-hidden">
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{ background: `radial-gradient(circle at 50% 120%, ${active.accent}55, transparent 70%)` }}
                />
                <div className="grid-lines absolute inset-0 opacity-40" />
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="absolute right-3 top-3 rounded-full border border-line/20 bg-canvas/60 p-2 text-muted hover:text-ink"
                  aria-label={t.common.close}
                >
                  <Icon name="close" size={15} />
                </button>
              </div>

              <div className="-mt-14 px-6 pb-7">
                <div className="relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-canvas">
                  <Image src={active.photo || "/images/team/hacker.png"} alt="" fill sizes="96px" className="object-cover" />
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold text-ink">{active.name}</h3>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ember">
                  {locale === "fr" && active.roleFr ? active.roleFr : active.role}
                </p>
                <p className="mt-4 text-[13.5px] leading-relaxed text-muted">{active.bio}</p>
                <div className="mt-6 flex items-center gap-3">
                  {active.linkedin ? (
                    <a
                      href={active.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-line/15 px-3.5 py-2 text-[11.5px] text-ink hover:border-ember/40 hover:text-ember"
                    >
                      <Icon name="linkedin" size={14} /> LinkedIn
                    </a>
                  ) : null}
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted/60">
                    {t.team.groups[active.team]}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
