"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/data/site";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setState("loading");
    await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => undefined);
    setState("sent");
  };

  return (
    <section className="relative overflow-hidden pb-24 pt-32">
      <div aria-hidden className="grid-lines absolute inset-0 opacity-60" />
      <div className="container-x relative max-w-xl">
        <p className="eyebrow">Account recovery</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Forgot your password?
        </h1>

        {state === "sent" ? (
          <div className="mt-8 rounded-2xl border border-line/10 bg-elev/40 p-6">
            <p className="text-[15px] leading-relaxed text-ink">
              If that address has a club account, a reset link is on its way.
            </p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
              It is valid for 30 minutes and works once. Check the spam folder too. Nothing after a
              few minutes? Message the board from the club account.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-primary">
                Back to sign in
              </Link>
              <a href={`mailto:${site.email}?subject=Password%20reset%20request`} className="btn btn-ghost">
                Email the board
              </a>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
              Enter the email you registered with. We send a one-time link to choose a new password.
            </p>
            <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-line/10 bg-elev/40 p-6">
              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />
              </div>
              <button type="submit" disabled={state === "loading"} className="btn-primary w-full">
                {state === "loading" ? "Sending…" : "Send reset link"}
              </button>
              <p className="text-center text-[12px] text-muted">
                No email yet? Ask a board member to reset it from the admin panel.
              </p>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
