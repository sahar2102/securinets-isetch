import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  kicker,
  title,
  body,
  align = "left",
  action,
  className,
  size = "md",
}: {
  kicker?: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        action && "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        {kicker ? (
          <p className="eyebrow mb-4">
            <span className="inline-block h-1 w-6 bg-ember" />
            {kicker}
          </p>
        ) : null}
        <h2
          className={cn(
            "text-balance font-display font-semibold tracking-[-0.035em] text-ink",
            size === "lg" && "text-4xl sm:text-5xl lg:text-[3.4rem]",
            size === "md" && "text-3xl sm:text-4xl lg:text-[2.7rem]",
            size === "sm" && "text-2xl sm:text-3xl",
          )}
        >
          {title}
        </h2>
        {body ? (
          <p className="mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted sm:text-base">
            {body}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
