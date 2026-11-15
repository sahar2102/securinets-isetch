import type { Metadata } from "next";
import { getPublicChallenges } from "@/lib/challenges";
import { ChallengeExplorer } from "@/components/challenges/explorer";
import { TeaserRange } from "@/components/challenges/teaser-range";
import { canUseChallenges, getViewer } from "@/lib/access";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Challenge hub — 49 CTF challenges",
  description:
    "Web, crypto, forensics, reverse engineering, pwn, OSINT, steganography, network, Linux and misc challenges. Filter by category and difficulty, submit flags, track your score.",
  alternates: { canonical: "/challenges" },
};

export default async function ChallengesPage() {
  const challenges = await getPublicChallenges();
  const viewer = await getViewer();
  if (!canUseChallenges(viewer?.role)) {
    return (
      <main className="pt-24">
        <div className="container-x pb-10 pt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-ember">Challenge hub</p>
          <h1 className="mt-4 max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.05] text-ink sm:text-5xl">
            Most of the range is hidden.
          </h1>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-muted">
            Two challenges are open as a preview. The other 47 unlock once an admin approves your
            account — same rule for everyone, including the board.
          </p>
        </div>
        <TeaserRange preview={challenges.slice(0, 2)} state={viewer ? "pending" : "guest"} />
      </main>
    );
  }

  return <ChallengeExplorer challenges={challenges} />;
}
