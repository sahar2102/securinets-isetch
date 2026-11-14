"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  spin: number;
  life: number;
}

const COLORS = ["#FF2D3D", "#B3001B", "#FF7A85", "#F5A524", "#FFFFFF", "#8B0000"];

/** Canvas confetti burst. No dependency, respects reduced motion. */
export function Confetti({ trigger }: { trigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const raf = useRef(0);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.42;

    particles.current = Array.from({ length: 160 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed * (0.6 + Math.random()),
        vy: Math.sin(angle) * speed - 4,
        size: 4 + Math.random() * 7,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.3,
        life: 1,
      };
    });

    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(32, now - last) / 16;
      last = now;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particles.current = particles.current.filter((p) => p.life > 0 && p.y < window.innerHeight + 40);
      for (const p of particles.current) {
        p.vy += 0.32 * dt;
        p.vx *= 0.995;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.spin * dt;
        p.life -= 0.006 * dt;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      if (particles.current.length) {
        raf.current = requestAnimationFrame(loop);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };
    raf.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf.current);
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90]"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
