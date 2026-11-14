"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight binary rain. Canvas is decorative only (aria-hidden) and pauses
 * when offscreen, when the tab is hidden, or when the user prefers reduced
 * motion. Drawn head + trail manually so it works on light and dark themes.
 */
export function MatrixRain({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let width = 0;
    let height = 0;
    let columns = 0;
    let drops: { y: number; speed: number }[] = [];
    let raf = 0;
    let last = 0;
    let running = true;
    const fontSize = 14;
    const trail = 14;
    const glyphs = "01";

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.max(1, Math.floor(width / 18));
      drops = Array.from({ length: columns }, () => ({
        y: Math.random() * height,
        speed: 0.35 + Math.random() * 0.9,
      }));
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textBaseline = "top";
    };

    const draw = (time: number) => {
      if (!running) return;
      raf = requestAnimationFrame(draw);
      if (time - last < 55) return;
      last = time;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < columns; i++) {
        const drop = drops[i];
        const x = i * 18 + 4;
        const head = drop.y;

        for (let t = 0; t < trail; t++) {
          const y = head - t * fontSize;
          if (y < -fontSize || y > height) continue;
          const alpha = t === 0 ? 0.55 : 0.16 * (1 - t / trail);
          ctx.fillStyle = t === 0 ? `rgba(255,90,102,${alpha})` : `rgba(255,45,61,${alpha})`;
          ctx.fillText(glyphs[Math.floor(Math.random() * 2)], x, y);
        }

        drop.y += drop.speed * fontSize * 0.55;
        if (drop.y > height + trail * fontSize) {
          drop.y = -Math.random() * 200;
          drop.speed = 0.35 + Math.random() * 0.9;
        }
      }
    };

    resize();
    raf = requestAnimationFrame(draw);

    const onResize = () => resize();
    const onVisibility = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting && !document.hidden;
      if (running) raf = requestAnimationFrame(draw);
    });
    io.observe(canvas);

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
