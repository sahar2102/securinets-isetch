import type { Metadata } from "next";
import { JoinPage } from "@/components/sections/join";

export const metadata: Metadata = {
  title: "Join the club",
  description:
    "Membership application for Securinets ISET Charguia. Free for ISET Charguia students, open to all Tunisian students for online activities.",
  alternates: { canonical: "/join" },
};

export default function Page() {
  return <JoinPage />;
}
