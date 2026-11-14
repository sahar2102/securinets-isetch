import type { Metadata } from "next";
import { LeaderboardPage } from "@/components/sections/leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "Top CTF players of Securinets ISET Charguia. Filter by all-time or the current season.",
  alternates: { canonical: "/leaderboard" },
};

export default function Page() {
  return <LeaderboardPage />;
}
