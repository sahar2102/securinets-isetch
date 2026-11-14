import type { Metadata } from "next";
import { getPublicChallenges } from "@/lib/challenges";
import { ChallengeExplorer } from "@/components/challenges/explorer";
import { LockedRange } from "@/components/challenges/locked-range";
import { canUseChallenges, getViewer } from "@/lib/access";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Challenge hub — 49 CTF challenges",
  description:
    "Web, crypto, forensics, reverse engineering, pwn, OSINT, steganography, network, Linux and misc challenges. Filter by category and difficulty, submit flags, track your score.",
  alternates: { canonical: "/challenges" },
};

export default async function ChallengesPage() {
  const viewer = await getViewer();
  const all = await getPublicChallenges();

  if (!canUseChallenges(viewer?.role)) {
    const preview = all
      .filter((challenge) => challenge.difficulty === "beginner")
      .slice(0, 4);
    return <LockedRange state={viewer ? "pending" : "guest"} preview={preview} total={all.length} />;
  }

  const challenges = await getPublicChallenges();
  return <ChallengeExplorer challenges={challenges} />;
}
