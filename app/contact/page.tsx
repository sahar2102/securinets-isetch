import type { Metadata } from "next";
import { ContactPage } from "@/components/sections/contact";

export const metadata: Metadata = {
  title: "Contact & FAQ",
  description:
    "Contact the board of Securinets ISET Charguia: partnerships, workshops, press, or vulnerability reports. Plus the club FAQ.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return <ContactPage />;
}
