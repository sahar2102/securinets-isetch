import type { SVGProps } from "react";

export type IconName =
  | "globe"
  | "key"
  | "search"
  | "cpu"
  | "bug"
  | "radar"
  | "layers"
  | "network"
  | "terminal"
  | "puzzle"
  | "flag"
  | "route"
  | "mic"
  | "skull"
  | "flame"
  | "trophy"
  | "droplet"
  | "github"
  | "linkedin"
  | "discord"
  | "facebook"
  | "instagram"
  | "arrowRight"
  | "arrowUpRight"
  | "arrowLeft"
  | "menu"
  | "close"
  | "sun"
  | "moon"
  | "check"
  | "x"
  | "download"
  | "chevronDown"
  | "chevronRight"
  | "mail"
  | "mapPin"
  | "clock"
  | "users"
  | "calendar"
  | "spark"
  | "shield"
  | "external"
  | "copy"
  | "bulb"
  | "lock"
  | "unlock"
  | "filter"
  | "grid"
  | "code"
  | "send"
  | "badge";

const paths: Record<IconName, React.ReactNode> = {
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="m10.8 12.2 8-8M16 5l3 3M13.5 7.5l3 3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  cpu: (
    <>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2" />
      <rect x="10" y="10" width="4" height="4" />
      <path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3" />
    </>
  ),
  bug: (
    <>
      <rect x="7" y="8" width="10" height="11" rx="5" />
      <path d="M9 5.5a3 3 0 0 1 6 0M4 11h3M17 11h3M4 16h3M17 16h3M8 19l-2 2M16 19l2 2" />
    </>
  ),
  radar: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 12 19 6M12 12v9" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
      <path d="m4 12 8 4.5 8-4.5M4 16.5 12 21l8-4.5" />
    </>
  ),
  network: (
    <>
      <rect x="9" y="3" width="6" height="5" rx="1" />
      <rect x="3" y="16" width="6" height="5" rx="1" />
      <rect x="15" y="16" width="6" height="5" rx="1" />
      <path d="M12 8v8M6 16v-4h12v4" />
    </>
  ),
  terminal: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 3 3-3 3M13 15h4" />
    </>
  ),
  puzzle: (
    <path d="M10 4a2 2 0 1 1 4 0v1h3a1 1 0 0 1 1 1v3h1a2 2 0 1 1 0 4h-1v4a1 1 0 0 1-1 1h-4v-1a2 2 0 1 0-4 0v1H6a1 1 0 0 1-1-1v-4H4a2 2 0 1 1 0-4h1V6a1 1 0 0 1 1-1h4V4Z" />
  ),
  flag: (
    <>
      <path d="M5 21V4M5 4h11l-1.5 4L16 12H5" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h6a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h6" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
    </>
  ),
  skull: (
    <>
      <path d="M5 11a7 7 0 0 1 14 0v3a3 3 0 0 1-2 2.8V20H7v-3.2A3 3 0 0 1 5 14v-3Z" />
      <circle cx="9.5" cy="11" r="1.3" />
      <circle cx="14.5" cy="11" r="1.3" />
      <path d="M10 16h4" />
    </>
  ),
  flame: (
    <path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-.8-.3-1.5-.3-1.5 2 1.4 3.3 3.4 3.3 6a5 5 0 0 1-10 0c0-4.5 4-6 5-11.5Z" />
  ),
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3M12 13v4M9 21h6M10 17h4" />
    </>
  ),
  droplet: <path d="M12 3s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10Z" />,
  github: (
    <path d="M9 19c-4 1.2-4-2.5-6-3m12 6v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V22" />
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 10v7M8 7v.5M12 17v-4a2 2 0 0 1 4 0v4" />
    </>
  ),
  discord: (
    <>
      <path d="M8.5 6.5C6 7 4.5 8 4.5 8S3 11 3 14c0 0 1.5 2 4 2l1-1.5M15.5 6.5c2.5.5 4 1.5 4 1.5s1.5 3 1.5 6c0 0-1.5 2-4 2l-1-1.5" />
      <path d="M8.5 6.5 9 5c1.8-.4 4.2-.4 6 0l.5 1.5M8 13.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4ZM16 13.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z" />
    </>
  ),
  facebook: <path d="M14.5 8.5H17V5h-2.5A4.5 4.5 0 0 0 10 9.5V12H7.5v3.5H10V22h3.5v-6.5H16l.5-3.5h-3V9.5c0-.6.4-1 1-1Z" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  arrowRight: <path d="M4 12h15M13 6l6 6-6 6" />,
  arrowLeft: <path d="M20 12H5M11 18l-6-6 6-6" />,
  arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
    </>
  ),
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  download: <path d="M12 3v12M7 11l5 5 5-5M5 21h14" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  mapPin: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5a3 3 0 0 1 0 6M18 20a6 6 0 0 0-2-4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </>
  ),
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />,
  shield: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 3.5 10.8V16h-7v-2.2A6 6 0 0 1 12 3Z" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10" width="15" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  unlock: (
    <>
      <rect x="4.5" y="10" width="15" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 7.5-2" />
    </>
  ),
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" />,
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  code: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14" />,
  send: <path d="M21 3 3 10.5l7 2.5 2.5 7L21 3ZM10 13l4-4" />,
  badge: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="m8.5 13.5-1.5 7 5-2.5 5 2.5-1.5-7" />
    </>
  ),
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] ?? paths.grid}
    </svg>
  );
}
