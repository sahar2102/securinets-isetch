"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { LeaderboardRow } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/client-store";
import { PageHero } from "@/components/layout/page-hero";
import { Icon } from "@/components/ui/icons";
import { cn, formatDate } from "@/lib/utils";

export function LeaderboardPage() {
  const { t } = useI18n();
  const { user } = useAppStore();
  const [range, setRange] = useState<"all" | "season">("all");
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);

  const load = useCallback(async (value: "all" | "season") => {
    setRows(null);
    try {
      const res = await fetch(`/api/leaderboard?range=${value}`, { cache: "no-store" });
      const data = await res.json();
      setRows(data.rows ?? []);
    } catch {
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void load(range);
  }, [range, load]);

  const podium = rows?.slice(0, 3) ?? [];
  const rest = rows?.slice(3) ?? [];

  return (
    <>
      <PageHero
        kicker={t.leaderboard.kicker}
        title={t.leaderboard.title}
        intro={t.leaderboard.intro}
        actions={
          <Link href={user ? "/challenges" : "/register"} className="btn-primary">
            {user ? t.challenges.kicker : t.leaderboard.joinCta}
            <Icon name="arrowRight" size={15} />
          </Link>
        }
        meta={
          <>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="trophy" size={13} className="text-ember" />
              {t.leaderboard.season}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="flame" size={13} className="text-ember" />
              {t.leaderboard.seasonNote}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="flag" size={13} className="text-ember" />
              {t.leaderboard.tiebreak}
            </span>
          </>
        }
      />

      <section className="section !pt-12">
        <div className="container-x">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center rounded-full border border-line/10 bg-elev/40 p-1">
              {(
                [
                  { key: "all", label: t.leaderboard.allTime },
                  { key: "season", label: t.leaderboard.season },
                ] as const
              ).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setRange(item.key)}
                  aria-pressed={range === item.key}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors",
                    range === item.key ? "bg-ember/15 text-ember" : "text-muted hover:text-ink",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-muted/50 sm:block">
              {rows ? `${rows.length} players` : t.common.loading}
            </p>
          </div>

          {rows === null ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl border border-line/10 bg-elev/30" />
              ))}
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {podium.map((row, i) => (
                  <div
                    key={row.userId}
                    className={cn(
                      "relative overflow-hidden rounded-2xl border p-6",
                      i === 0
                        ? "border-ember/35 bg-[linear-gradient(150deg,rgba(179,0,27,0.25),rgba(18,18,22,0.55))] sm:order-2"
                        : "border-line/10 bg-elev/40",
                      i === 1 && "sm:order-1",
                      i === 2 && "sm:order-3",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "font-mono text-[11px]",
                          i === 0 ? "text-ember" : "text-muted",
                        )}
                      >
                        #{row.rank}
                      </span>
                      {i === 0 ? <Icon name="trophy" size={18} className="text-ember" /> : null}
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <span
                        className={cn(
                          "grid place-items-center rounded-full border border-white/10 font-display text-sm font-bold",
                          i === 0 ? "h-12 w-12 bg-ember/20 text-ember" : "h-10 w-10 bg-line/[0.06] text-ink",
                        )}
                      >
                        {row.name.slice(0, 1)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-display text-[15px] font-semibold text-ink">{row.name}</p>
                        <p className="font-mono text-[10px] text-muted">
                          {row.solves} {t.leaderboard.solves}
                        </p>
                      </div>
                    </div>
                    <p className={cn("mt-5 font-display font-bold tracking-tight", i === 0 ? "text-4xl" : "text-3xl")}>
                      {row.score}
                      <span className="ms-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">pts</span>
                    </p>
                  </div>
                ))}
              </div>

              {rest.length ? (
                <div className="mt-6 overflow-hidden rounded-2xl border border-line/10">
                  <table className="w-full border-collapse text-start">
                    <thead>
                      <tr className="border-b border-line/10 bg-elev/50 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">
                        <th className="px-4 py-3 text-start">{t.leaderboard.rank}</th>
                        <th className="px-4 py-3 text-start">{t.leaderboard.player}</th>
                        <th className="px-4 py-3 text-end">{t.leaderboard.solves}</th>
                        <th className="hidden px-4 py-3 text-end sm:table-cell">{t.leaderboard.lastSolve}</th>
                        <th className="px-4 py-3 text-end">{t.leaderboard.score}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rest.map((row) => {
                        const isMe = user?.id === row.userId;
                        return (
                          <tr
                            key={row.userId}
                            className={cn(
                              "border-b border-line/6 last:border-0 transition-colors hover:bg-line/[0.03]",
                              isMe && "bg-ember/[0.06]",
                            )}
                          >
                            <td className="px-4 py-3 font-mono text-[11px] text-muted">{row.rank}</td>
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-2.5">
                                <span className="grid h-7 w-7 place-items-center rounded-full bg-line/[0.06] font-mono text-[10px] text-muted">
                                  {row.name.slice(0, 1)}
                                </span>
                                <span className="text-[13px] text-ink">{row.name}</span>
                                {isMe ? (
                                  <span className="rounded bg-ember/15 px-1.5 py-0.5 font-mono text-[9px] uppercase text-ember">
                                    {t.leaderboard.you}
                                  </span>
                                ) : null}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-end font-mono text-[11px] text-muted">{row.solves}</td>
                            <td className="hidden px-4 py-3 text-end font-mono text-[10px] text-muted/60 sm:table-cell">
                              {row.lastSolve ? formatDate(row.lastSolve) : "—"}
                            </td>
                            <td className="px-4 py-3 text-end font-mono text-[12px] font-semibold text-ink">
                              {row.score}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-8 rounded-2xl border border-line/10 bg-elev/40 p-10 text-center text-sm text-muted">
                  {t.leaderboard.empty}
                </p>
              )}

              <p className="mt-5 font-mono text-[10px] leading-relaxed text-muted/50">{t.leaderboard.demoNote}</p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
