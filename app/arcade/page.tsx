import type { Metadata } from "next";
import { Arcade } from "@/components/arcade/arcade";

export const metadata: Metadata = {
  title: "Arcade — playable security puzzles",
  description:
    "Four short, playable security games from Securinets ISET Charguia: a cipher wheel, a phishing inbox, a port-reflex sprint and a byte-rebuild puzzle. No account needed.",
  alternates: { canonical: "/arcade" },
};

export default function Page() {
  return (
    <main className="pt-28">
      <div className="container-x pb-12 pt-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-ember">Arcade</p>
        <h1 className="mt-4 max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.05] text-ink sm:text-6xl">
          Play first. <span className="text-ember">Understand second.</span>
        </h1>
        <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-muted">
          Four small games that teach the reflexes behind real challenges. Best scores stay in your
          browser; nothing to install, no account.
        </p>
      </div>
      <Arcade />
    </main>
  );
}
