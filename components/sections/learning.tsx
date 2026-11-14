"use client";

import Link from "next/link";
import { useState } from "react";
import { resources, roadmap, tools } from "@/data/site";
import { useI18n } from "@/lib/i18n";
import { PageHero } from "@/components/layout/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const GROUPS = ["Environment", "Network", "Web", "Reverse", "Pwn", "Forensics", "Crypto", "Utility"];

export function LearningPage() {
  const { t } = useI18n();
  const [active, setActive] = useState(0);

  return (
    <>
      <PageHero
        kicker={t.learning.kicker}
        title={t.learning.title}
        intro={t.learning.intro}
        meta={
          <>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="route" size={13} className="text-ember" />
              {t.learning.roadmapNote}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="terminal" size={13} className="text-ember" />
              {tools.length} tools
            </span>
          </>
        }
      />

      <section className="section">
        <div className="container-x">
          <SectionHeading
            kicker={t.learning.kicker}
            title={t.learning.roadmapTitle}
            body={t.learning.roadmapNote}
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-[300px_1fr]">
            <ol className="scrollbar-none flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {roadmap.map((stage, i) => (
                <li key={stage.key} className="shrink-0 lg:w-full">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={active === i}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-start transition-colors",
                      active === i
                        ? "border-ember/35 bg-ember/[0.07]"
                        : "border-line/10 hover:border-line/25",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg font-mono text-[11px]",
                        active === i ? "bg-ember text-white" : "border border-line/12 text-muted",
                      )}
                    >
                      {stage.stage}
                    </span>
                    <span className="min-w-0">
                      <span className={cn("block truncate text-[13px] font-medium", active === i ? "text-ink" : "text-muted")}>
                        {stage.title}
                      </span>
                      <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted/60">
                        {stage.weeks}
                      </span>
                    </span>
                    <Icon name="chevronRight" size={14} className="ms-auto hidden text-muted/40 lg:block" />
                  </button>
                </li>
              ))}
            </ol>

            <div className="relative overflow-hidden rounded-2xl border border-line/10 bg-elev/40 p-6 sm:p-8">
              <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(179,0,27,0.18),transparent_70%)] blur-2xl" />
              <div className="relative">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember">
                  {t.learning.stage} {roadmap[active].stage} · {roadmap[active].weeks}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
                  {roadmap[active].title}
                </h3>
                <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted">{roadmap[active].body}</p>

                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {roadmap[active].topics.map((topic) => (
                    <li
                      key={topic}
                      className="flex items-center gap-2 rounded-lg border border-line/8 bg-base/40 px-3 py-2 font-mono text-[11.5px] text-muted"
                    >
                      <Icon name="check" size={12} className="text-ember" />
                      {topic}
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActive((i) => Math.max(0, i - 1))}
                    disabled={active === 0}
                    className="inline-flex items-center gap-1 rounded-full border border-line/12 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted disabled:opacity-30"
                  >
                    <Icon name="arrowLeft" size={12} />
                    {t.common.previous}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActive((i) => Math.min(roadmap.length - 1, i + 1))}
                    disabled={active === roadmap.length - 1}
                    className="inline-flex items-center gap-1 rounded-full border border-line/12 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted disabled:opacity-30"
                  >
                    {t.common.next}
                    <Icon name="arrowRight" size={12} />
                  </button>
                  <span className="ms-auto font-mono text-[10px] text-muted/50">
                    {active + 1}/{roadmap.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line/10 bg-soft/40 py-20">
        <div className="container-x">
          <SectionHeading
            kicker="02 / resources"
            title={t.learning.resourcesTitle}
            body={t.learning.resourcesNote}
          />
          <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <a
                key={resource.title}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-2xl border border-line/10 bg-base/40 p-5 transition-all hover:-translate-y-1 hover:border-ember/30"
              >
                <div className="flex items-center justify-between">
                  <span className="chip !border-transparent !bg-line/[0.05] !tracking-[0.1em]">{resource.kind}</span>
                  <Icon name="arrowUpRight" size={15} className="text-muted transition-colors group-hover:text-ember" />
                </div>
                <h3 className="mt-4 font-display text-[15px] font-semibold leading-snug text-ink group-hover:text-ember">
                  {resource.title}
                </h3>
                <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-muted">{resource.note}</p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted/60">
                  {resource.level}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <SectionHeading kicker="03 / toolbox" title={t.learning.toolsTitle} body={t.learning.toolsNote} />
          <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="group flex items-center justify-between gap-2 rounded-xl border border-line/10 bg-elev/30 px-4 py-3 transition-colors hover:border-ember/25"
              >
                <span>
                  <span className="block font-mono text-[12px] text-ink">{tool.name}</span>
                  <span className="text-[11px] text-muted">{tool.use}</span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted/40">
                  {tool.group}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted/50">
            {GROUPS.join(" · ")}
          </p>
        </div>
      </section>

      <section className="border-t border-line/10 py-20">
        <div className="container-x">
          <SectionHeading
            kicker="04 / writeups"
            title={t.learning.writeupsTitle}
            body={t.learning.writeupsNote}
          />
          <div className="mt-8 rounded-2xl border border-dashed border-line/15 bg-elev/30 p-8 text-center">
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted">{t.learning.writeupsSoon}</p>
            <Link href="/challenges" className="btn-ghost mt-6 inline-flex items-center gap-2">
              {t.home.ctaChallenges}
              <Icon name="arrowRight" size={15} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
