"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Confetti } from "@/components/effects/confetti";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ types */

export type GameId = "cipher" | "phish" | "ports" | "hex";

interface GameMeta {
  id: GameId;
  index: string;
  name: string;
  tagline: string;
  skill: string;
}

export const GAMES: GameMeta[] = [
  { id: "cipher", index: "01", name: "Cipher Wheel", tagline: "Rotate until the sentence makes sense.", skill: "classical crypto" },
  { id: "phish", index: "02", name: "Inbox Autopsy", tagline: "Three things in this email are wrong. Find them.", skill: "social engineering" },
  { id: "ports", index: "03", name: "Port Reflex", tagline: "Twenty-five seconds. Click the open ports.", skill: "network recon" },
  { id: "hex", index: "04", name: "Byte Rebuild", tagline: "Turn raw bytes back into a flag.", skill: "encoding" },
];

const STORE_KEY = "snt-arcade-v1";

type Best = Partial<Record<GameId, number>>;

function loadBest(): Best {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}") as Best;
  } catch {
    return {};
  }
}

/* ------------------------------------------------------------------ shell */

export function Arcade() {
  const [game, setGame] = useState<GameId>("cipher");
  const [best, setBest] = useState<Best>({});
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    setBest(loadBest());
    const requested = new URLSearchParams(window.location.search).get("game");
    if (requested && GAMES.some((g) => g.id === requested)) setGame(requested as GameId);
  }, []);

  const submit = useCallback((id: GameId, score: number) => {
    setBest((prev) => {
      const next = { ...prev, [id]: Math.max(prev[id] ?? 0, score) };
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
      return next;
    });
    if (score >= 700) setBurst((n) => n + 1);
  }, []);

  const total = useMemo(() => Object.values(best).reduce((a, b) => a + (b ?? 0), 0), [best]);

  return (
    <div className="container-x pb-24">
      <Confetti trigger={burst} />
      <div className="grid gap-8 lg:grid-cols-[248px_1fr] lg:gap-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line/10 bg-elev/40 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember">Arcade</p>
            <p className="mt-2 font-display text-3xl font-semibold text-ink">
              {total.toLocaleString()}
              <span className="ml-1 font-mono text-[11px] text-muted">PTS</span>
            </p>
            <p className="mt-1 text-[11.5px] text-muted">Personal best, saved in this browser.</p>
            <div className="mt-4 space-y-1">
              {GAMES.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGame(g.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-[12.5px] transition",
                    game === g.id ? "bg-ember/10 text-ember" : "text-muted hover:bg-line/5 hover:text-ink",
                  )}
                >
                  <span>
                    <span className="font-mono text-[10px] opacity-60">{g.index}</span> {g.name}
                  </span>
                  <span className="font-mono text-[10px]">{best[g.id] ?? 0}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(STORE_KEY);
                setBest({});
              }}
              className="mt-4 w-full rounded-lg border border-line/12 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted hover:text-ember"
            >
              Reset scores
            </button>
          </div>
          <p className="mt-4 px-1 text-[11px] leading-relaxed text-muted">
            These are teasers, not the real range. The club challenges use the same reflexes at a
            much nastier level.
          </p>
        </aside>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                {GAMES.find((g) => g.id === game)?.skill}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
                {GAMES.find((g) => g.id === game)?.name}
              </h2>
              <p className="mt-1 text-[13px] text-muted">{GAMES.find((g) => g.id === game)?.tagline}</p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              best {best[game] ?? 0}
            </span>
          </div>

          <div className="mt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={game}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {game === "cipher" ? <CipherGame onScore={(s) => submit("cipher", s)} /> : null}
                {game === "phish" ? <PhishGame onScore={(s) => submit("phish", s)} /> : null}
                {game === "ports" ? <PortsGame onScore={(s) => submit("ports", s)} /> : null}
                {game === "hex" ? <HexGame onScore={(s) => submit("hex", s)} /> : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ frame */

function Frame({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line/10 bg-[#0b0b0f]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        <span className="ms-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          snt://arcade
        </span>
      </div>
      <div className="p-6 sm:p-9">{children}</div>
      {footer ? <div className="border-t border-white/10 px-5 py-3">{footer}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ cipher */

const CIPHER_TEXT = "Frphevargf{ebg13_vf_n_fgneg}";
const CIPHER_PLAIN = "securinets{rot13_is_a_start}";

function rot13(text: string, shift: number) {
  return text.replace(/[a-z]/gi, (char) => {
    const base = char === char.toLowerCase() ? 97 : 65;
    return String.fromCharCode(((char.charCodeAt(0) - base + shift + 26) % 26) + base);
  });
}

function CipherGame({ onScore }: { onScore: (score: number) => void }) {
  const [shift, setShift] = useState(0);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const decoded = rot13(CIPHER_TEXT, shift);

  useEffect(() => {
    if (!done && decoded.toLowerCase() === CIPHER_PLAIN && shift !== 0) {
      setDone(true);
      onScore(Math.max(150, 1000 - moves * 40));
    }
  }, [decoded, done, moves, onScore, shift]);

  return (
    <Frame
      footer={
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
          <span>rot13 {shift ? `+ ${shift}` : ""}</span>
          <span>{done ? "decrypted" : `${moves} turns`}</span>
        </div>
      }
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ember">ciphertext</p>
      <pre className="mt-2 overflow-x-auto rounded-lg border border-white/10 bg-black/50 p-3 font-mono text-[12.5px] text-white/75">
        {CIPHER_TEXT}
      </pre>

      <div className="mt-7 flex items-center gap-4">
        <input
          type="range"
          min={0}
          max={25}
          value={shift}
          onChange={(e) => {
            setShift(Number(e.target.value));
            setMoves((m) => m + 1);
          }}
          aria-label="Caesar shift"
          className="h-1 w-full accent-[#FF2D3D]"
        />
        <span className="w-14 text-end font-mono text-2xl text-ink">{shift}</span>
      </div>

      <p
        className={cn(
          "mt-6 min-h-[52px] rounded-lg border px-4 py-3 font-mono text-[13px] leading-relaxed transition",
          done ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/[0.02] text-white/70",
        )}
      >
        {decoded}
      </p>

      <p className="mt-4 text-[12px] text-white/40">
        Hint: the prefix is the club name. Move the wheel until it appears.
      </p>
    </Frame>
  );
}

/* ------------------------------------------------------------------ phish */

type PhishItem = { id: string; text: string; bad: boolean; why: string };

const EMAIL: PhishItem[] = [
  { id: "from", text: "De : Securinets ISET <support@isetcharguia-secure.tn>", bad: true, why: "The domain is isetcharguia-secure.tn — not the official one." },
  { id: "hello", text: "Bonjour membre,", bad: false, why: "" },
  { id: "body", text: "Votre accès au laboratoire expire aujourd'hui. Confirmez vos identifiants pour le conserver.", bad: true, why: "Urgency + credential request: classic phishing pattern." },
  { id: "link", text: "https://isetcharguia.tn.login-verify.co/portal", bad: true, why: "The real host is login-verify.co; the club name is only a subdomain." },
  { id: "attach", text: "Pièce jointe : liste_membres.pdf.exe", bad: true, why: "Double extension: an executable disguised as a PDF." },
  { id: "bye", text: "— Le bureau, Securinets ISET Charguia", bad: false, why: "" },
];

function PhishGame({ onScore }: { onScore: (score: number) => void }) {
  const bad = EMAIL.filter((e) => e.bad);
  const [found, setFound] = useState<string[]>([]);
  const [misses, setMisses] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const click = (item: PhishItem) => {
    if (done || found.includes(item.id)) return;
    if (item.bad) {
      const next = [...found, item.id];
      setFound(next);
      if (next.length === bad.length) {
        setDone(true);
        onScore(Math.max(200, 1000 - misses.length * 120));
      }
    } else if (!misses.includes(item.id)) {
      setMisses((m) => [...m, item.id]);
    }
  };

  return (
    <Frame
      footer={
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
          <span>{found.length} / {bad.length} found</span>
          <span>{misses.length} false positives</span>
        </div>
      }
    >
      <div className="space-y-1.5">
        {EMAIL.map((item) => {
          const isFound = found.includes(item.id);
          const isMiss = misses.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => click(item)}
              className={cn(
                "block w-full rounded-lg border px-3 py-2.5 text-start font-mono text-[12px] transition",
                isFound
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                  : isMiss
                    ? "border-amber-500/40 bg-amber-500/5 text-amber-200/80"
                    : "border-white/10 bg-white/[0.02] text-white/70 hover:border-ember/40 hover:bg-ember/5",
              )}
            >
              {item.text}
              {isFound ? <span className="mt-1 block text-[11px] text-emerald-300/80">↳ {item.why}</span> : null}
              {isMiss ? <span className="mt-1 block text-[11px] text-amber-200/70">↳ harmless</span> : null}
            </button>
          );
        })}
      </div>
      <p className="mt-5 text-[12px] text-white/40">
        Click everything that would make you stop and check the sender.
      </p>
    </Frame>
  );
}

/* ------------------------------------------------------------------ ports */

interface Port {
  id: number;
  state: "idle" | "open";
  until: number;
}

function PortsGame({ onScore }: { onScore: (score: number) => void }) {
  const [ports, setPorts] = useState<Port[]>(() => Array.from({ length: 12 }, (_, i) => ({ id: i + 1, state: "idle", until: 0 })));
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(25);
  const [running, setRunning] = useState(false);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const openTimer = setInterval(() => {
      setPorts((prev) => {
        const idle = prev.filter((p) => p.state === "idle");
        if (!idle.length) return prev;
        const pick = idle[Math.floor(Math.random() * idle.length)];
        return prev.map((p) => (p.id === pick.id ? { ...p, state: "open", until: Date.now() + 900 } : p));
      });
    }, 650);
    const decay = setInterval(() => {
      setPorts((prev) => prev.map((p) => (p.state === "open" && Date.now() > p.until ? { ...p, state: "idle" } : p)));
    }, 150);
    const clock = setInterval(() => setTime((s) => Math.max(0, s - 1)), 1000);
    return () => {
      clearInterval(openTimer);
      clearInterval(decay);
      clearInterval(clock);
    };
  }, [running]);

  useEffect(() => {
    if (running && time === 0) {
      setRunning(false);
      onScore(Math.min(1000, scoreRef.current * 4));
    }
  }, [time, running, onScore]);

  const hit = (port: Port) => {
    if (!running) return;
    if (port.state === "open") {
      scoreRef.current += 10 + combo * 2;
      setScore(scoreRef.current);
      setCombo((c) => {
        const next = c + 1;
        setBestCombo((b) => Math.max(b, next));
        return next;
      });
      setPorts((prev) => prev.map((p) => (p.id === port.id ? { ...p, state: "idle" } : p)));
    } else {
      scoreRef.current = Math.max(0, scoreRef.current - 5);
      setScore(scoreRef.current);
      setCombo(0);
    }
  };

  const reset = () => {
    scoreRef.current = 0;
    setScore(0);
    setTime(25);
    setCombo(0);
    setBestCombo(0);
    setPorts(Array.from({ length: 12 }, (_, i) => ({ id: i + 1, state: "idle", until: 0 })));
    setRunning(true);
  };

  return (
    <Frame
      footer={
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
          <span>score {score}</span>
          <span>combo x{combo} · best x{bestCombo}</span>
          <span>{time}s</span>
        </div>
      }
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-[12.5px] text-white/50">
          Green = open port. Click fast, avoid closed ones.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-ember/40 bg-ember/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ember hover:bg-ember/20"
        >
          {running ? "restart" : "start"}
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {ports.map((port) => (
          <button
            key={port.id}
            type="button"
            onClick={() => hit(port)}
            aria-label={`Port ${2000 + port.id}`}
            className={cn(
              "relative aspect-square rounded-xl border font-mono text-[11px] transition",
              port.state === "open"
                ? "scale-[1.03] border-emerald-400/70 bg-emerald-400/15 text-emerald-300 shadow-[0_0_24px_-4px_rgba(52,211,153,0.6)]"
                : "border-white/10 bg-white/[0.02] text-white/35 hover:border-ember/30",
            )}
          >
            {port.id}
            <span className="absolute bottom-1 end-1.5 text-[8px] opacity-50">{2100 + port.id}</span>
          </button>
        ))}
      </div>
      {!running && time === 0 ? (
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ember">
          run ended · {score} pts · best combo x{bestCombo}
        </p>
      ) : null}
    </Frame>
  );
}

/* ------------------------------------------------------------------ hex */

const HEX = "53 4e 54 7b 68 33 78 5f 31 73 5f 66 75 6e 7d";
const HEX_ANSWER = "snt{h3x_1s_fun}";

function HexGame({ onScore }: { onScore: (score: number) => void }) {
  const [value, setValue] = useState("");
  const [tries, setTries] = useState(0);
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (done) return;
    if (value.trim().toLowerCase() === HEX_ANSWER) {
      setDone(true);
      onScore(Math.max(200, 1000 - tries * 150));
    } else {
      setTries((t) => t + 1);
    }
  };

  return (
    <Frame
      footer={
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
          <span>ascii / utf-8</span>
          <span>{done ? "rebuilt" : `${tries} attempts`}</span>
        </div>
      }
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ember">raw bytes</p>
      <pre className="mt-2 overflow-x-auto rounded-lg border border-white/10 bg-black/50 p-3 font-mono text-[13px] leading-relaxed text-white/75">
        {HEX}
      </pre>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-2 sm:flex-row">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (done) setDone(false);
          }}
          placeholder="SNT{...}"
          disabled={done}
          className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2.5 font-mono text-[13px] text-white outline-none placeholder:text-white/25 focus:border-ember/60"
        />
        <button
          type="submit"
          className="rounded-lg border border-ember/40 bg-ember/10 px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ember hover:bg-ember/20"
        >
          decode
        </button>
      </form>
      <p className={cn("mt-4 text-[12px]", done ? "text-emerald-400" : "text-white/40")}>
        {done ? "Correct. Every byte was printable ASCII." : "Each pair is one byte. Convert, then read it."}
      </p>
    </Frame>
  );
}
