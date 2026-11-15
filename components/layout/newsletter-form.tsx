"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.includes("@")) {
      setState("error");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "done" : "error");
      if (res.ok) setEmail("");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <p className="flex items-center gap-2 rounded-full border border-jade/30 bg-jade/10 px-4 py-2.5 text-sm text-jade">
        <Icon name="check" size={16} />
        {t.footer.subscribed}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className={cn("flex flex-col gap-2", !compact && "sm:flex-row")}>
      <label className="sr-only" htmlFor="newsletter-email">
        {t.footer.emailPlaceholder}
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (state === "error") setState("idle");
        }}
        placeholder={t.footer.emailPlaceholder}
        aria-invalid={state === "error"}
        className="input flex-1 !rounded-full !py-2.5"
      />
      <button type="submit" disabled={state === "loading"} className="btn-primary !py-2.5 !text-[13px]">
        {state === "loading" ? t.common.loading : t.footer.subscribe}
        <Icon name="send" size={15} />
      </button>
    </form>
  );
}
