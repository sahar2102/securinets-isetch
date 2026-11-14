import { categories, difficulties, type CategorySlug, type Difficulty } from "@/data/site";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./icons";

export const categoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug) ?? categories[0];

export function DifficultyBadge({
  level,
  label,
  className,
  compact = false,
}: {
  level: Difficulty;
  label?: string;
  className?: string;
  compact?: boolean;
}) {
  const meta = difficulties[level] ?? difficulties.beginner;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
        className,
      )}
      style={{
        color: meta.color,
        borderColor: `${meta.color}44`,
        backgroundColor: `${meta.color}14`,
      }}
    >
      <span className="flex gap-[3px]">
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: i < meta.dots ? meta.color : "transparent",
              boxShadow: i < meta.dots ? `0 0 6px ${meta.color}88` : "none",
              border: i < meta.dots ? "none" : `1px solid ${meta.color}55`,
            }}
          />
        ))}
      </span>
      {compact ? null : label ?? meta.label}
    </span>
  );
}

export function CategoryTag({
  slug,
  className,
  withIcon = true,
}: {
  slug: string;
  className?: string;
  withIcon?: boolean;
}) {
  const cat = categoryBySlug(slug);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
        className,
      )}
      style={{ color: cat.accent, backgroundColor: `${cat.accent}12` }}
    >
      {withIcon ? <Icon name={cat.icon as IconName} size={12} /> : null}
      {cat.name}
    </span>
  );
}

export function Points({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-1 font-mono text-sm font-semibold text-ink", className)}>
      {value}
      <span className="text-[10px] uppercase tracking-[0.16em] text-muted">pts</span>
    </span>
  );
}

export function CategoryIcon({
  slug,
  size = 20,
  className,
}: {
  slug: CategorySlug | string;
  size?: number;
  className?: string;
}) {
  const cat = categoryBySlug(slug);
  return <Icon name={cat.icon as IconName} size={size} className={className} />;
}
