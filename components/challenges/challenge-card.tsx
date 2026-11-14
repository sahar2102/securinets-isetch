"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { PublicChallenge } from "@/lib/types";
import { useAppStore } from "@/lib/client-store";
import { useI18n } from "@/lib/i18n";
import { categoryBySlug, DifficultyBadge } from "@/components/ui/badges";
import { Icon, type IconName } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const plain = (text: string) =>
  text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function ChallengeCard({
  challenge,
  index = 0,
}: {
  challenge: PublicChallenge;
  index?: number;
}) {
  const { t } = useI18n();
  const { solvedSet } = useAppStore();
  const solved = solvedSet.has(challenge.slug);
  const cat = categoryBySlug(challenge.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link
        href={`/challenges/${challenge.slug}`}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-elev/40 p-5 transition-all duration-300",
          "hover:-translate-y-1 hover:bg-elev/70",
          solved ? "border-jade/25 hover:border-jade/40" : "border-line/10 hover:border-ember/30",
        )}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `linear-gradient(90deg, transparent, ${cat.accent}, transparent)` }}
        />

        <div className="mb-4 flex items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em]"
            style={{ color: cat.accent }}
          >
            <Icon name={cat.icon as IconName} size={13} />
            {cat.name}
          </span>
          <DifficultyBadge
            level={challenge.difficulty}
            label={t.difficulty[challenge.difficulty]}
          />
        </div>

        <h3 className="text-[17px] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-ember">
          {challenge.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted">
          {plain(challenge.description)}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {challenge.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded bg-line/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-muted/80">
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-line/8 pt-3.5">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-[15px] font-semibold text-ink">{challenge.points}</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">pts</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] text-muted">
            <span className="inline-flex items-center gap-1">
              <Icon name="users" size={12} />
              {challenge.solves}
            </span>
            {solved ? (
              <span className="inline-flex items-center gap-1 text-jade">
                <Icon name="check" size={12} />
                {t.challenges.solvedBadge}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Icon name="arrowUpRight" size={12} />
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
