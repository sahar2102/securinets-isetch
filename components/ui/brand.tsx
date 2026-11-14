import Image from "next/image";
import { cn } from "@/lib/utils";

/** The seal, cropped to a circle. Sizes are fixed to keep CLS at zero. */
export function LogoMark({
  size = 40,
  className,
  glow = true,
  priority = false,
}: {
  size?: number;
  className?: string;
  glow?: boolean;
  priority?: boolean;
}) {
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center rounded-full", className)}
      style={{ width: size, height: size }}
    >
      {glow ? (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,45,61,0.45),transparent_65%)] blur-md"
        />
      ) : null}
      <span
        className="relative block overflow-hidden rounded-full ring-1 ring-white/15"
        style={{ width: size, height: size }}
      >
        <Image
          src="/brand/logo.png"
          alt=""
          width={size * 2}
          height={size * 2}
          priority={priority}
          className="h-full w-full scale-[1.02] object-cover"
        />
      </span>
    </span>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex flex-col leading-none">
      <span className="whitespace-nowrap font-display text-[15px] font-bold tracking-tight text-ink">
        SECURINETS
      </span>
      <span className="mt-0.5 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.26em] text-muted">
        {compact ? "ISET Charguia" : "ISET Charguia · 2026"}
      </span>
    </span>
  );
}

/** Decorative rotating seal used in the hero and about section. */
export function Seal({ size = 340, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(179,0,27,0.35),transparent_70%)] blur-2xl" />
      <div className="absolute inset-[6%] rounded-full border border-ember/20" />
      <div className="absolute inset-[2%] animate-spin-slow rounded-full border border-dashed border-ember/25" />
      <div className="absolute inset-[12%] overflow-hidden rounded-full ring-1 ring-white/10">
        <Image
          src="/brand/logo.png"
          alt="Securinets ISET Charguia seal"
          width={size}
          height={size}
          priority
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 animate-spin-slow">
        {[0, 90, 180, 270].map((deg) => (
          <span
            key={deg}
            className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-ember shadow-[0_0_12px_rgba(255,45,61,0.9)]"
            style={{ transform: `rotate(${deg}deg) translateY(-2px)`, transformOrigin: `0 ${size / 2}px` }}
          />
        ))}
      </div>
    </div>
  );
}
