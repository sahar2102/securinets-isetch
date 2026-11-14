/**
 * First-boot seeding.
 *
 * Creates the admin account from ADMIN_EMAIL/ADMIN_PASSWORD and a small
 * roster of demo players so the leaderboard is not empty on a fresh install.
 * Runs at most once per process and is a no-op when users already exist.
 */
import bcrypt from "bcryptjs";
import { getAllChallenges } from "./challenges";
import { addSolve, countUsers, createUser, findUserByEmail } from "./db";
import type { Solve } from "./types";

const globalForSeed = globalThis as unknown as { __sntSeed?: Promise<void> };

const DEMO_PLAYERS = [
  ["Salma Ferchichi", 0.95],
  ["Mehdi Khelifi", 0.86],
  ["Aziz Trabelsi", 0.78],
  ["Farah Zouari", 0.7],
  ["Nour Gharbi", 0.61],
  ["Wael Hammami", 0.55],
  ["Omar Ben Amor", 0.48],
  ["Ines Jaziri", 0.4],
  ["Karim Dridi", 0.34],
  ["Rania Chaabane", 0.28],
  ["Yasmine Ben Salah", 0.22],
  ["Sami Bouazizi", 0.16],
] as const;

export function ensureSeed(): Promise<void> {
  if (!globalForSeed.__sntSeed) {
    globalForSeed.__sntSeed = (async () => {
      const existing = await countUsers();
      const challenges = await getAllChallenges();

      if (!(await findUserByEmail(process.env.ADMIN_EMAIL ?? "securinetsisetch26@gmail.com"))) {
        const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "ChangeMe!2026", 10);
        await createUser({
          email: process.env.ADMIN_EMAIL ?? "securinetsisetch26@gmail.com",
          name: "Club Admin",
          passwordHash: hash,
          role: "admin",
        }).catch(() => undefined);
      }

      if (existing > 1) return;
  if (process.env.SEED_DEMO !== "true") return;

      const demoHash = await bcrypt.hash(`demo-${Math.random().toString(36)}`, 10);
      const sorted = challenges.slice().sort((a, b) => a.points - b.points);

      for (const [name, ratio] of DEMO_PLAYERS) {
        const slug = name.toLowerCase().replace(/[^a-z]+/g, ".");
        const email = `${slug}@demo.securinets.local`;
        let user;
        try {
          user = await createUser({ email, name, passwordHash: demoHash });
        } catch {
          continue;
        }

        const take = Math.max(1, Math.round(sorted.length * ratio));
        const picks = sorted.slice(0, take);
        const start = Date.now() - take * 5 * 36e5;

        for (let i = 0; i < picks.length; i++) {
          const c = picks[i];
          const hintCost = i % 5 === 0 ? (c.hints?.[0]?.cost ?? 0) : 0;
          const solve: Solve = {
            userId: user.id,
            challengeSlug: c.slug,
            points: c.points,
            hintCost,
            season: "2026",
            solvedAt: new Date(start + i * 5 * 36e5).toISOString(),
          };
          await addSolve(solve);
        }
      }
    })().catch((error) => {
      console.warn("[seed] skipped:", (error as Error).message);
      globalForSeed.__sntSeed = undefined;
    });
  }
  return globalForSeed.__sntSeed;
}
