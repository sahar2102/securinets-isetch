import type { Metadata } from "next";
import { getTeam } from "@/lib/content";
import { TeamPage } from "@/components/sections/team";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "The team",
  description:
    "Meet the board, tech, HR, communication, events and mentor teams behind Securinets ISET Charguia.",
  alternates: { canonical: "/team" },
};

export default async function Page() {
  const members = await getTeam();
  return <TeamPage members={members} />;
}
