"use client";

import Link from "next/link";
import type { PublicChallenge } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { ChallengeCard } from "./challenge-card";
import { Icon } from "@/components/ui/icons";

/**
 * Non-members see two real challenges as a taste, the rest is deliberately
 * illegible. No titles, no flags, no categories leak from the hidden set.
 */
export function TeaserRange({ preview, state = "guest" }: { preview: PublicChallenge[]; state?: "guest" | "pending" }) {
  const { t } = useI18n();

  return (
    <section className="pb-24">
      <div className="container-x">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {preview.map((challenge) => (
            <ChallengeCard key={challenge.slug} challenge={challenge} />
          ))}

          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              aria-hidden
              className="pointer-events-none relative overflow-hidden rounded-2xl border border-line/10 bg-elev/30 p-5"
            >
              <div className="flex items-center justify-between">
                <div className="h-2.5 w-24 rounded bg-line/15 blur-[3px]" />
                <div className="h-2.5 w-16 rounded bg-line/10 blur-[3px]" />
              </div>
              <div className="mt-6 h-4 w-2/3 rounded bg-line/20 blur-[5px]" />
              <div className="mt-3 space-y-2">
                <div className="h-2.5 w-full rounded bg-line/10 blur-[4px]" />
                <div className="h-2.5 w-5/6 rounded bg-line/10 blur-[4px]" />
              </div>
              <div className="mt-6 flex gap-2">
                <div className="h-5 w-14 rounded-full bg-line/10 blur-[4px]" />
                <div className="h-5 w-12 rounded-full bg-line/10 blur-[4px]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-canvas/60 to-transparent">
                <Icon name="lock" size={16} className="text-ember/50" />
              </div>
            </div>
          ))}

          <div className="relative flex flex-col justify-center rounded-2xl border border-ember/25 bg-ember/[0.06] p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember">members only</p>
            <p className="mt-3 font-display text-lg font-semibold leading-snug text-ink">
              {state === "pending" ? t.challenges.gatePendingTitle : t.challenges.gateTitle}
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{state === "pending" ? t.challenges.gatePendingBody : t.challenges.gateBody}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/login" className="btn-primary !px-4 !py-2 !text-[11.5px]">
                {t.auth.login}
                <Icon name="arrowRight" size={13} />
              </Link>
              <Link href="/register" className="btn-ghost !px-4 !py-2 !text-[11.5px]">
                {t.nav.join}
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted/70">
          {preview.length} unlocked preview · the rest opens after approval
        </p>
      </div>
    </section>
  );
}
