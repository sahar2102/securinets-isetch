"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Icon } from "@/components/ui/icons";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <section className="relative grid min-h-[70svh] place-items-center overflow-hidden py-24">
      <div aria-hidden className="absolute inset-0 grid-lines opacity-40" />
      <div className="container-x relative text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-ember">404</p>
        <h1 className="mt-4 font-display text-display-sm font-bold tracking-tight text-ink">
          {t.notFound.title}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[14px] text-muted">{t.notFound.body}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn-primary">
            {t.notFound.cta}
            <Icon name="arrowRight" size={15} />
          </Link>
          <Link href="/challenges" className="btn-ghost">
            {t.challenges.kicker}
          </Link>
        </div>
      </div>
    </section>
  );
}
