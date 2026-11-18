"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { PublicChallenge } from "@/lib/types";
import { useAppStore } from "@/lib/client-store";
import { useI18n, interpolate } from "@/lib/i18n";
import { categoryBySlug, DifficultyBadge } from "@/components/ui/badges";
import { Icon, type IconName } from "@/components/ui/icons";
import { Markdown } from "@/components/markdown";
import { Shield } from "@/components/challenges/shield";
import { Confetti } from "@/components/effects/confetti";
import { cn, formatDate } from "@/lib/utils";

const plain = (text: string) => text.replace(/```[\s\S]*?```/g, " ").replace(/[#*_`>]/g, "").replace(/\s+/g, " ").trim();

export function ChallengeDetail({
  challenge,
  related,
}: {
  challenge: PublicChallenge;
  related: PublicChallenge[];
}) {
  const { t, locale } = useI18n();
  const { user, progress, solvedSet, recordSolve, recordHint, refresh } = useAppStore();
  const cat = categoryBySlug(challenge.category);

  const solved = solvedSet.has(challenge.slug);
  const unlockedIndices = progress.hints[challenge.slug] ?? [];

  const [flag, setFlag] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "correct" | "wrong" | "already">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [burst, setBurst] = useState(0);
  const [hintText, setHintText] = useState<Record<number, string>>({});
  const [confirmHint, setConfirmHint] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!retry) return;
    const id = setInterval(() => setRetry((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(id);
  }, [retry]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!flag.trim() || state === "checking" || retry > 0) return;
    setState("checking");
    setMessage(null);
    try {
      const res = await fetch("/api/challenges/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: challenge.slug, flag }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setState("idle");
        setRetry(data.retryAfter ?? 60);
        setMessage(interpolate(t.challenges.detail.rateLimited, { seconds: data.retryAfter ?? 60 }));
        return;
      }

      if (data.correct) {
        if (data.already) {
          setState("already");
          setMessage(t.challenges.detail.already);
        } else {
          setState("correct");
          setMessage(t.challenges.detail.correct);
          setBurst((n) => n + 1);
          recordSolve(challenge.slug, data.points ?? challenge.points);
          void refresh();
        }
        setFlag("");
        return;
      }

      setState("wrong");
      setMessage(t.challenges.detail.wrong);
      inputRef.current?.focus();
    } catch {
      setState("idle");
      setMessage(t.auth.genericError);
    }
  };

  const unlockHint = useCallback(
    async (index: number) => {
      if (hintText[index]) return;
      try {
        const res = await fetch("/api/challenges/hint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: challenge.slug, index }),
        });
        const data = await res.json();
        if (res.ok) {
          setHintText((prev) => ({ ...prev, [index]: data.text }));
          if (data.cost) recordHint(challenge.slug, index, data.cost);
        } else if (data.error === "not_enough_points") {
          setMessage("Not enough points — solve another challenge first.");
        }
      } catch {
        setMessage(t.auth.genericError);
      } finally {
        setConfirmHint(null);
      }
    },
    [challenge.slug, hintText, recordHint, t.auth.genericError],
  );

  const hints = challenge.hints ?? [];

  return (
    <>
      <Confetti trigger={burst} />

      <section className="relative border-b border-line/10 pb-10 pt-10">
        <div aria-hidden className="absolute inset-0 -z-10 grid-lines opacity-40" />
        <div className="container-x">
          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-ink"
          >
            <Icon name="arrowLeft" size={13} />
            {t.challenges.detail.back}
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em]"
              style={{ color: cat.accent, backgroundColor: `${cat.accent}14` }}
            >
              <Icon name={cat.icon as IconName} size={12} />
              {cat.name}
            </span>
            <DifficultyBadge level={challenge.difficulty} label={t.difficulty[challenge.difficulty]} />
            {solved ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-jade/30 bg-jade/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-jade">
                <Icon name="check" size={11} />
                {t.challenges.solvedBadge}
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 max-w-3xl text-balance font-display text-3xl font-bold tracking-[-0.035em] text-ink sm:text-[2.6rem] sm:leading-[1.05]">
            {challenge.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="trophy" size={13} className="text-ember" />
              <span className="font-semibold text-ink">{challenge.points}</span> {t.challenges.points}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="users" size={13} className="text-ember" />
              {interpolate(t.challenges.detail.solveCount, { count: challenge.solves + (solved ? 1 : 0) })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="calendar" size={13} className="text-ember" />
              {formatDate(challenge.date)}
            </span>
          </div>
        </div>
      </section>

      <section className="section !pt-10">
        <div className="container-x grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <Shield slug={challenge.slug}>
            <div className="rounded-2xl border border-line/10 bg-elev/40 p-6 sm:p-8">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
                {t.challenges.detail.brief}
              </h2>
              <Markdown content={challenge.description} className="prose-snt mt-5" />

              {challenge.files?.length ? (
                <div className="mt-8 border-t border-line/10 pt-6">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
                    {t.challenges.detail.files}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {challenge.files.map((file) => (
                      <li key={file.href}>
                        <a
                          href={file.href}
                          download
                          className="group flex items-center gap-3 rounded-xl border border-line/10 bg-base/40 px-4 py-3 transition-colors hover:border-ember/30"
                        >
                          <span className="grid h-8 w-8 place-items-center rounded-lg border border-line/10 text-ember">
                            <Icon name="download" size={15} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-mono text-[12px] text-ink">{file.name}</span>
                            {file.size ? (
                              <span className="font-mono text-[10px] text-muted">{file.size}</span>
                            ) : null}
                          </span>
                          <Icon name="arrowUpRight" size={14} className="text-muted transition-colors group-hover:text-ember" />
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 font-mono text-[10px] text-muted/60">
                    All artefacts are synthetic. Nothing here targets a real system.
                  </p>
                </div>
              ) : null}
            </div>
            </Shield>

            {/* hints */}
            <div className="mt-4 rounded-2xl border border-line/10 bg-elev/40 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
                  {t.challenges.detail.hints}
                </h2>
                <span className="font-mono text-[10px] text-muted/50">{hints.length}</span>
              </div>

              {hints.length === 0 ? (
                <p className="mt-3 text-[13px] text-muted">{t.challenges.detail.noHints}</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {hints.map((hint, index) => {
                    const known = Boolean(hintText[index]);
                    const owned = unlockedIndices.includes(index);
                    return (
                      <li key={index} className="rounded-xl border border-line/10 bg-base/30">
                        <div className="flex items-center gap-3 px-4 py-3">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-line/10 text-ember">
                            <Icon name={known ? "unlock" : "bulb"} size={14} />
                          </span>
                          <div className="min-w-0 flex-1">
                            {known ? (
                              <p className="text-[13px] leading-relaxed text-ink">{hintText[index]}</p>
                            ) : (
                              <p className="font-mono text-[11px] text-muted">
                                {interpolate(t.challenges.detail.hintLocked, { cost: hint.cost })}
                              </p>
                            )}
                          </div>

                          {!known ? (
                            !user ? (
                              <Link
                                href="/login"
                                className="shrink-0 rounded-full border border-line/12 px-3 py-1.5 font-mono text-[10px] text-muted hover:text-ink"
                              >
                                {t.nav.login}
                              </Link>
                            ) : confirmHint === index ? (
                              <button
                                type="button"
                                onClick={() => void unlockHint(index)}
                                className="shrink-0 rounded-full border border-ember/40 bg-ember/10 px-3 py-1.5 font-mono text-[10px] text-ember"
                              >
                                −{hint.cost} pts · OK
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmHint(index)}
                                disabled={owned}
                                className="shrink-0 rounded-full border border-line/12 px-3 py-1.5 font-mono text-[10px] text-muted transition-colors hover:border-ember/30 hover:text-ember disabled:opacity-40"
                              >
                                {interpolate(t.challenges.detail.hintLocked, { cost: hint.cost })}
                              </button>
                            )
                          ) : (
                            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-jade">
                              {t.challenges.detail.hintUnlocked}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* flag submission */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-ember/20 bg-[linear-gradient(140deg,rgba(139,0,0,0.14),rgba(18,18,22,0.6))]">
              <div className="flex items-center gap-2 border-b border-line/10 px-6 py-3">
                <span className="h-2 w-2 rounded-full bg-ember" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  {t.challenges.detail.submit}
                </span>
                <span className="ms-auto font-mono text-[10px] text-muted/50">
                  {t.challenges.detail.flagFormat}
                </span>
              </div>

              <form onSubmit={submit} className="p-6 sm:p-8">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 font-mono text-[13px] text-ember">
                      &gt;
                    </span>
                    <input
                      ref={inputRef}
                      value={flag}
                      onChange={(e) => {
                        setFlag(e.target.value);
                        if (state !== "checking") setState("idle");
                      }}
                      placeholder={t.challenges.detail.placeholder}
                      aria-label={t.challenges.detail.submit}
                      spellCheck={false}
                      autoComplete="off"
                      aria-invalid={state === "wrong"}
                      className={cn(
                        "input !py-3 ps-9 font-mono text-[13px] !bg-base/70",
                        state === "correct" && "!border-jade/60",
                        state === "wrong" && "!border-ember",
                      )}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={state === "checking" || !flag.trim() || retry > 0}
                    className="btn-primary shrink-0"
                  >
                    {state === "checking" ? t.common.loading : t.challenges.detail.submit}
                    <Icon name="send" size={15} />
                  </button>
                </div>

                {message ? (
                  <motion.p
                    key={message}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-[11.5px]",
                      state === "correct" && "bg-jade/10 text-jade",
                      state === "wrong" && "bg-ember/10 text-ember",
                      state === "already" && "bg-amber/10 text-amber",
                      state === "idle" && "bg-line/5 text-muted",
                    )}
                    role="status"
                    aria-live="polite"
                  >
                    <Icon
                      name={state === "correct" ? "check" : state === "wrong" ? "x" : "bulb"}
                      size={13}
                    />
                    {message}
                  </motion.p>
                ) : null}

                {!user ? (
                  <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
                    {t.challenges.detail.submitAsGuest}{" "}
                    <Link href="/login" className="text-ember hover:underline">
                      {t.challenges.detail.loginToSubmit}
                    </Link>
                  </p>
                ) : null}
              </form>
            </div>
          </div>

          {/* sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-line/10 bg-elev/40 p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">status</span>
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    solved ? "bg-jade" : "bg-ember/50",
                  )}
                />
              </div>
              <p className={cn("mt-2 font-display text-lg font-semibold", solved ? "text-jade" : "text-ink")}>
                {solved ? t.challenges.solvedBadge : t.challenges.unsolved}
              </p>

              <dl className="mt-5 space-y-3 border-t border-line/10 pt-4 font-mono text-[11px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{t.challenges.detail.released}</dt>
                  <dd className="text-ink">{formatDate(challenge.date, locale === "fr" ? "fr-FR" : "en-GB")}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{t.challenges.points}</dt>
                  <dd className="text-ink">{challenge.points}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">hints</dt>
                  <dd className="text-ink">
                    {unlockedIndices.length}/{hints.length}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-line/10 pt-4">
                {challenge.tags.map((tag) => (
                  <span key={tag} className="rounded bg-line/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-muted">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {related.length ? (
              <div className="rounded-2xl border border-line/10 bg-elev/40 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  {interpolate(t.challenges.detail.related, { category: cat.name })}
                </p>
                <ul className="mt-3 space-y-2">
                  {related.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/challenges/${item.slug}`}
                        className="group flex items-center justify-between gap-3 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-line/10 hover:bg-line/[0.03]"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[12.5px] text-ink group-hover:text-ember">
                            {item.title}
                          </span>
                          <span className="font-mono text-[9.5px] text-muted">
                            {item.points} pts · {t.difficulty[item.difficulty]}
                          </span>
                        </span>
                        <Icon name="chevronRight" size={14} className="shrink-0 text-muted" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rounded-2xl border border-line/10 bg-elev/40 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">brief</p>
              <p className="mt-2 text-[12px] leading-relaxed text-muted">{plain(challenge.description).slice(0, 180)}…</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
