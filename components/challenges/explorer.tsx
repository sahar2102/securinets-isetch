"use client";

import { useMemo, useState } from "react";
import { categories, difficulties, type Difficulty } from "@/data/site";
import type { PublicChallenge } from "@/lib/types";
import { useAppStore } from "@/lib/client-store";
import { useI18n } from "@/lib/i18n";
import { PageHero } from "@/components/layout/page-hero";
import { ChallengeCard } from "./challenge-card";
import { ProgressPanel } from "./progress-panel";
import { Icon, type IconName } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type Status = "all" | "solved" | "unsolved";
type Sort = "points" | "newest" | "solves";

export function ChallengeExplorer({ challenges }: { challenges: PublicChallenge[] }) {
  const { t } = useI18n();
  const { solvedSet } = useAppStore();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [status, setStatus] = useState<Status>("all");
  const [sort, setSort] = useState<Sort>("points");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = challenges.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (difficulty !== "all" && c.difficulty !== difficulty) return false;
      if (status === "solved" && !solvedSet.has(c.slug)) return false;
      if (status === "unsolved" && solvedSet.has(c.slug)) return false;
      if (!q) return true;
      return [c.title, c.category, ...c.tags].join(" ").toLowerCase().includes(q);
    });

    return rows.sort((a, b) => {
      if (sort === "newest") return a.date < b.date ? 1 : -1;
      if (sort === "solves") return b.solves - a.solves;
      return a.points - b.points;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenges, query, category, difficulty, status, sort, solvedSet.size]);

  const active = query || category !== "all" || difficulty !== "all" || status !== "all";
  const reset = () => {
    setQuery("");
    setCategory("all");
    setDifficulty("all");
    setStatus("all");
  };

  return (
    <>
      <PageHero
        kicker={t.challenges.kicker}
        title={t.challenges.title}
        intro={t.challenges.intro}
        meta={
          <>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="flag" size={13} className="text-ember" />
              {challenges.length} challenges
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="grid" size={13} className="text-ember" />
              {categories.length} categories
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="users" size={13} className="text-ember" />
              {challenges.reduce((n, c) => n + c.solves, 0).toLocaleString("en-GB")} solves
            </span>
          </>
        }
      />

      <section className="section !pt-12">
        <div className="container-x">
          <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0">
              {/* filters */}
              <div className="z-30 -mx-1 rounded-2xl border border-line/10 bg-canvas/85 p-3 backdrop-blur-xl sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Icon
                      name="search"
                      size={16}
                      className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-muted/60"
                    />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t.challenges.searchPlaceholder}
                      aria-label={t.common.search}
                      className="input !py-2.5 ps-10"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label htmlFor="sort" className="sr-only">
                      {t.challenges.sort}
                    </label>
                    <button
                      type="button"
                      onClick={() => setFiltersOpen((v) => !v)}
                      aria-expanded={filtersOpen}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line/12 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted lg:hidden"
                    >
                      <Icon name="filter" size={12} />
                      {t.challenges.filters}
                    </button>
                    <select
                      id="sort"
                      value={sort}
                      onChange={(e) => setSort(e.target.value as Sort)}
                      className="input !w-auto !rounded-full !py-2.5 !pe-8 text-[12px]"
                    >
                      <option value="points">{t.challenges.sortPoints}</option>
                      <option value="newest">{t.challenges.sortNewest}</option>
                      <option value="solves">{t.challenges.sortSolves}</option>
                    </select>
                    {active ? (
                      <button
                        type="button"
                        onClick={reset}
                        className="inline-flex items-center gap-1 rounded-full border border-line/12 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted hover:text-ink"
                      >
                        <Icon name="close" size={12} />
                        {t.challenges.clearFilters}
                      </button>
                    ) : null}
                  </div>
                </div>

                <div
                  className={cn(
                    "scrollbar-none mt-3 gap-1.5 overflow-x-auto pb-1",
                    filtersOpen ? "flex" : "hidden lg:flex",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setCategory("all")}
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1.5 text-[11.5px] transition-colors",
                      category === "all"
                        ? "border-ember/40 bg-ember/10 text-ember"
                        : "border-line/10 text-muted hover:text-ink",
                    )}
                  >
                    {t.common.all}
                    <span className="ms-1.5 font-mono text-[9px] opacity-60">{challenges.length}</span>
                  </button>
                  {categories.map((cat) => {
                    const count = challenges.filter((c) => c.category === cat.slug).length;
                    const isActive = category === cat.slug;
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => setCategory(isActive ? "all" : cat.slug)}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] transition-colors",
                          isActive
                            ? "text-ink"
                            : "border-line/10 text-muted hover:border-line/25 hover:text-ink",
                        )}
                        style={
                          isActive
                            ? { borderColor: `${cat.accent}66`, backgroundColor: `${cat.accent}18` }
                            : undefined
                        }
                      >
                        <Icon name={cat.icon as IconName} size={12} style={{ color: cat.accent }} />
                        {cat.name}
                        <span className="font-mono text-[9px] opacity-50">{count}</span>
                      </button>
                    );
                  })}
                </div>

                <div
                  className={cn(
                    "mt-2 flex-wrap items-center gap-1.5 border-t border-line/8 pt-3",
                    filtersOpen ? "flex" : "hidden lg:flex",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setDifficulty("all")}
                    className={cn(
                      "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em]",
                      difficulty === "all" ? "bg-line/10 text-ink" : "text-muted hover:text-ink",
                    )}
                  >
                    {t.common.all}
                  </button>
                  {(Object.keys(difficulties) as Difficulty[]).map((level) => {
                    const meta = difficulties[level];
                    const isActive = difficulty === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(isActive ? "all" : level)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
                          isActive ? "text-ink" : "border-transparent text-muted hover:text-ink",
                        )}
                        style={
                          isActive
                            ? { borderColor: `${meta.color}66`, backgroundColor: `${meta.color}18` }
                            : undefined
                        }
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                        {t.difficulty[level]}
                      </button>
                    );
                  })}

                  <div className="ms-auto flex items-center rounded-full border border-line/10 p-0.5">
                    {(["all", "solved", "unsolved"] as Status[]).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setStatus(value)}
                        className={cn(
                          "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
                          status === value ? "bg-ember/15 text-ember" : "text-muted hover:text-ink",
                        )}
                      >
                        {value === "all"
                          ? t.challenges.statusAll
                          : value === "solved"
                            ? t.challenges.solved
                            : t.challenges.unsolved}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  {filtered.length} {t.challenges.results}
                </p>
                <p className="hidden font-mono text-[10px] text-muted/50 sm:block">
                  {t.challenges.detail.flagFormat}
                </p>
              </div>

              {filtered.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                  {filtered.map((challenge, i) => (
                    <ChallengeCard key={challenge.slug} challenge={challenge} index={i} />
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-line/10 bg-elev/40 px-6 py-16 text-center">
                  <span className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-line/10 text-muted">
                    <Icon name="search" size={18} />
                  </span>
                  <p className="mt-4 text-[13.5px] text-muted">{t.challenges.noResults}</p>
                  <button type="button" onClick={reset} className="btn-ghost mt-4 !py-2 !text-[12px]">
                    {t.challenges.clearFilters}
                  </button>
                </div>
              )}
            </div>

            <aside className="xl:sticky xl:top-[152px] xl:self-start">
              <ProgressPanel challenges={challenges} />
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
