/**
 * Single source of truth for club identity, navigation and static copy that
 * isn't translated. Edit this file to rebrand the whole site.
 */

export const site = {
  name: "Securinets ISET Charguia",
  shortName: "Securinets ISET",
  legalName: "Securinets — Branche ISET Charguia",
  tagline: "Offensive security, taught in the open.",
  description:
    "The Securinets branch at ISET Charguia, Tunis. A student community for cybersecurity: workshops, CTFs, and an open challenge platform.",
  founded: "2026",
  parentOrg: "Securinets",
  parentUrl: "https://securinets.tn",
  city: "Tunis",
  country: "Tunisia",
  address: "ISET Charguia, Charguia II, Ariana, Tunisia",
  email: "securinetsisetch26@gmail.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://securinets-isetch.tn",
  clubPrefix: "SNT-ISETCH-2026",
  socials: [
    {
      key: "facebook",
      label: "Facebook",
      href: "https://www.facebook.com/share/1FVx6a8Nmf/?mibextid=wwXIfr",
      handle: "Securinets ISET Charguia",
    },
    {
      key: "instagram",
      label: "Instagram",
      href: "https://www.instagram.com/securinets_isetch",
      handle: "@securinets_isetch",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/securinets-iset-charguia/",
      handle: "/securinets-iset-charguia",
    },
    {
      key: "discord",
      label: "Discord",
      href: "https://discord.gg/5eQX5FXc6",
      handle: "discord.gg/5eQX5FXc6",
    },
  ],
} as const;

export type SocialKey = (typeof site.socials)[number]["key"];

export const nav = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "challenges", href: "/challenges" },
  { key: "arcade", href: "/arcade" },
  { key: "events", href: "/events" },
  { key: "learning", href: "/learning" },
  { key: "leaderboard", href: "/leaderboard" },
  { key: "team", href: "/team" },
  { key: "contact", href: "/contact" },
] as const;

export const stats = [
  { key: "members", value: 45, suffix: "+", label: "Active members" },
  { key: "challenges", value: 49, suffix: "", label: "Live challenges" },
  { key: "events", value: 3, suffix: "", label: "Events & workshops" },
  { key: "writeups", value: 0, suffix: "", label: "Writeups published" },
] as const;

/** Difficulty scale shared by the challenge hub and leaderboard badges. */
export const difficulties = {
  beginner: {
    label: "Beginner",
    alias: "Rookie",
    color: "#2FBF8F",
    text: "#062B21",
    points: [50, 100],
    dots: 1,
  },
  intermediate: {
    label: "Intermediate",
    alias: "Operator",
    color: "#F5A524",
    text: "#2B1B00",
    points: [150, 250],
    dots: 2,
  },
  advanced: {
    label: "Advanced",
    alias: "Specialist",
    color: "#FB7A3C",
    text: "#2B1000",
    points: [300, 400],
    dots: 3,
  },
  expert: {
    label: "Expert",
    alias: "Insane",
    color: "#FF2D3D",
    text: "#2B0005",
    points: [500, 900],
    dots: 4,
  },
} as const;

export type Difficulty = keyof typeof difficulties;

