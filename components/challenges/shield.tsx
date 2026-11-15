"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "@/lib/client-store";
import type { IntegrityKind } from "@/lib/types";

/**
 * Deterrents for the challenge brief. IMPORTANT: a browser can never truly block
 * screenshots, photos of the screen or retyping the text into an AI tool. These
 * measures make casual copy/paste and sharing harder, hide the brief when the
 * window loses focus, and leave a trace (watermark + logged attempts) so the
 * board can review suspicious behaviour.
 */

/** Hide the brief while the tab/window is not focused. Set to false if members
 *  complain that switching to their terminal hides the challenge. */
const BLUR_ON_LEAVE = true;
/** How long the brief stays hidden after a screenshot shortcut is detected. */
const SCREENSHOT_HIDE_MS = 6000;

function watermarkImage(label: string) {
  const safe = label.replace(/[&<>"']/g, " ").slice(0, 60);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="200">` +
    `<text x="20" y="110" font-family="monospace" font-size="15" fill="#808080" fill-opacity="0.16" ` +
    `transform="rotate(-24 180 100)">${safe}</text></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

export function Shield({ slug, children }: { slug: string; children: React.ReactNode }) {
  const { user } = useAppStore();
  const isAdmin = user?.role === "admin";
  const [away, setAway] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSent = useRef<Record<string, number>>({});

  const track = useCallback(
    (kind: "start" | IntegrityKind) => {
      const now = Date.now();
      if (kind !== "start" && now - (lastSent.current[kind] ?? 0) < 5000) return;
      lastSent.current[kind] = now;
      void fetch("/api/challenges/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, kind }),
        keepalive: true,
      }).catch(() => undefined);
    },
    [slug],
  );

  const flash = useCallback((message: string, kind: IntegrityKind) => {
    setBlocked(message);
    track(kind);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setBlocked(null), SCREENSHOT_HIDE_MS);
  }, [track]);

  // Time-to-solve starts when the member first opens the challenge.
  useEffect(() => {
    if (user && !isAdmin) track("start");
  }, [user, isAdmin, track]);

  useEffect(() => {
    if (!user || isAdmin) return;

    const onKey = (e: KeyboardEvent) => {
      const printScreen = e.key === "PrintScreen" || e.code === "PrintScreen";
      const winSnip = e.metaKey && e.shiftKey && e.key.toLowerCase() === "s";
      const macShot = e.metaKey && e.shiftKey && ["Digit3", "Digit4", "Digit5"].includes(e.code);
      if (printScreen || winSnip || macShot) {
        if (printScreen) void navigator.clipboard?.writeText("").catch(() => undefined);
        flash("Screenshots are not allowed on challenges.", "screenshot");
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        flash("Printing is disabled on challenges.", "print");
      }
    };
    const onLeave = () => {
      if (BLUR_ON_LEAVE) setAway(true);
    };
    const onReturn = () => setAway(false);
    const onVisibility = () => (document.hidden ? onLeave() : onReturn());

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    window.addEventListener("blur", onLeave);
    window.addEventListener("focus", onReturn);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("focus", onReturn);
      document.removeEventListener("visibilitychange", onVisibility);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [user, isAdmin, flash]);

  const mark = useMemo(
    () => (user ? watermarkImage(`${user.name} · ${user.email}`) : null),
    [user],
  );

  if (!user || isAdmin) return <>{children}</>;

  const hidden = away || blocked !== null;
  const stop = (kind: IntegrityKind, message: string) => (e: React.SyntheticEvent) => {
    e.preventDefault();
    flash(message, kind);
  };

  return (
    <div
      className="relative select-none print:hidden"
      onCopy={stop("copy", "Copying is disabled on challenges.")}
      onCut={stop("copy", "Copying is disabled on challenges.")}
      onContextMenu={stop("menu", "Right-click is disabled on challenges.")}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className={hidden ? "pointer-events-none blur-2xl transition-[filter] duration-150" : "transition-[filter] duration-150"}>
        {children}
      </div>

      {mark ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
          style={{ backgroundImage: mark, backgroundRepeat: "repeat" }}
        />
      ) : null}

      {hidden ? (
        <div
          role="alert"
          className="absolute inset-0 z-20 grid place-items-center rounded-2xl bg-base/70 p-6 text-center backdrop-blur-sm"
        >
          <p className="max-w-xs font-mono text-[12px] leading-relaxed text-ink">
            {blocked ?? "Challenge hidden while this window is not in focus. Come back to continue."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
