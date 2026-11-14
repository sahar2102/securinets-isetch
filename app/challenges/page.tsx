import type { Metadata } from "next";
import { getPublicChallenges } from "@/lib/challenges";
import { ChallengeExplorer } from "@/components/challenges/explorer";
import { MembersGate } from "@/components/challenges/members-gate";
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
  if (!canUseChallenges(viewer?.role)) {
    return <MembersGate state={viewer ? "pending" : "guest"} />;
  }

  const challenges = await getPublicChallenges();
  return <ChallengeExplorer challenges={challenges} />;
}
