"use client";

import Link from "next/link";
import { journey, pillars, site, values } from "@/data/site";
import { useI18n } from "@/lib/i18n";
import { PageHero } from "@/components/layout/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { Icon, type IconName } from "@/components/ui/icons";
import { Seal } from "@/components/ui/brand";

export function AboutPage() {
  const { t } = useI18n();

  return (
    <>
      <PageHero
        kicker={t.about.kicker}
        title={
          <>
            {t.about.title.split(",").slice(0, 1).join(",")}
            <span className="text-ember">,</span>
            {t.about.title.split(",").slice(1).join(",")}
          </>
        }
        intro={t.about.intro}
        meta={
          <>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="mapPin" size={13} className="text-ember" />
              {site.city}, {site.country}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="calendar" size={13} className="text-ember" />
              Founded {site.founded}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="users" size={13} className="text-ember" />
              84 members
            </span>
          </>
        }
      />

      <section className="section">
        <div className="container-x grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <div className="sticky top-28">
              <p className="eyebrow mb-4">
                <span className="inline-block h-1 w-6 bg-ember" />
                {t.about.missionTitle}
              </p>
              <h2 className="text-balance font-display text-3xl font-semibold tracking-[-0.035em] text-ink">
                {t.about.storyTitle}
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-muted">{t.about.missionBody}</p>
              <div className="mt-10 hidden justify-start lg:flex">
                <Seal size={220} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-[15px] leading-relaxed text-muted">{t.about.storyBody}</p>

            <ol className="mt-12 space-y-0">
              {journey.map((step, i) => (
                <li key={step.title} className="relative grid grid-cols-[64px_1fr] gap-5 pb-9 last:pb-0">
                  {i < journey.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute bottom-0 start-[31px] top-4 w-px bg-gradient-to-b from-ember/40 to-line/10"
                    />
                  ) : null}
                  <div className="relative">
                    <span className="relative z-10 grid h-[34px] w-[34px] place-items-center rounded-full border border-ember/30 bg-canvas font-mono text-[10px] text-ember">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="pt-0.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember">
                        {step.month} {step.year}
                      </span>
                      <span className="h-px flex-1 bg-line/10" />
                    </div>
                    <h3 className="mt-2 font-display text-[17px] font-semibold tracking-tight text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-y border-line/10 bg-soft/40 py-20 sm:py-24">
        <div className="container-x">
          <SectionHeading kicker="01 / values" title={t.about.valuesTitle} align="center" />
          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <StaggerItem key={value.key}>
                <div className="group h-full rounded-2xl border border-line/10 bg-canvas/40 p-6 transition-colors hover:border-ember/30">
                  <div className="flex items-center justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-lg border border-ember/20 bg-ember/[0.06] text-ember">
                      <Icon name={(["droplet", "shield", "users", "spark"] as IconName[])[i]} size={16} />
                    </span>
                    <span className="font-mono text-[10px] text-muted/40">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 font-display text-[16px] font-semibold leading-snug text-ink">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{value.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section id="what" className="section scroll-mt-24">
        <div className="container-x">
          <SectionHeading kicker="02 / programme" title={t.about.whatTitle} body={t.about.whatBody} />

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {pillars.map((pillar, i) => (
              <Reveal key={pillar.key} delay={i * 0.06}>
                <article className="group relative h-full overflow-hidden rounded-2xl border border-line/10 bg-elev/40 p-7 transition-all hover:-translate-y-1 hover:border-ember/30">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-line/10 bg-canvas/60 text-ember">
                      <Icon name={pillar.icon as IconName} size={20} />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted/50">
                      {pillar.meta}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-ink">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{pillar.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-3xl border border-ember/25 bg-[linear-gradient(120deg,rgba(139,0,0,0.28),rgba(10,10,12,0.4))] p-8 sm:p-12">
            <div aria-hidden className="absolute inset-0 dot-grid opacity-20" />
            <div className="relative max-w-2xl">
              <p className="eyebrow mb-4">
                <Icon name="shield" size={14} className="text-ember" />
                {t.about.conductTitle}
              </p>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {t.about.conductTitle}
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-muted">{t.about.conductBody}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/join" className="btn-primary">
                  {t.about.joinCta}
                  <Icon name="arrowRight" size={15} />
                </Link>
                <Link href="/contact" className="btn-ghost">
                  {t.nav.contact}
                </Link>
              </div>
            </div>
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-16 end-0 select-none font-display text-[180px] font-bold leading-none text-white/[0.03]"
            >
              SNT
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
