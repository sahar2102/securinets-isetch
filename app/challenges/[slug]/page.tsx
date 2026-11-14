import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllChallenges, getChallenge, toPublic } from "@/lib/challenges";
import { ChallengeDetail } from "@/components/challenges/detail";
import { MembersGate } from "@/components/challenges/members-gate";
import { canUseChallenges, getViewer } from "@/lib/access";

export const revalidate = 120;

export async function generateStaticParams() {
  const challenges = await getAllChallenges();
  return challenges.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const challenge = await getChallenge(slug);
  if (!challenge) return { title: "Challenge not found" };

  const description = challenge.description
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_`>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);

  return {
    title: `${challenge.title} — ${challenge.points} pts`,
    description,
    alternates: { canonical: `/challenges/${challenge.slug}` },
    openGraph: {
      title: `${challenge.title} · Securinets CTF`,
      description,
      type: "article",
    },
  };
}

export default async function ChallengePage({ params }: { params: Promise<{ slug: string }> }) {
  const viewer = await getViewer();
  if (!canUseChallenges(viewer?.role)) {
    return <MembersGate state={viewer ? "pending" : "guest"} />;
  }

  const { slug } = await params;
  const challenge = await getChallenge(slug);
  if (!challenge) notFound();

  const all = await getAllChallenges();
  const related = all
    .filter((c) => c.slug !== challenge.slug && c.category === challenge.category)
    .slice(0, 4)
    .map(toPublic);

  return <ChallengeDetail challenge={toPublic(challenge)} related={related} />;
}
