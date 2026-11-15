"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Line {
  kind: "cmd" | "out" | "muted" | "err";
  text: string;
}

const BOOT: Line[] = [
  { kind: "muted", text: "securinets range shell · v2026.11" },
  { kind: "out", text: "student@isetcharguia — curious, unverified" },
  { kind: "muted", text: "type `help` to see what this shell can do" },
];

/**
 * A real (small) shell. Commands are handled locally, some of them navigate.
 * Keeps the terminal aesthetic while giving visitors something to actually do.
 */
export function Terminal({ className }: { className?: string }) {
  const { locale } = useI18n();
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [ready, setReady] = useState(false);
  const [typed, setTyped] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // type the boot sequence once
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLines(BOOT);
      setReady(true);
      return;
    }
    let cancelled = false;
    const run = async () => {
      for (let i = 0; i < BOOT.length; i++) {
        await new Promise((r) => setTimeout(r, 420));
        if (cancelled) return;
        setLines(BOOT.slice(0, i + 1));
        setTyped(i + 1);
      }
      if (!cancelled) setReady(true);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  const push = (next: Line[]) => setLines((prev) => [...prev, ...next]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    const [head, ...rest] = cmd.toLowerCase().split(/\s+/);
    const arg = rest.join(" ");
    push([{ kind: "cmd", text: cmd }]);

    switch (head) {
      case "help":
        push([
          { kind: "out", text: "whoami      who you are here" },
          { kind: "out", text: "ls          list sections" },
          { kind: "out", text: "cat about   our story in one paragraph" },
          { kind: "out", text: "events      next event and where" },
          { kind: "out", text: "arcade      four playable puzzles" },
          { kind: "out", text: "join        become a member" },
          { kind: "out", text: "clear       wipe the screen" },
        ]);
        break;
      case "whoami":
        push([{ kind: "out", text: "student@isetcharguia — curious, unverified" }]);
        break;
      case "ls":
        push([{ kind: "out", text: "about/   challenges/   events/   arcade/   team/   join/" }]);
        break;
      case "cat":
        push([
          {
            kind: "out",
            text:
              arg === "about"
                ? "Securinets ISET Charguia — students who learn security by breaking things in a lab we own. Workshops, CTFs, and an open range."
                : "cat: usage: cat about",
          },
        ]);
        break;
      case "events":
        push([
          { kind: "out", text: "next: Internal CTF — 25 Nov 2026 · 14:00 · Salle 4C, 3e étage" },
          { kind: "muted", text: "run `open events` to see the calendar" },
        ]);
        break;
      case "arcade":
        push([{ kind: "out", text: "4 games: cipher · phish · ports · hex" }]);
        setTimeout(() => router.push("/arcade"), 450);
        break;
      case "join":
        setTimeout(() => router.push("/join"), 400);
        push([{ kind: "out", text: "opening membership form…" }]);
        break;
      case "open":
        if (["events", "challenges", "arcade", "about", "join"].includes(arg)) {
          setTimeout(() => router.push(`/${arg}`), 350);
          push([{ kind: "out", text: `opening /${arg}…` }]);
        } else {
          push([{ kind: "err", text: "open: try about, events, challenges, arcade, join" }]);
        }
        break;
      case "sudo":
        push([{ kind: "err", text: "student is not in the sudoers file. This incident has been logged. (it has not)" }]);
        break;
      case "flag":
        push([{ kind: "muted", text: "nice try. flags live in the range, not in the shell." }]);
        break;
      case "clear":
        setLines([]);
        return;
      default:
        push([{ kind: "err", text: `command not found: ${head} — try \`help\`` }]);
    }
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-line/12 bg-[#08080b] shadow-[0_30px_120px_-30px_rgba(179,0,27,0.55)]",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ms-2 truncate font-mono text-[10.5px] tracking-wide text-white/45">
          student@snt-isetch: ~/range
        </span>
        <span className="ms-auto font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">bash</span>
      </div>

      <div
        ref={scrollRef}
        className="h-[248px] overflow-y-auto px-4 py-3 font-mono text-[12px] leading-relaxed sm:text-[12.5px]"
      >
        {lines.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-words">
            {line.kind === "cmd" ? (
              <>
                <span className="text-ember">→ </span>
                <span className="text-white/85">{line.text}</span>
              </>
            ) : null}
            {line.kind === "out" ? <span className="text-white/55">{line.text}</span> : null}
            {line.kind === "muted" ? <span className="text-white/30">{line.text}</span> : null}
            {line.kind === "err" ? <span className="text-amber-400/80">{line.text}</span> : null}
          </div>
        ))}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(value);
            setValue("");
          }}
          className="mt-1 flex items-center gap-2"
        >
          <span className="text-ember">→</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={!ready}
            aria-label="Terminal command"
            autoComplete="off"
            spellCheck={false}
            placeholder={ready ? "help" : typed < BOOT.length ? "" : ""}
            className="min-w-0 flex-1 bg-transparent text-[12px] text-white/85 outline-none placeholder:text-white/20 sm:text-[12.5px]"
          />
          <span className="h-3.5 w-1.5 animate-caret bg-ember/80" />
        </form>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/30">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {locale === "fr" ? "range en ligne" : "range online"}
        </span>
        <span>49 challenges armed</span>
      </div>
    </div>
  );
}
