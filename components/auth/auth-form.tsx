"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/client-store";
import { Seal } from "@/components/ui/brand";
import { Icon } from "@/components/ui/icons";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAppStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const next = params.get("next") ?? "/challenges";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "register") {
        if (password.length < 8) {
          setError(t.auth.weakPassword);
          return;
        }
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error === "email_taken" ? t.auth.emailTaken : t.auth.genericError);
          return;
        }
      }

      const result = await signIn("credentials", { email, password, redirect: false });
      if (!result || result.error) {
        setError(t.auth.invalid);
        return;
      }
      await refresh();
      router.push(next);
      router.refresh();
    } catch {
      setError(t.auth.genericError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-[calc(100svh-68px)] items-center overflow-hidden py-14">
      <div aria-hidden className="absolute inset-0 -z-10 grid-lines opacity-40" />
      <div
        aria-hidden
        className="absolute -top-24 end-0 -z-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(179,0,27,0.28),transparent_70%)] blur-3xl"
      />

      <div className="container-x grid w-full items-center gap-14 lg:grid-cols-2">
        <div className="hidden lg:block">
          <div className="flex items-center gap-4">
            <Seal size={220} />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ember">
                Securinets · ISET Charguia
              </p>
              <p className="mt-2 max-w-[240px] font-display text-2xl font-semibold leading-tight tracking-tight text-ink">
                {t.auth.loginSubtitle}
              </p>
            </div>
          </div>

          <ul className="mt-10 space-y-3">
            {[t.challenges.progressTitle, t.challenges.achievements, t.leaderboard.title].map((item) => (
              <li key={item} className="flex items-center gap-2.5 font-mono text-[11.5px] text-muted">
                <span className="grid h-5 w-5 place-items-center rounded-full border border-ember/30 text-ember">
                  <Icon name="check" size={10} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-line/10 bg-elev/50 p-6 backdrop-blur sm:p-8">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
              {mode === "login" ? t.auth.loginTitle : t.auth.registerTitle}
            </h1>
            <p className="mt-1.5 text-[13px] text-muted">
              {mode === "login" ? t.auth.loginSubtitle : t.auth.registerSubtitle}
            </p>

            <form onSubmit={submit} className="mt-7 space-y-4">
              {mode === "register" ? (
                <div>
                  <label className="label" htmlFor="name">
                    {t.auth.name}
                  </label>
                  <input
                    id="name"
                    required
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              ) : null}

              <div>
                <label className="label" htmlFor="email">
                  {t.auth.email}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="label" htmlFor="password">
                  {t.auth.password}
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                {mode === "register" ? (
                  <p className="mt-1.5 font-mono text-[10px] text-muted/60">{t.auth.passwordHint}</p>
                ) : null}
              </div>

              {error ? (
                <p role="alert" className="rounded-lg bg-ember/10 px-3 py-2 text-[12px] text-ember">
                  {error}
                </p>
              ) : null}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? t.common.loading : mode === "login" ? t.auth.login : t.auth.register}
                <Icon name="arrowRight" size={15} />
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between text-[12px] text-muted">
              <span>{mode === "login" ? t.auth.noAccount : t.auth.haveAccount}</span>
              <Link
                href={mode === "login" ? "/register" : "/login"}
                className="text-ember hover:underline"
              >
                {mode === "login" ? t.auth.createOne : t.auth.signInInstead}
              </Link>
            </div>

            <div className="mt-5 border-t border-line/10 pt-4">
              <Link
                href="/challenges"
                className="flex items-center justify-between rounded-lg px-1 py-2 text-[12px] text-muted hover:text-ink"
              >
                {t.auth.guestContinue}
                <Icon name="arrowRight" size={14} />
              </Link>
            </div>
          </div>

          <p className="mt-4 text-center font-mono text-[9.5px] leading-relaxed text-muted/40">
            {t.auth.demoHint}
          </p>
        </div>
      </div>
    </section>
  );
}
