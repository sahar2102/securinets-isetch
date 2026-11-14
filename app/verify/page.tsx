import type { Metadata } from "next";
import { VerifyPage } from "@/components/sections/verify";

export const metadata: Metadata = {
  title: "Verify a certificate",
  description:
    "Check a Securinets ISET Charguia certificate number (SNT-ISETCH-2026-XXX) to confirm the holder, activity and hours.",
  alternates: { canonical: "/verify" },
};

export default function Page() {
  return <VerifyPage />;
}
