"use client";

import { useEffect, useRef } from "react";

/** Soft red ring that trails the pointer. Pointer devices only. */
export function CursorGlow() {
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ring.current;
    if (!el) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;

    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.dataset.active = "true";
    };
    const leave = () => {
      el.dataset.active = "false";
    };
    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.transform = `translate3d(${x - 18}px, ${y - 18}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ring}
      aria-hidden
      data-active="false"
      className="pointer-events-none fixed left-0 top-0 z-[60] hidden h-9 w-9 rounded-full border border-ember/40 opacity-0 mix-blend-screen transition-opacity duration-300 data-[active=true]:opacity-100 md:block"
      style={{ boxShadow: "0 0 24px -6px rgba(255,45,61,0.45)" }}
    />
  );
}
