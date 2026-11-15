"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const KEY = "snt-entered-v2";

/**
 * Visual entry: binary dust converges, the seal ignites, then the screen
 * splits open. No instructions to read, no clicking required.
 */
export function Entrance() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"converge" | "ignite" | "open">("converge");

  const dust = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const angle = (i / 26) * Math.PI * 2 + (i % 3) * 0.4;
        const radius = 220 + ((i * 37) % 160);
        return {
          id: i,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          delay: (i % 9) * 0.045,
          char: i % 2 ? "0" : "1",
          size: i % 3 === 0 ? 11 : 9,
        };
      }),
    [],
  );

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("nointro")) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setOpen(true);
    document.documentElement.style.overflow = "hidden";
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }

    const t1 = window.setTimeout(() => setPhase("ignite"), reduce ? 120 : 900);
    const t2 = window.setTimeout(() => setPhase("open"), reduce ? 260 : 1900);
    const t3 = window.setTimeout(() => {
      document.documentElement.style.overflow = "";
      setOpen(false);
    }, reduce ? 400 : 2750);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="veil"
        className="fixed inset-0 z-[95] overflow-hidden bg-[#050506]"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        aria-hidden
      >
        {/* two panels that split apart */}
        <motion.div
          className="absolute inset-x-0 top-0 h-1/2 border-b border-ember/20 bg-[#050506]"
          animate={phase === "open" ? { y: "-100%" } : { y: 0 }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        />
        <motion.div
          className="absolute inset-x-0 bottom-0 h-1/2 border-t border-ember/20 bg-[#050506]"
          animate={phase === "open" ? { y: "100%" } : { y: 0 }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        />

        <div className="absolute inset-0 flex items-center justify-center">
          {/* red glow that blooms on ignite */}
          <motion.div
            className="absolute h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,45,61,0.35),transparent_65%)] blur-2xl"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={
              phase === "converge"
                ? { opacity: 0.25, scale: 0.7 }
                : { opacity: [0.9, 0.25], scale: [1, 1.5] }
            }
            transition={{ duration: 1.4, ease: "easeOut" }}
          />

          {/* binary dust converging */}
          {dust.map((p) => (
            <motion.span
              key={p.id}
              className="absolute font-mono text-ember/70"
              style={{ fontSize: p.size }}
              initial={{ x: p.x, y: p.y, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: [0, 0.9, 0] }}
              transition={{ duration: 1.35, delay: p.delay, ease: [0.4, 0, 0.2, 1] }}
            >
              {p.char}
            </motion.span>
          ))}

          {/* seal ignition */}
          <motion.div
            className="relative flex h-[168px] w-[168px] items-center justify-center"
            initial={{ scale: 0.82, opacity: 0 }}
            animate={
              phase === "converge"
                ? { scale: 0.9, opacity: 0.35, rotate: -6 }
                : { scale: 1, opacity: 1, rotate: 0 }
            }
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="absolute inset-0 rounded-full border border-ember/50"
              animate={{ scale: [1, 1.35], opacity: [0.8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
            <span className="absolute inset-2 rounded-full bg-ember/10 blur-md" />
            <Image
              src="/brand/logo.png"
              alt=""
              width={168}
              height={168}
              priority
              className="relative h-full w-full rounded-full object-contain drop-shadow-[0_0_35px_rgba(255,45,61,0.55)]"
            />
          </motion.div>
        </div>

        <motion.div
          className="absolute inset-x-0 bottom-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "open" ? 0 : 0.55 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.55em] text-white/50">
            Securinets · ISET Charguia
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