export const categories = [
  {
    slug: "web",
    name: "Web",
    icon: "globe",
    accent: "#FF2D3D",
    blurb: "HTTP, auth bypass, injection, and the messy reality of the modern web.",
  },
  {
    slug: "crypto",
    name: "Cryptography",
    icon: "key",
    accent: "#A78BFA",
    blurb: "Broken ciphers, reused nonces, and math that was almost right.",
  },
  {
    slug: "forensics",
    name: "Forensics",
    icon: "search",
    accent: "#38BDF8",
    blurb: "Recover artefacts from disks, memory dumps and damaged files.",
  },
  {
    slug: "reverse",
    name: "Reverse Engineering",
    icon: "cpu",
    accent: "#F5A524",
    blurb: "Read binaries like source. Find the check, then break it.",
  },
  {
    slug: "pwn",
    name: "Pwn / Binary",
    icon: "bug",
    accent: "#FF6B6B",
    blurb: "Stack smashes, format strings, and controlled chaos on x86-64.",
  },
  {
    slug: "osint",
    name: "OSINT",
    icon: "radar",
    accent: "#2FBF8F",
    blurb: "Open sources only. Think like an investigator, not a scanner.",
  },
  {
    slug: "stego",
    name: "Steganography",
    icon: "layers",
    accent: "#F472B6",
    blurb: "Data hiding in plain sight: pixels, audio, metadata, whitespace.",
  },
  {
    slug: "network",
    name: "Network",
    icon: "network",
    accent: "#34D399",
    blurb: "Packet analysis, strange protocols, and traffic that lies.",
  },
  {
    slug: "linux",
    name: "Linux / Bash",
    icon: "terminal",
    accent: "#FBBF24",
    blurb: "The shell is the weapon. Permissions, pipes, persistence.",
  },
  {
    slug: "misc",
    name: "Misc / Programming",
    icon: "puzzle",
    accent: "#94A3B8",
    blurb: "Scripting, encodings, and puzzles that refuse to be categorised.",
  },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export const values = [
  {
    key: "curiosity",
    title: "Curiosity over credentials",
    body: "You do not need a certification to ask a good question here. Beginners are the point, not a footnote.",
  },
  {
    key: "ethics",
    title: "Ethics before exploits",
    body: "We teach attack to build defence — legally, on our own infrastructure, with a written code of conduct.",
  },
  {
    key: "openness",
    title: "Learn in the open",
    body: "Every workshop ships its slides, every challenge ships a writeup path. Knowledge that stays in a room dies there.",
  },
  {
    key: "craft",
    title: "Depth over hype",
    body: "We would rather you understand one stack frame than recite ten tools. Craft compounds.",
  },
] as const;

export const pillars = [
  {
    key: "workshops",
    title: "Hands-on workshops",
    body: "Two-hour sessions on Linux, networking, web security and crypto — always with a lab you can break safely.",
    meta: "Regular sessions · on campus",
    icon: "terminal",
  },
  {
    key: "ctf",
    title: "CTF training & competitions",
    body: "Internal jeopardy rounds, team selection, and coached participation in national and international CTFs.",
    meta: "Season-long · team events",
    icon: "flag",
  },
  {
    key: "training",
    title: "Structured training tracks",
    body: "A beginner-to-intermediate roadmap with mentors, checkpoints and a public leaderboard to keep you honest.",
    meta: "Guided beginner track",
    icon: "route",
  },
  {
    key: "talks",
    title: "Talks & industry nights",
    body: "Practitioners from Tunisian SOCs, pentest firms and startups share what the job actually looks like.",
    meta: "Open sessions · all students",
    icon: "mic",
  },
] as const;

export const partners = [
  { name: "Securinets", kind: "Parent association", url: "https://securinets.tn" },
  { name: "ISET Charguia", kind: "Host institution", url: "https://www.isetcharguia.rnu.tn" },
] as const;

export const journey = [
  {
    year: "2026",
    month: "September",
    title: "A new bureau",
    body: "The Securinets ISET Charguia team for 2026 is presented: a president, a board, and technical, media, HR and sponsorship teams.",
  },
  {
    year: "2026",
    month: "October",
    title: "Introduction à la Cybersécurité",
    body: "Our first public workshop, online: the threat landscape, the jobs in security, and a first look at how a CTF works.",
  },
  {
    year: "2026",
    month: "October",
    title: "Linux, then CTF",
    body: "Two more workshops in the same month: an introduction to Linux, then an introduction to Capture The Flag with a live mini-competition.",
  },
  {
    year: "2026",
    month: "November",
    title: "The challenge platform",
    body: "The club opens this permanent challenge range and learning roadmap, free for every student in Tunisia.",
  },
  {
    year: "2027",
    month: "Next",
    title: "What we are building",
    body: "More workshops, an internal league, writeups from our members, and a team for national CTF competitions.",
  },
] as const;

export const faq = [
  {
    q: "Do I need any experience to join?",
    a: "No. Our beginner sessions assume you can use a computer and nothing more — we start from Linux, networking and the first tools. Many of our members joined with no security background at all.",
  },
  {
    q: "Is membership free?",
    a: "Yes. Membership is free for ISET Charguia students. Some optional activities (travel to external CTFs, paid certifications) are cost-shared, and we actively look for sponsors to cover them.",
  },
  {
    q: "How much time does it take?",
    a: "It depends on you: attend the workshops, then practise on the challenge platform at your own pace. Competition teams commit more in the weeks before an event.",
  },
  {
    q: "Is hacking here legal?",
    a: "Everything we teach happens on infrastructure we own or on deliberately vulnerable targets. You sign a code of conduct on joining; any real-world testing requires written authorization. We do not support or tolerate unauthorized access.",
  },
  {
    q: "Can students from other schools join?",
    a: "Our online workshops and the challenge platform are open to all Tunisian students. Official membership and certificates are for enrolled ISET Charguia students.",
  },
  {
    q: "How do certificates work?",
    a: "Workshops we certify issue an attestation with a unique number in the format SNT-ISETCH-2026-001. Anyone — an employer, a university — can verify it on our verification page.",
  },
] as const;

export const roadmap = [
  {
    stage: "01",
    key: "foundations",
    title: "Foundations",
    weeks: "Weeks 1–2",
    body: "How computers, networks and the web actually work. No tools yet — just the mental model everything else hangs on.",
    topics: ["OSI & TCP/IP", "HTTP & DNS", "Linux file system", "Command line basics"],
  },
  {
    stage: "02",
    key: "linux",
    title: "Linux & scripting",
    weeks: "Weeks 3–4",
    body: "Become dangerous in a shell: permissions, processes, pipes, and just enough Python and Bash to automate the boring parts.",
    topics: ["Permissions & users", "grep / sed / awk", "Bash scripting", "Python for tooling"],
  },
  {
    stage: "03",
    key: "web",
    title: "Web security",
    weeks: "Weeks 5–6",
    body: "The OWASP Top 10 in a lab you are allowed to destroy. Burp Suite, request tampering, injection and broken access control.",
    topics: ["Burp Suite", "SQLi & XSS", "Auth flaws", "IDOR & SSRF"],
  },
  {
    stage: "04",
    key: "crypto",
    title: "Cryptography",
    weeks: "Week 7",
    body: "Not a math degree — the practical failures: weak keys, reused nonces, ECB oracles and padding that tells you too much.",
    topics: ["Encoding vs encryption", "AES modes", "RSA pitfalls", "Hashing & HMAC"],
  },
  {
    stage: "05",
    key: "forensics",
    title: "Forensics & blue team",
    weeks: "Week 8",
    body: "Read the evidence: disk images, memory, logs and pcap. Learn how defenders reconstruct what an attacker did.",
    topics: ["Autopsy & volatility", "Timeline analysis", "Wireshark", "Log triage"],
  },
  {
    stage: "06",
    key: "ctf",
    title: "Your first CTF",
    weeks: "Ongoing",
    body: "Put it together under a clock. Learn to split categories, read a challenge, ask for a hint, and write the writeup afterwards.",
    topics: ["Team roles", "Method & notes", "Hints & scoring", "Writeup craft"],
  },
] as const;

export const tools = [
  { name: "Kali Linux", use: "Attack VM", group: "Environment" },
  { name: "VirtualBox / VMware", use: "Isolated labs", group: "Environment" },
  { name: "Wireshark", use: "Packet analysis", group: "Network" },
  { name: "Nmap", use: "Recon & enumeration", group: "Network" },
  { name: "Burp Suite", use: "Web proxy", group: "Web" },
  { name: "ffuf", use: "Content discovery", group: "Web" },
  { name: "sqlmap", use: "Injection testing", group: "Web" },
  { name: "Ghidra", use: "Decompilation", group: "Reverse" },
  { name: "gdb + pwndbg", use: "Debugging", group: "Pwn" },
  { name: "pwntools", use: "Exploit scripting", group: "Pwn" },
  { name: "CyberChef", use: "Encoding Swiss army knife", group: "Utility" },
  { name: "ExifTool", use: "Metadata inspection", group: "Forensics" },
  { name: "binwalk", use: "Firmware & file carving", group: "Forensics" },
  { name: "hashcat", use: "Password cracking", group: "Crypto" },
] as const;

export const resources = [
  {
    title: "TryHackMe — Complete Beginner",
    kind: "Interactive path",
    level: "Beginner",
    url: "https://tryhackme.com/path/outline/beginner",
    note: "The best zero-to-first-shell path. Free rooms are enough for weeks 1–3.",
  },
  {
    title: "OverTheWire: Bandit",
    kind: "Wargame",
    level: "Beginner",
    url: "https://overthewire.org/wargames/bandit/",
    note: "SSH and shell fundamentals through 34 levels of pure Linux.",
  },
  {
    title: "PortSwigger Web Security Academy",
    kind: "Labs",
    level: "Beginner → Advanced",
    url: "https://portswigger.net/web-security",
    note: "Free, browser-based labs written by the people who make Burp.",
  },
  {
    title: "picoCTF",
    kind: "CTF archive",
    level: "Beginner",
    url: "https://picoctf.org/",
    note: "Hundreds of beginner challenges with official writeups.",
  },
  {
    title: "CryptoHack",
    kind: "Course",
    level: "Intermediate",
    url: "https://cryptohack.org/",
    note: "Cryptography from modular arithmetic to RSA attacks, gamified.",
  },
  {
    title: "pwn.college",
    kind: "Course",
    level: "Intermediate → Expert",
    url: "https://pwn.college/",
    note: "Arizona State's binary exploitation curriculum. Free and brutal.",
  },
] as const;

export const achievements = [
  { key: "first-blood", name: "First Blood", desc: "Solve your first challenge.", icon: "droplet" },
  { key: "web-master", name: "Web Master", desc: "Clear every Web challenge.", icon: "globe" },
  { key: "crypto-nerd", name: "Crypto Nerd", desc: "Clear every Cryptography challenge.", icon: "key" },
  { key: "ghost", name: "Ghost in the Wires", desc: "Clear every Network challenge.", icon: "network" },
  { key: "polyglot", name: "Polyglot", desc: "Solve at least one challenge in 5 categories.", icon: "layers" },
  { key: "insane", name: "Certified Insane", desc: "Solve an Expert challenge.", icon: "skull" },
  { key: "streak", name: "Hat Trick", desc: "Solve 3 challenges in one day.", icon: "flame" },
  { key: "century", name: "Century", desc: "Reach 1,000 points.", icon: "trophy" },
] as const;

export const announcements = [
  {
    id: "a1",
    date: "2026-11-10",
    tag: "Platform",
    title: "The challenge hub is open",
    body: "49 challenges across 10 categories are live. Start with the Rookie track and claim your first flag.",
  },
  {
    id: "a2",
    date: "2026-11-04",
    tag: "Workshop",
    title: "Web exploitation, part 2",
    body: "Burp Suite, IDOR and SQLi — on campus, room B12. Bring a laptop with Kali installed.",
  },
  {
    id: "a3",
    date: "2026-10-20",
    tag: "Call",
    title: "CTF team selection",
    body: "Applications for the spring national squad are open until 30 November. Beginners welcome.",
  },
] as const;
