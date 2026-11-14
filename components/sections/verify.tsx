"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { PageHero } from "@/components/layout/page-hero";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/lib/utils";

interface Certificate {
  id: string;
  holder: string;
  event: string;
  type: string;
  issuedAt: string;
  hours: number | null;
  status: "valid" | "revoked";
}

export function VerifyPage() {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "found" | "missing" | "error">("idle");
  const [cert, setCert] = useState<Certificate | null>(null);

  const verify = async (number: string) => {
    const query = number.trim().toUpperCase();
    if (!query) return;
    setState("loading");
    setCert(null);
    try {
      const res = await fetch(`/api/verify?number=${encodeURIComponent(query)}`, { cache: "no-store" });
      const data = await res.json();
      if (data.found) {
        setCert(data.certificate);
        setState("found");
      } else {
        setState("missing");
      }
    } catch {
      setState("error");
    }
  };

  return (
    <>
      <PageHero
        kicker={t.verify.kicker}
        title={t.verify.title}
        intro={t.verify.intro}
      />

      <section className="section !pt-12">
        <div className="container-x max-w-3xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void verify(value);
            }}
            className="rounded-2xl border border-line/10 bg-elev/40 p-6 sm:p-8"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="certificate"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={t.verify.placeholder}
                spellCheck={false}
                autoComplete="off"
                className="input flex-1 font-mono uppercase tracking-wider"
              />
              <button type="submit" disabled={state === "loading"} className="btn-primary shrink-0">
                {state === "loading" ? t.verify.checking : t.verify.button}
                <Icon name="search" size={15} />
              </button>
            </div>
            <p className="mt-3 font-mono text-[10px] text-muted/60">{t.verify.invalidHint}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted/60">
                {t.verify.sample}
              </span>
              {["SNT-ISETCH-2026-001", "SNT-ISETCH-2026-006"].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setValue(sample);
                    void verify(sample);
                  }}
                  className="rounded-full border border-line/12 px-2.5 py-1 font-mono text-[10px] text-muted hover:border-ember/30 hover:text-ember"
                >
                  {sample}
                </button>
              ))}
            </div>
          </form>

          <AnimatePresence mode="wait">
            {state === "found" && cert ? (
              <motion.div
                key="found"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 overflow-hidden rounded-2xl border border-line/10"
              >
                <div
                  className={
                    cert.status === "valid"
                      ? "flex items-center gap-3 border-b border-jade/20 bg-jade/[0.08] px-6 py-4"
                      : "flex items-center gap-3 border-b border-amber/20 bg-amber/[0.08] px-6 py-4"
                  }
                >
                  <span
                    className={
                      cert.status === "valid"
                        ? "grid h-9 w-9 place-items-center rounded-full border border-jade/40 text-jade"
                        : "grid h-9 w-9 place-items-center rounded-full border border-amber/40 text-amber"
                    }
                  >
                    <Icon name={cert.status === "valid" ? "check" : "x"} size={16} />
                  </span>
                  <div>
                    <p className={cert.status === "valid" ? "font-display text-[15px] font-semibold text-jade" : "font-display text-[15px] font-semibold text-amber"}>
                      {cert.status === "valid" ? t.verify.valid : t.verify.revoked}
                    </p>
                    <p className="font-mono text-[10.5px] text-muted">{cert.id}</p>
                  </div>
                </div>

                <dl className="grid gap-px bg-line/10 sm:grid-cols-2">
                  {[
                    { label: t.verify.holder, value: cert.holder },
                    { label: t.verify.event, value: cert.event },
                    { label: t.verify.type, value: cert.type },
                    { label: t.verify.issued, value: formatDate(cert.issuedAt) },
                    ...(cert.hours ? [{ label: t.verify.hours, value: `${cert.hours}h` }] : []),
                    { label: t.verify.status, value: cert.status.toUpperCase() },
                  ].map((row) => (
                    <div key={row.label} className="bg-canvas px-6 py-4">
                      <dt className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">{row.label}</dt>
                      <dd className="mt-1 text-[13.5px] text-ink">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            ) : null}

            {state === "missing" || state === "error" ? (
              <motion.div
                key="missing"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 flex items-start gap-3 rounded-2xl border border-ember/25 bg-ember/[0.06] px-6 py-5"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ember/40 text-ember">
                  <Icon name="x" size={16} />
                </span>
                <div>
                  <p className="text-[13.5px] font-medium text-ink">{t.verify.invalid}</p>
                  <p className="mt-1 font-mono text-[10.5px] text-muted">{t.verify.invalidHint}</p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <p className="mt-6 text-[12px] leading-relaxed text-muted/60">{t.verify.note}</p>
        </div>
      </section>
    </>
  );
}
