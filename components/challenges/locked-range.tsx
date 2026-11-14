"use client";

import Link from "next/link";
import { categories } from "@/data/site";
import type { PublicChallenge } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { PageHero } from "@/components/layout/page-hero";
import { categoryBySlug, DifficultyBadge } from "@/components/ui/badges";
import { Icon } from "@/components/ui/icons";

/**
 * Teaser shown to guests and to accounts awaiting approval:
 * four real challenge cards + a blurred, locked grid + a clear explanation.
 */
export function LockedRange({
  preview,
  total,
  state,
}: {
  preview: PublicChallenge[];
  total: number;
  state: "guest" | "pending";
}) {
  const { t } = useI18n();
  const blurred = Array.from({ length: 6 });

  return (
    <>
      <PageHero
        kicker={t.challenges.kicker}
        title={t.challenges.lockedTitle}
        intro={t.challenges.lockedIntro}
        meta={
          <>
            <span className="chip">{total} challenges</span>
            <span className="chip">{categories.length} categories</span>
            <span className="chip border-ember/30 text-ember-text">
              <Icon name="lock" size={12} /> Members only
            </span>
          </>
        }
      />

      <section className="relative pb-20">
        <div className="container-x">
          <div className="rounded-3xl border border-line/10 bg-elev/40 p-5 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember-text">
                  {state === "pending" ? t.challenges.gatePendingTitle : t.challenges.gateTitle}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                  {state === "pending" ? t.challenges.gatePendingBody : t.challenges.gateBody}
                </h2>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {state === "pending" ? (
                  <Link href="/contact" className="btn btn-ghost">
                    Contact the board
                  </Link>
                ) : (
                  <>
                    <Link href="/login?next=/challenges" className="btn btn-primary">
                      {t.challenges.gateCta}
                    </Link>
                    <Link href="/register" className="btn btn-ghost">
                      Create an account
                    </Link>
                  </>
                )}
              </div>
            </div>

            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              A taste of the range
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {preview.map((challenge) => {
                const category = categoryBySlug(challenge.category);
                return (
                  <div
                    key={challenge.slug}
                    className="rounded-2xl border border-line/10 bg-canvas/60 p-4"
                    aria-label={`${challenge.title} — locked`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">
                        {category.name}
                      </span>
                      <Icon name="lock" size={12} className="text-ember-text" />
                    </div>
                    <p className="mt-2 line-clamp-2 text-[14.5px] font-medium leading-snug text-ink">
                      {challenge.title}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <DifficultyBadge level={challenge.difficulty} compact />
                      <span className="font-mono text-[11px] text-muted">{challenge.points} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="relative mt-10">
              <div
                aria-hidden
                className="grid gap-3 blur-[7px] select-none sm:grid-cols-2 lg:grid-cols-3"
              >
                {blurred.map((_, index) => (
                  <div key={index} className="rounded-2xl border border-line/10 bg-canvas/50 p-5">
                    <div className="h-2.5 w-20 rounded bg-line/20" />
                    <div className="mt-4 h-3.5 w-3/4 rounded bg-line/25" />
                    <div className="mt-2 h-2.5 w-full rounded bg-line/15" />
                    <div className="mt-2 h-2.5 w-5/6 rounded bg-line/15" />
                    <div className="mt-5 flex justify-between">
                      <div className="h-2.5 w-14 rounded bg-line/20" />
                      <div className="h-2.5 w-10 rounded bg-line/20" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-2xl border border-ember/25 bg-canvas/90 px-6 py-5 text-center backdrop-blur-md">
                  <Icon name="lock" size={20} className="mx-auto text-ember-text" />
                  <p className="mt-3 text-[14px] font-medium text-ink">
                    {state === "pending" ? t.challenges.gatePendingTitle : t.challenges.gateTitle}
                  </p>
                  <p className="mt-1 max-w-xs text-[12.5px] leading-relaxed text-muted">
                    {state === "pending"
                      ? "An admin must approve your account before the full range opens."
                      : `${total} challenges, hints and the scoreboard unlock once you sign in with an approved account.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
