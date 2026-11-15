"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/client-store";
import { Seal } from "@/components/ui/brand";
import { Icon } from "@/components/ui/icons";

export interface NoticeViewer {
  name: string;
  email: string;
  role: "pending" | "member" | "admin";
}

type NoticeMode = "login" | "register" | "status";

/**
 * Shown instead of the sign-in / sign-up form when a session already exists:
 * - active account  -> "you're already signed in", no second form
 * - pending account -> approval status, with a live re-check
 */
export function SessionNotice({
  viewer,
  mode = "login",
}: {
  viewer: NoticeViewer;
  mode?: NoticeMode;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const { refresh } = useAppStore();

  const pending = viewer.role === "pending";
  const [checking, setChecking] = useState(false);
  const [approved, setApproved] = useState(false);

  const roleLabel =
    viewer.role === "admin"
      ? t.auth.roleAdmin
      : viewer.role === "pending"
        ? t.auth.rolePending
        : t.auth.roleMember;

  const check = useCallback(
    async (silent: boolean) => {
      if (!silent) setChecking(true);
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = (await res.json().catch(() => null)) as
          | { user?: { role?: string } }
          | null;
        const role = data?.user?.role;
        if (role && role !== "pending") {
          setApproved(true);
          await refresh();
          window.setTimeout(() => router.push("/challenges"), 1500);
        }
      } catch {
        /* offline: keep the current state */
      } finally {
        if (!silent) setChecking(false);
      }
    },
    [refresh, router],
  );

  useEffect(() => {
    if (!pending || approved) return;
    const id = window.setInterval(() => void check(true), 20000);
    return () => window.clearInterval(id);
  }, [pending, approved, check]);

  const title = approved
    ? t.auth.approvedTitle
    : pending
      ? t.auth.pendingTitle
      : mode === "register"
        ? t.auth.signedInRegisterTitle
        : t.auth.signedInTitle;

  const body = approved
    ? t.auth.pendingBody
    : pending
      ? t.auth.pendingBody
      : mode === "register"
        ? t.auth.signedInRegisterBody
        : t.auth.signedInBody;

  const steps = [
    { label: t.auth.pendingStepSubmitted, done: true, current: false },
    {
      label: t.auth.pendingStepReview,
      done: Boolean(approved),
      current: !approved,
    },
    {
      label: t.auth.pendingStepAccess,
      done: Boolean(approved),
      current: false,
    },
  ];

  return (
    <section className="relative flex min-h-[calc(100svh-68px)] items-center overflow-hidden py-14">
      <div aria-hidden className="absolute inset-0 -z-10 grid-lines opacity-40" />
      <div
        aria-hidden
        className="absolute -top-24 start-0 -z-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(179,0,27,0.26),transparent_70%)] blur-3xl"
      />

      <div className="container-x grid w-full items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
        <div className="order-2 lg:order-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ember">
            {pending ? t.auth.pendingKicker : t.auth.alreadyKicker}
          </p>
          <h1 className="mt-3 max-w-xl font-display text-[clamp(2rem,4vw,3.1rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-ink">
            {title}
          </h1>
          <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-muted">{body}</p>

          <ol className="mt-8 flex max-w-md flex-col gap-0">
            {steps.map((step, index) => (
              <li key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={[
                      "grid h-7 w-7 place-items-center rounded-full border font-mono text-[10px]",
                      step.done
                        ? "border-ember/50 bg-ember/15 text-ember"
                        : step.current
                          ? "border-ember/40 bg-ember/10 text-ember"
                          : "border-line/15 text-muted/60",
                    ].join(" ")}
                  >
                    {step.done ? (
                      <Icon name="check" size={12} />
                    ) : step.current ? (
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember/70" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-ember" />
                      </span>
                    ) : (
                      index + 1
                    )}
                  </span>
                  {index < steps.length - 1 ? (
                    <span
                      aria-hidden
                      className={[
                        "my-1 w-px flex-1",
                        step.done ? "bg-ember/30" : "bg-line/12",
                      ].join(" ")}
                    />
                  ) : null}
                </div>
                <div className="pb-5">
                  <p
                    className={[
                      "text-[13.5px]",
                      step.done || step.current ? "text-ink" : "text-muted/70",
                    ].join(" ")}
                  >
                    {step.label}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {pending && !approved ? (
            <p className="mt-1 max-w-md font-mono text-[10.5px] leading-relaxed text-muted/60">
              {t.auth.pendingEta}
            </p>
          ) : null}
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-2xl border border-line/12 bg-elev/55 p-6 backdrop-blur sm:p-7">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember/60 to-transparent"
            />

            <div className="flex items-center gap-3">
              <Seal size={52} />
              <div className="min-w-0">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ember">
                  {t.auth.noticeSignedInAs}
                </p>
                <p className="truncate text-[14px] font-medium text-ink">{viewer.name || viewer.email}</p>
                <p className="truncate font-mono text-[10px] text-muted">{viewer.email}</p>
              </div>
              <span
                className={[
                  "ms-auto shrink-0 rounded-full border px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em]",
                  pending
                    ? "border-amber-400/40 text-amber-300"
                    : "border-ember/40 text-ember",
                ].join(" ")}
              >
                {roleLabel}
              </span>
            </div>

            <div className="mt-6 space-y-2.5">
              {pending ? (
                <>
                  <button
                    type="button"
                    onClick={() => void check(false)}
                    disabled={checking || approved}
                    className="btn-primary w-full"
                  >
                    {approved
                      ? t.auth.approvedTitle
                      : checking
                        ? t.auth.pendingChecking
                        : t.auth.pendingCheck}
                    <Icon name="radar" size={15} />
                  </button>
                  <Link href="/contact" className="btn btn-ghost w-full">
                    {t.auth.pendingContact}
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/challenges" className="btn-primary w-full">
                    {t.auth.signedInCta}
                    <Icon name="arrowRight" size={15} />
                  </Link>
                  {viewer.role === "admin" ? (
                    <Link href="/admin" className="btn btn-ghost w-full">
                      {t.auth.adminPanel}
                    </Link>
                  ) : null}
                </>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-line/10 pt-4 text-[12px] text-muted">
              <button
                type="button"
                onClick={() => void signOut({ callbackUrl: mode === "register" ? "/register" : "/login" })}
                className="text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                {t.auth.signOut}
              </button>
              <Link href="/" className="transition-colors hover:text-ink">
                {t.auth.backHome}
              </Link>
            </div>
          </div>

          <p className="mt-4 text-center font-mono text-[9.5px] leading-relaxed text-muted/40">
            {t.auth.sessionNote}
          </p>
        </div>
      </div>
    </section>
  );
}
