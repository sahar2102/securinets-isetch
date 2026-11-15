"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Icon } from "@/components/ui/icons";

/** Shown instead of the challenge range when the viewer is not an approved member. */
export function MembersGate({ state }: { state: "guest" | "pending" }) {
  const { t } = useI18n();
  const pending = state === "pending";

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-mesh opacity-70" />
      <div className="container-x relative">
        <div className="mx-auto max-w-xl rounded-3xl border border-line/12 bg-elev/60 p-8 text-center backdrop-blur-xl sm:p-12">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-ember/30 bg-ember/10 text-ember">
            <Icon name="lock" size={24} />
          </span>
          <h1 className="mt-6 font-display text-[26px] font-semibold leading-tight tracking-tight text-ink sm:text-[30px]">
            {pending ? t.challenges.gatePendingTitle : t.challenges.gateTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-muted">
            {pending ? t.challenges.gatePendingBody : t.challenges.gateBody}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {pending ? (
              <Link href="/" className="btn-ghost justify-center">
                {t.nav.home}
              </Link>
            ) : (
              <>
                <Link href="/login?next=/challenges" className="btn-primary justify-center">
                  {t.challenges.gateCta}
                  <Icon name="arrowRight" size={15} />
                </Link>
                <Link href="/register" className="btn-ghost justify-center">
                  {t.nav.join}
                </Link>
              </>
            )}
          </div>
          {pending ? (
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-muted/60">
              {t.challenges.gatePendingTitle} · {t.common.loading ?? ""}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
