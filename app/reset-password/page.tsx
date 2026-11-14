"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The two passwords do not match.");

    setState("loading");
    const response = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };

    if (response.ok) return setState("done");

    setState("idle");
    setError(
      data.error === "invalid_token"
        ? "This link is invalid or has expired. Request a new one."
        : data.error === "rate_limited"
          ? "Too many attempts. Try again in an hour."
          : "Something went wrong. Try again.",
    );
  };

  if (!token) {
    return (
      <div className="mt-8 rounded-2xl border border-line/10 bg-elev/40 p-6">
        <p className="text-[15px] text-ink">This page needs a reset link.</p>
        <Link href="/forgot-password" className="btn btn-primary mt-5">
          Request a new link
        </Link>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="mt-8 rounded-2xl border border-line/10 bg-elev/40 p-6">
        <p className="text-[15px] text-ink">Password updated. You can sign in now.</p>
        <Link href="/login" className="btn btn-primary mt-5">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-line/10 bg-elev/40 p-6">
      <div>
        <label className="label" htmlFor="password">
          New password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          className="input"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className="label" htmlFor="confirm">
          Confirm password
        </label>
        <input
          id="confirm"
          type="password"
          required
          minLength={8}
          className="input"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          autoComplete="new-password"
        />
      </div>
      {error ? (
        <p role="alert" className="rounded-lg bg-ember/10 px-3 py-2 text-[12px] text-ember">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={state === "loading"} className="btn-primary w-full">
        {state === "loading" ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="relative overflow-hidden pb-24 pt-32">
      <div aria-hidden className="grid-lines absolute inset-0 opacity-60" />
      <div className="container-x relative max-w-xl">
        <p className="eyebrow">Account recovery</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Choose a new password.
        </h1>
        <Suspense fallback={<p className="mt-8 text-sm text-muted">Loading…</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </section>
  );
}
