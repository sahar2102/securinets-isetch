"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Glass panel with a pointer-following spotlight and a red edge that lights up
 * on hover. Purely presentational: children keep full control of semantics.
 */
export function GlowCard({
  children,
  className,
  as: Tag = "div",
  interactive = true,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li" | "section";
  interactive?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (event: React.MouseEvent) => {
    if (!interactive || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    ref.current.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <Tag
      ref={ref as never}
      onMouseMove={onMove}
      className={cn(
        "spotlight group relative rounded-2xl border border-line/10 bg-elev/50 p-6",
        "transition-[border-color,transform,box-shadow] duration-300",
        interactive &&
          "hover:-translate-y-1 hover:border-ember/30 hover:shadow-[0_24px_60px_-32px_rgba(255,45,61,0.45)]",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      {children}
    </Tag>
  );
}
