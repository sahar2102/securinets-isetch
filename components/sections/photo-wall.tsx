"use client";

import Image from "next/image";
import Link from "next/link";
import gallery from "@/data/gallery.json";
import { useI18n } from "@/lib/i18n";
import { Reveal } from "@/components/ui/motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { Icon } from "@/components/ui/icons";

const photos = gallery.photos;

function Row({ items, reverse }: { items: typeof photos; reverse?: boolean }) {
  return (
    <div className="photo-mask overflow-hidden">
      <div className={`photo-track flex w-max gap-3 ${reverse ? "reverse" : ""}`}>
        {[...items, ...items].map((photo, i) => (
          <figure
            key={`${photo.src}-${i}`}
            className="group relative aspect-[4/3] w-[260px] shrink-0 overflow-hidden rounded-xl border border-line/10 bg-elev sm:w-[320px]"
          >
            <Image
              src={photo.src}
              alt=""
              fill
              sizes="320px"
              className="object-cover opacity-85 grayscale-[35%] transition duration-500 group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
          </figure>
        ))}
      </div>
    </div>
  );
}

export function PhotoWall() {
  const { t } = useI18n();
  const first = photos.slice(0, Math.ceil(photos.length / 2));
  const second = photos.slice(Math.ceil(photos.length / 2));

  return (
    <section className="relative overflow-hidden border-t border-line/10 py-20">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            kicker={t.home.galleryKicker}
            title={t.home.galleryTitle}
            body={t.home.galleryBody}
            className="max-w-2xl"
          />
          <Link
            href="/events"
            className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ember"
          >
            {t.common.viewAll}
            <Icon name="arrowRight" size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
      <Reveal className="mt-10 space-y-3">
        <Row items={first} />
        <Row items={second} reverse />
      </Reveal>
    </section>
  );
}
