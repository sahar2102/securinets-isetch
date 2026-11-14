"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Step {
  prompt: string;
  output: string;
  tone?: "muted" | "accent" | "ok";
}

/**
 * Terminal-style typing animation. Types the prompt, then prints the output
 * instantly (like a real shell). Reduced motion shows the final state.
 */
export function Terminal({ className }: { className?: string }) {
  const { t, locale } = useI18n();
  const steps: Step[] = [
    { prompt: t.home.terminal.line1, output: t.home.terminal.out1, tone: "muted" },
    { prompt: t.home.terminal.line2, output: t.home.terminal.out2, tone: "ok" },
    { prompt: t.home.terminal.line3, output: t.home.terminal.out3, tone: "muted" },
    { prompt: t.home.terminal.line4, output: t.home.terminal.out4, tone: "accent" },
  ];

  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    setStep(0);
    setTyped("");
    setShowOutput(false);
  }, [locale]);

  useEffect(() => {
    if (reduce.current) {
      setTyped(steps[step]?.prompt ?? "");
      setShowOutput(true);
      return;
    }

    const prompt = steps[step]?.prompt ?? "";
    if (typed.length < prompt.length) {
      const timer = setTimeout(() => setTyped(prompt.slice(0, typed.length + 1)), 45);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => setShowOutput(true), 240);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed, step, locale]);

  useEffect(() => {
    if (!showOutput) return;
    if (reduce.current) return;
    const timer = setTimeout(() => {
      if (step < steps.length - 1) {
        setStep((s) => s + 1);
        setTyped("");
        setShowOutput(false);
      }
    }, 2600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOutput, step, locale]);

  const current = steps[step];
  const finished = step === steps.length - 1;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0f]/95 shadow-[0_30px_80px_-40px_rgba(179,0,27,0.8)] backdrop-blur",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ms-2 font-mono text-[11px] tracking-wide text-white/40">
          student@snt-isetch: ~/range
        </span>
        <span className="ms-auto font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
          bash
        </span>
      </div>

      <div className="min-h-[220px] px-4 py-5 font-mono text-[12.5px] leading-relaxed sm:px-5 sm:text-[13px]">
        {steps.slice(0, step).map((s, i) => (
          <div key={i} className="mb-3">
            <p className="text-white/40">
              <span className="text-ember">➜</span> {s.prompt}
            </p>
            <p className={toneClass(s.tone)}>{s.output}</p>
          </div>
        ))}

        <div>
          <p className="text-white/80">
            <span className="text-ember">➜</span> {typed}
            <span className="ms-0.5 inline-block h-3.5 w-[7px] translate-y-0.5 animate-caret bg-ember/80" />
          </p>
          {showOutput && current ? <p className={toneClass(current.tone)}>{current.output}</p> : null}
          {showOutput && finished ? (
            <p className="mt-1 text-white/35">
              <span className="text-white/50">$</span> _
            </p>
          ) : null}
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.18)_50%)] bg-[length:100%_4px] opacity-40" />
    </div>
  );
}

function toneClass(tone?: Step["tone"]) {
  if (tone === "accent") return "text-ember";
  if (tone === "ok") return "text-[#2FBF8F]";
  return "text-white/45";
}
