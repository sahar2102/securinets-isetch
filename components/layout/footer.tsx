"use client";

import Link from "next/link";
import { nav, site } from "@/data/site";
import { useI18n } from "@/lib/i18n";
import { Icon, type IconName } from "@/components/ui/icons";
import { LogoMark, Wordmark } from "@/components/ui/brand";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="relative mt-10 overflow-hidden border-t border-line/10 bg-soft">
      <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(179,0,27,0.22),transparent_70%)] blur-2xl"
      />

      <div className="container-x relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Link href="/" className="flex items-center gap-3" aria-label={site.name}>
              <LogoMark size={44} />
              <Wordmark />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">{t.footer.tagline}</p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted/70">
              {t.footer.parent} · {site.city}, {site.country}
            </p>

            <div className="mt-6 flex items-center gap-2">
              {site.socials.map((social) => (
                <a
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-line/12 text-muted transition-all hover:-translate-y-0.5 hover:border-ember/40 hover:text-ember"
                >
                  <Icon name={social.key as IconName} size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
              {t.footer.explore}
            </h3>
            <ul className="mt-5 space-y-3">
              {nav.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="link-underline text-[13.5px] text-muted transition-colors hover:text-ink"
                  >
                    {t.nav[item.key as keyof typeof t.nav]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
              {t.footer.club}
            </h3>
            <ul className="mt-5 space-y-3">
              <li>
                <Link href="/register" className="link-underline text-[13.5px] text-muted hover:text-ink">
                  {t.nav.join}
                </Link>
              </li>
              <li>
                <Link href="/verify" className="link-underline text-[13.5px] text-muted hover:text-ink">
                  {t.footer.verify}
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="link-underline text-[13.5px] text-muted hover:text-ink"
                >
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={`${site.parentUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline inline-flex items-center gap-1 text-[13.5px] text-muted hover:text-ink"
                >
                  securinets.tn
                  <Icon name="arrowUpRight" size={12} />
                </a>
              </li>
              <li>
                <Link href="/contact#faq" className="link-underline text-[13.5px] text-muted hover:text-ink">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
              {t.nav.join}
            </h3>
            <p className="mt-4 text-[13px] leading-relaxed text-muted">{t.footer.joinNote}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary !px-5 !py-2.5 text-[13px]">
                {t.nav.join}
                <Icon name="arrowRight" size={15} />
              </Link>
              <Link href="/login" className="btn-ghost !px-5 !py-2.5 text-[13px]">
                {t.auth.login}
              </Link>
            </div>
            <p className="mt-4 font-mono text-[10px] text-muted/60">
              {t.footer.rights} · {site.founded}
            </p>
          </div>
        </div>

        <div className="mt-14 overflow-hidden border-t border-line/10 pt-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted/60">
              © {new Date().getFullYear()} {site.legalName} · {t.footer.builtWith}
            </p>
            <p className="font-mono text-[11px] text-muted/50">
              <span className="text-ember/70">$</span> echo &quot;SNT&#123;l34rn_by_br34k1ng&#125;&quot;
            </p>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="select-none whitespace-nowrap px-4 text-center font-display text-[13vw] font-bold leading-[0.8] tracking-tighter text-line/[0.04]"
      >
        SECURINETS
      </div>
    </footer>
  );
}
