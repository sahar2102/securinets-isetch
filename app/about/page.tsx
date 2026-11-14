import type { Metadata } from "next";
import { AboutPage } from "@/components/sections/about";

export const metadata: Metadata = {
  title: "About the club",
  description:
    "Nine students, one projector, a lot of stubbornness: how Securinets ISET Charguia relaunched in 2026 and what the club stands for.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return <AboutPage />;
}
