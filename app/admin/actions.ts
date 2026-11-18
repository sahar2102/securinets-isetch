"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { makeFlagHash } from "@/lib/challenges";
import { deleteContent, updateUserRole, upsertContent } from "@/lib/db";
import { categories, difficulties } from "@/data/site";

export async function setUserRole(userId: string, role: "pending" | "member" | "admin") {
  try {
    await requireAdmin();
    await updateUserRole(userId, role);
    refresh();
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "unauthorized" };
  }
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/challenges");
  revalidatePath("/events");
  revalidatePath("/team");
  revalidatePath("/admin");
}

export type ActionResult = { ok: boolean; error?: string };

/* -------------------------------------------------------------------------- */

const challengeSchema = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  title: z.string().min(3).max(120),
  category: z.enum(categories.map((c) => c.slug) as [string, ...string[]]),
  difficulty: z.enum(Object.keys(difficulties) as [string, ...string[]]),
  points: z.coerce.number().int().min(10).max(2000),
  author: z.string().max(80).optional().default(""),
  date: z.string().min(4),
  description: z.string().min(10).max(20000),
  tags: z.array(z.string().max(30)).max(8).default([]),
  hints: z
    .array(z.object({ text: z.string().min(3).max(500), cost: z.coerce.number().int().min(0).max(500) }))
    .max(5)
    .default([]),
  flag: z.string().max(300).optional(),
  featured: z.boolean().default(false),
  hidden: z.boolean().default(false),
  solves: z.coerce.number().int().min(0).default(0),
});

export async function saveChallenge(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = challengeSchema.parse(input);
    const { flag, ...rest } = parsed;

    const record: Record<string, unknown> = { ...rest, id: parsed.slug };
    if (flag && flag.trim()) {
      Object.assign(record, makeFlagHash(flag.trim()));
    }

    await upsertContent("challenge", parsed.slug, record);
    refresh();
    return { ok: true };
  } catch (error) {
    const message = (error as Error).message;
    return { ok: false, error: message === "UNAUTHORIZED" ? "unauthorized" : "invalid" };
  }
}

export async function removeChallenge(slug: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await deleteContent("challenge", slug);
    refresh();
    return { ok: true };
  } catch {
    return { ok: false, error: "failed" };
  }
}

/* -------------------------------------------------------------------------- */

const eventSchema = z.object({
  id: z.string().min(2).max(80),
  title: z.string().min(3).max(140),
  kind: z.enum(["workshop", "ctf", "talk", "meetup"]),
  status: z.enum(["past", "upcoming"]),
  date: z.string().min(8),
  time: z.string().min(2).max(40),
  location: z.string().min(2).max(140),
  level: z.string().min(2).max(40),
  language: z.string().min(2).max(40),
  speakers: z.array(z.string().max(80)).max(8).default([]),
  summary: z.string().min(10).max(2000),
  capacity: z.coerce.number().int().min(0).max(10000).optional(),
  registered: z.coerce.number().int().min(0).max(10000).optional(),
  registrationOpen: z.boolean().default(false),
  tags: z.array(z.string().max(30)).max(8).default([]),
});

export async function saveEvent(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = eventSchema.parse(input);
    await upsertContent("event", parsed.id, { ...parsed, slug: parsed.id });
    refresh();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message === "UNAUTHORIZED" ? "unauthorized" : "invalid" };
  }
}

export async function removeEvent(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await deleteContent("event", id);
    refresh();
    return { ok: true };
  } catch {
    return { ok: false, error: "failed" };
  }
}

/* -------------------------------------------------------------------------- */

const memberSchema = z.object({
  id: z.string().min(1).max(60),
  name: z.string().min(2).max(80),
  role: z.string().min(2).max(80),
  roleFr: z.string().max(80).optional(),
  team: z.enum(["board", "tech", "hr", "comms", "events", "mentors"]),
  bio: z.string().min(5).max(400),
  initials: z.string().min(1).max(3),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  linkedin: z.string().max(200).optional(),
  github: z.string().max(200).optional(),
});

export async function saveMember(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = memberSchema.parse(input);
    await upsertContent("member", parsed.id, parsed);
    refresh();
    return { ok: true };
  } catch {
    return { ok: false, error: "invalid" };
  }
}

export async function removeMember(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await deleteContent("member", id);
    refresh();
    return { ok: true };
  } catch {
    return { ok: false, error: "failed" };
  }
}

/* -------------------------------------------------------------------------- */

const announcementSchema = z.object({
  id: z.string().min(1).max(60),
  title: z.string().min(3).max(140),
  body: z.string().min(5).max(600),
  tag: z.string().min(2).max(30),
  date: z.string().min(8),
});

export async function saveAnnouncement(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = announcementSchema.parse(input);
    await upsertContent("announcement", parsed.id, parsed);
    refresh();
    return { ok: true };
  } catch {
    return { ok: false, error: "invalid" };
  }
}

export async function removeAnnouncement(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await deleteContent("announcement", id);
    refresh();
    return { ok: true };
  } catch {
    return { ok: false, error: "failed" };
  }
}
