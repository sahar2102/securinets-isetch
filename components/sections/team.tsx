"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { TeamMember } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { PageHero } from "@/components/layout/page-hero";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const ORDER: TeamMember["team"][] = ["board", "tech", "hr", "comms", "events"];

export function TeamPage({ members }: { members: TeamMember[] }) {
  const { t, locale } = useI18n();
  const teamsCount = new Set(members.map((m) => m.team)).size;
  const [filter, setFilter] = useState<"all" | TeamMember["team"]>("all");

  const visible = useMemo(
    () => members.filter((m) => filter === "all" || m.team === filter),
    [members, filter],
  );

  const filters: { key: "all" | TeamMember["team"]; label: string }[] = [
    { key: "all", label: t.team.groups.all },
    ...ORDER.filter((key) => members.some((m) => m.team === key)).map((key) => ({
      key,
      label: t.team.groups[key],
    })),
  ];

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
              {members.length} people
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="badge" size={13} className="text-ember" />
              {teamsCount} teams
            </span>
          </>
        }
      />

      <section className="section">
        <div className="container-x">
          <div className="scrollbar-none -mx-1 mb-10 flex gap-1 overflow-x-auto px-1 pb-1">
            {filters.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                aria-pressed={filter === item.key}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-[12.5px] font-medium transition-colors",
                  filter === item.key
                    ? "border-ember/40 bg-ember/10 text-ember"
                    : "border-line/10 text-muted hover:border-line/25 hover:text-ink",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((member, i) => (
              <motion.article
                key={member.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.25) }}
                className="group relative overflow-hidden rounded-2xl border border-line/10 bg-elev/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-line/25"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
                  style={{ background: member.accent }}
                />

                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div
                      className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-white/10 font-display text-lg font-bold text-white"
                      style={{
                        background: `linear-gradient(145deg, ${member.accent}33, #121216 70%)`,
                      }}
                    >
                      {member.photo ? (
                        <Image
                          src={member.photo}
                          alt={member.name}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span style={{ color: member.accent }}>{member.initials}</span>
                      )}
                    </div>
                    <span
                      className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-canvas"
                      style={{ background: member.accent }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-display text-[16px] font-semibold tracking-tight text-ink">
                      {member.name}
                    </h2>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: member.accent }}>
                      {locale === "fr" && member.roleFr ? member.roleFr : member.role}
                    </p>
                  </div>
                </div>

                <p className="mt-5 min-h-[60px] text-[13px] leading-relaxed text-muted">{member.bio}</p>

                <div className="mt-5 flex items-center justify-between border-t border-line/8 pt-4">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted/50">
                    <Icon name="badge" size={11} />
                    {member.team}
                  </span>
                  <div className="flex items-center gap-1">
                    {member.linkedin ? (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on LinkedIn`}
                        className="rounded-md p-1.5 text-muted transition-colors hover:bg-line/5 hover:text-ink"
                      >
                        <Icon name="linkedin" size={15} />
                      </a>
                    ) : null}
                    {member.github ? (
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on GitHub`}
                        className="rounded-md p-1.5 text-muted transition-colors hover:bg-line/5 hover:text-ink"
                      >
                        <Icon name="github" size={15} />
                      </a>
                    ) : null}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-2xl border border-line/10 bg-elev/40 p-8 sm:flex-row sm:items-center">
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
    </>
  );
}
