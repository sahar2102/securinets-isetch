import type { Metadata } from "next";
import { LearningPage } from "@/components/sections/learning";

export const metadata: Metadata = {
  title: "Learning hub",
  description:
    "An eight-week beginner roadmap for cybersecurity: Linux, networking, web, crypto and forensics, with recommended free resources and tools.",
  alternates: { canonical: "/learning" },
};

export default function Page() {
  return <LearningPage />;
}
