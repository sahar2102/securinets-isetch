"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@/components/ui/icons";

export function PageHero({
  kicker,
  title,
  intro,
  actions,
  meta,
  breadcrumb,
}: {
  kicker: string;
  title: ReactNode;
  intro?: string;
  actions?: ReactNode;
  meta?: ReactNode;
  breadcrumb?: { label: string; href: string }[];
}) {
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden border-b border-line/10 pb-14 pt-16 sm:pb-16 sm:pt-20">
      <div aria-hidden className="absolute inset-0 -z-10 grid-lines opacity-50" />
      <div
        aria-hidden
        className="absolute -top-40 start-1/3 -z-10 h-[360px] w-[520px] rounded-full bg-[radial-gradient(ellipse,rgba(179,0,27,0.28),transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-ember/40 to-transparent"
      />

      <div className="container-x">
        {breadcrumb?.length ? (
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted/60">
            <Link href="/" className="hover:text-ink">
              home
            </Link>
            {breadcrumb.map((crumb) => (
              <span key={crumb.href} className="flex items-center gap-2">
                <span aria-hidden>/</span>
                <Link href={crumb.href} className="hover:text-ink">
                  {crumb.label}
                </Link>
              </span>
            ))}
          </nav>
        ) : null}

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="eyebrow mb-5"
        >
          <span className="inline-block h-1 w-6 bg-ember" />
          {kicker}
        </motion.p>

        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl text-balance font-display text-display-sm font-bold tracking-[-0.04em] text-ink"
        >
          {title}
        </motion.h1>

        {intro ? (
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="mt-5 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted sm:text-base"
          >
            {intro}
          </motion.p>
        ) : null}

        {actions ? <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div> : null}

        {meta ? (
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted/70">
            {meta}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function HeroMeta({ icon, children }: { icon: Parameters<typeof Icon>[0]["name"]; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon name={icon} size={13} className="text-ember" />
      {children}
    </span>
  );
}
