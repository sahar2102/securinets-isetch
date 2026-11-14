import type { Metadata } from "next";
import { getPublicChallenges } from "@/lib/challenges";
import { getAnnouncements, getUpcomingEvents } from "@/lib/content";
import { HomeSections } from "@/components/sections/home";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Securinets ISET Charguia — Cybersecurity Club, Tunis",
  description:
    "The student cybersecurity club of ISET Charguia, Tunis. Workshops, CTF training and 49 self-contained challenges open to every Tunisian student.",
};

export default async function HomePage() {
  const [challenges, upcoming, announcements] = await Promise.all([
    getPublicChallenges(),
    getUpcomingEvents(),
    getAnnouncements(),
  ]);

  const featured = challenges.filter((c) => c.featured).slice(0, 3);
  const fallback = challenges
    .filter((c) => c.difficulty === "beginner")
    .slice(0, 3);
  const picks = featured.length === 3 ? featured : [...featured, ...fallback].slice(0, 3);

  const nextEvent = upcoming.find((e) => e.featured) ?? upcoming[0] ?? null;

  return (
    <HomeSections
      challenges={challenges}
      featured={picks}
      nextEvent={nextEvent}
      counts={{ total: challenges.length, solves: challenges.reduce((n, c) => n + c.solves, 0) }}
      announcements={announcements.slice(0, 1)}
    />
  );
}
