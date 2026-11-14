"use client";

import Link from "next/link";
import { categories } from "@/data/site";
import type { PublicChallenge } from "@/lib/types";
import { useAppStore } from "@/lib/client-store";
import { useI18n } from "@/lib/i18n";
import { badgeMeta } from "@/lib/scoring";
import { Icon, type IconName } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function ProgressPanel({ challenges }: { challenges: PublicChallenge[] }) {
  const { t } = useI18n();
  const { progress, solvedSet, user } = useAppStore();

  const totalPoints = challenges.reduce((sum, c) => sum + c.points, 0);
  const earned = challenges.filter((c) => solvedSet.has(c.slug)).reduce((sum, c) => sum + c.points, 0);
  const pct = totalPoints ? Math.round((earned / totalPoints) * 100) : 0;
  const unlocked = new Set(progress.guest ? [] : progress.achievements ?? []);

  return (
    <div className="rounded-2xl border border-line/10 bg-elev/40 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            {t.challenges.progressTitle}
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-semibold tracking-tight text-ink">
              {progress.score}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">pts</span>
          </div>
        </div>
        <div className="text-end">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            {t.challenges.progressSolved}
          </p>
          <p className="mt-1 font-mono text-sm text-ink">
            {solvedSet.size}
            <span className="text-muted">/{challenges.length}</span>
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted">
            {t.challenges.progressRank} {progress.rank ? `#${progress.rank}` : "—"}
          </p>
        </div>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-crimson-deep via-crimson to-ember transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-2">
        {categories.map((cat) => {
          const inCat = challenges.filter((c) => c.category === cat.slug);
          const done = inCat.filter((c) => solvedSet.has(c.slug)).length;
          const ratio = inCat.length ? done / inCat.length : 0;
          return (
            <div key={cat.slug}>
              <div className="flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.1em]">
                <span className="flex items-center gap-1.5 text-muted">
                  <Icon name={cat.icon as IconName} size={11} style={{ color: cat.accent }} />
                  {cat.name.split(" ")[0]}
                </span>
                <span className="text-muted/70">
                  {done}/{inCat.length}
                </span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-line/10">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${ratio * 100}%`, background: cat.accent }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-line/10 pt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          {t.challenges.achievements}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {Object.entries(badgeMeta).map(([key, badge]) => {
            const active = unlocked.has(key);
            return (
              <span
                key={key}
                title={badge.desc}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-1 font-mono text-[9.5px]",
                  active
                    ? "border-ember/40 bg-ember/10 text-ember"
                    : "border-line/10 text-muted/50",
                )}
              >
                <Icon name={badge.icon as IconName} size={11} />
                {badge.name}
              </span>
            );
          })}
        </div>
        {progress.guest ? (
          <p className="mt-4 text-[11.5px] leading-relaxed text-muted">
            {t.challenges.guestNote}{" "}
            <Link href="/login" className="text-ember hover:underline">
              {t.challenges.signInToSave}
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
