import { cn } from "@/lib/utils";

/**
 * Procedural hooded figure. Not a photo, not initials in a box: an SVG glyph
 * that flips to a code side on hover (the flip is CSS, so it costs nothing).
 */
export function HackerAvatar({
  name,
  accent = "#FF2D3D",
  initials,
  className,
}: {
  name: string;
  accent?: string;
  initials: string;
  className?: string;
}) {
  return (
    <div className={cn("group/avatar [perspective:900px]", className)}>
      <div className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* front — hooded figure */}
        <div className="absolute inset-0 overflow-hidden rounded-xl border border-line/12 bg-[#0b0b0f] [backface-visibility:hidden]">
          <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-label={name}>
            <defs>
              <radialGradient id={`glow-${initials}`} cx="50%" cy="42%" r="55%">
                <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
                <stop offset="100%" stopColor={accent} stopOpacity="0" />
              </radialGradient>
              <linearGradient id={`hood-${initials}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1b1b22" />
                <stop offset="100%" stopColor="#08080b" />
              </linearGradient>
            </defs>
            <rect width="120" height="120" fill="#08080b" />
            <rect width="120" height="120" fill={`url(#glow-${initials})`} />
            <g opacity="0.28" stroke={accent} strokeWidth="0.6">
              <path d="M0 96h24l6-6h18M120 34H98l-6 6H74M8 22h18l5 5h12M96 104h16" fill="none" />
              <circle cx="18" cy="18" r="1.4" fill={accent} stroke="none" />
              <circle cx="104" cy="88" r="1.4" fill={accent} stroke="none" />
            </g>
            {/* shoulders + hood */}
            <path
              d="M18 120c2-24 12-34 22-38 4-2 5-4 5-6h30c0 2 1 4 5 6 10 4 20 14 22 38z"
              fill={`url(#hood-${initials})`}
              stroke={accent}
              strokeOpacity="0.45"
              strokeWidth="1.1"
            />
            <path
              d="M38 52c2-15 10-24 22-24s20 9 22 24c1 7-2 13-6 16-4 3-9 4-16 4s-12-1-16-4c-4-3-7-9-6-16z"
              fill="#050507"
              stroke={accent}
              strokeOpacity="0.55"
              strokeWidth="1.2"
            />
            {/* eyes */}
            <g fill={accent}>
              <rect x="47" y="55" width="9" height="3.2" rx="1.6" opacity="0.95" />
              <rect x="64" y="55" width="9" height="3.2" rx="1.6" opacity="0.95" />
            </g>
            <path d="M50 74h20" stroke={accent} strokeOpacity="0.35" strokeWidth="1" />
            {/* scanline */}
            <rect width="120" height="2" fill={accent} opacity="0.18">
              <animate attributeName="y" values="0;118;0" dur="6s" repeatCount="indefinite" />
            </rect>
          </svg>
        </div>

        {/* back — code side */}
        <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-xl border border-line/12 bg-[#0b0b0f] p-3 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div aria-hidden className="absolute inset-0 opacity-[0.14]" style={{ color: accent }}>
            <svg viewBox="0 0 120 120" className="h-full w-full">
              <text x="6" y="18" fontFamily="monospace" fontSize="9" fill="currentColor">
                {initials}_0x
              </text>
              <text x="6" y="34" fontFamily="monospace" fontSize="9" fill="currentColor">
                01001010
              </text>
              <text x="6" y="50" fontFamily="monospace" fontSize="9" fill="currentColor">
                sudo -i
              </text>
              <text x="6" y="98" fontFamily="monospace" fontSize="9" fill="currentColor">
                SNT&#123;...&#125;
              </text>
            </svg>
          </div>
          <span className="relative font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: accent }}>
            access
          </span>
          <span className="relative font-display text-3xl font-semibold text-ink">{initials}</span>
        </div>
      </div>
    </div>
  );
}
