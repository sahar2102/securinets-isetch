"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { SectionHeading } from "@/components/ui/section-heading";

const REELS = [
  { src: "/video/reel-1.mp4", label: "Recap 01" },
  { src: "/video/reel-2.mp4", label: "Recap 02" },
];

function ReelCard({ src, label }: { src: string; label: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  return (
    <figure className="group relative overflow-hidden rounded-2xl border border-line/10 bg-black">
      <video
        ref={video}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="aspect-[4/5] w-full object-cover sm:aspect-[3/4]"
      />
      <figcaption className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/70 backdrop-blur">
        {label}
      </figcaption>
      <button
        type="button"
        onClick={() => {
          const next = !muted;
          setMuted(next);
          if (video.current) video.current.muted = next;
        }}
        aria-label={muted ? "Unmute video" : "Mute video"}
        className="absolute bottom-3 right-3 flex h-9 items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/80 backdrop-blur transition hover:border-ember/50 hover:text-white"
      >
        <span aria-hidden className="flex items-end gap-[2px]">
          <span className="h-2 w-[2px] bg-current" />
          <span className="h-3.5 w-[2px] bg-current" />
          <span className="h-2.5 w-[2px] bg-current" />
        </span>
        {muted ? "sound off" : "sound on"}
      </button>
    </figure>
  );
}

export function Reel() {
  const { t } = useI18n();
  return (
    <section className="border-t border-line/10 py-20">
      <div className="container-x">
        <SectionHeading
          kicker="Reels"
          title={t.home.galleryTitle}
          body="Shot by members, cut for Instagram."
          className="max-w-2xl"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {REELS.map((reel) => (
            <ReelCard key={reel.src} {...reel} />
          ))}
        </div>
      </div>
    </section>
  );
}
