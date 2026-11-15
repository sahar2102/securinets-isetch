"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Icon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/motion";

const GAMES = [
  { id: "cipher", index: "01", name: "Cipher Wheel", copy: "Spin a Caesar wheel until the sentence stops looking like noise.", tag: "classical crypto", href: "/arcade?game=cipher" },
  { id: "phish", index: "02", name: "Inbox Autopsy", copy: "An email lands in your inbox. Three things about it are wrong.", tag: "social engineering", href: "/arcade?game=phish" },
  { id: "ports", index: "03", name: "Port Reflex", copy: "Twenty-five seconds of open ports. Speed matters, mistakes cost.", tag: "network recon", href: "/arcade?game=ports" },
  { id: "hex", index: "04", name: "Byte Rebuild", copy: "A raw hex dump and no hints. Rebuild the flag.", tag: "encoding", href: "/arcade?game=hex" },
];

export function Playground() {
  const { t } = useI18n();
  return (
    <section className="border-t border-line/10 py-20 sm:py-24">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-ember">
              Playground
            </span>
            <h2 className="mt-4 text-balance font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              {t.home.warmupTitle}
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-muted">{t.home.warmupBody}</p>
          </div>
          <Link
            href="/arcade"
            className="group inline-flex items-center gap-2 rounded-full border border-line/15 px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink transition hover:border-ember/50 hover:text-ember"
          >
            Open the full arcade
            <Icon name="arrowRight" size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {GAMES.map((game, i) => (
            <Reveal key={game.id} delay={i * 0.06}>
              <Link
                href={game.href}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-line/10 bg-elev/30 p-6 transition duration-300 hover:-translate-y-1 hover:border-ember/30 hover:bg-ember/[0.04] sm:p-7"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-ember/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember/80">
                      {game.index} / {game.tag}
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line/15 text-muted transition group-hover:border-ember/40 group-hover:text-ember">
                      <Icon name="arrowUpRight" size={14} />
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-semibold text-ink group-hover:text-ember">
                    {game.name}
                  </h3>
                  <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-muted">{game.copy}</p>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted group-hover:text-ember">
                  play now
                  <span className="h-px w-8 bg-line/30 transition-all group-hover:w-14 group-hover:bg-ember/60" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
