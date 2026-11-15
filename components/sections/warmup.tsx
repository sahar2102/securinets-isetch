"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";


interface Task {
  id: string;
  label: string;
  prompt: string;
  hint: string;
  answer: string;
  mono?: boolean;
}

const TASKS: Task[] = [
  {
    id: "rot13",
    label: "01 / shift",
    prompt: "Frphevargf{ebg13_vf_n_fgneg}",
    hint: "Every letter moved thirteen places. Move it back.",
    answer: "securinets{rot13_is_a_start}",
    mono: true,
  },
  {
    id: "hex",
    label: "02 / bytes",
    prompt: "53 4e 54 7b 68 33 78 5f 31 73 5f 66 75 6e 7d",
    hint: "Two hex digits per character.",
    answer: "snt{h3x_1s_fun}",
    mono: true,
  },
  {
    id: "base64",
    label: "03 / base",
    prompt: "U05Ue2I0czNfMTBfZGVjMH0=",
    hint: "It ends with = for a reason.",
    answer: "snt{b4s3_10_dec0}",
    mono: true,
  },
];

function TaskCard({ task }: { task: Task }) {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "no">("idle");
  const [revealed, setRevealed] = useState(false);

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = value.trim().toLowerCase() === task.answer;
    setState(ok ? "ok" : "no");
  };

  return (
    <form
      onSubmit={check}
      className={cn(
        "relative flex flex-col rounded-2xl border p-5 transition",
        state === "ok" ? "border-emerald-500/40 bg-emerald-500/5" : "border-line/10 bg-elev/40 hover:border-line/20",
      )}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ember">{task.label}</span>
      <pre className="mt-3 overflow-x-auto rounded-lg border border-line/10 bg-black/40 p-3 font-mono text-[11.5px] leading-relaxed text-white/80">
        {task.prompt}
      </pre>
      <div className="mt-4 flex gap-2">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setState("idle");
          }}
          placeholder="SNT{...}"
          aria-label={`Answer for ${task.label}`}
          className="min-w-0 flex-1 rounded-lg border border-line/15 bg-canvas/70 px-3 py-2 font-mono text-[12px] text-ink outline-none placeholder:text-muted/60 focus:border-ember/60"
        />
        <button
          type="submit"
          className="rounded-lg border border-ember/40 bg-ember/10 px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ember hover:bg-ember/20"
        >
          {t.home.warmupSolve}
        </button>
      </div>
      {state !== "idle" ? (
        <p className={cn("mt-3 text-[12px]", state === "ok" ? "text-emerald-400" : "text-muted")}>
          {state === "ok" ? t.home.warmupCorrect : t.home.warmupWrong}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        className="mt-3 flex items-center gap-1.5 text-start text-[11px] text-muted hover:text-ink"
      >
        <span aria-hidden>{revealed ? "−" : "+"}</span>
        {revealed ? task.answer : `${t.home.warmupReveal} · ${task.hint}`}
      </button>
    </form>
  );
}

export function Warmup() {
  const { t } = useI18n();
  return (
    <section className="border-t border-line/10 py-20">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:items-start">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-ember">
              {t.home.warmupKicker}
            </span>
            <h2 className="mt-4 text-balance font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              {t.home.warmupTitle}
            </h2>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted">{t.home.warmupBody}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {TASKS.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
