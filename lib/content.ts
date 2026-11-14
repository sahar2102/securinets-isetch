/**
 * Content loaders for events, team and announcements.
 * Each loader merges the JSON seed with admin overrides (same model as
 * challenges) so the admin panel can edit content without a deploy.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { listOverrides } from "./db";
import { announcements } from "@/data/site";
import type { Certificate, EventItem, TeamMember } from "./types";

const read = async <T>(file: string): Promise<T> => {
  const raw = await fs.readFile(path.join(process.cwd(), "data", file), "utf8");
  return JSON.parse(raw) as T;
};

async function merge<T extends { id: string; hidden?: boolean }>(
  type: string,
  seed: T[],
): Promise<T[]> {
  let overrides: Awaited<ReturnType<typeof listOverrides<T>>> = [];
  try {
    overrides = await listOverrides<T>(type);
  } catch {
    overrides = [];
  }
  const map = new Map(seed.map((item) => [item.id, item]));
  for (const row of overrides) {
    if (row.deleted) {
      map.delete(row.slug);
      continue;
    }
    const prev = map.get(row.slug);
    map.set(row.slug, { ...(prev ?? ({} as T)), ...(row.data as T), id: row.slug });
  }
  return [...map.values()].filter((item) => !item.hidden);
}

export const getEvents = cache(async (): Promise<EventItem[]> => {
  const seed = await read<{ events: EventItem[] }>("events.json");
  const merged = await merge<EventItem>("event", seed.events);
  return merged.sort((a, b) => (a.date < b.date ? 1 : -1));
});

export const getUpcomingEvents = cache(async (): Promise<EventItem[]> => {
  return (await getEvents())
    .filter((e) => e.status === "upcoming")
    .sort((a, b) => (a.date > b.date ? 1 : -1));
});

export const getPastEvents = cache(async (): Promise<EventItem[]> => {
  return (await getEvents()).filter((e) => e.status === "past");
});

export const getTeam = cache(async (): Promise<TeamMember[]> => {
  const seed = await read<{ members: TeamMember[] }>("team.json");
  return merge<TeamMember>("member", seed.members);
});

export const getCertificates = cache(async (): Promise<Certificate[]> => {
  const seed = await read<{ certificates: Certificate[] }>("certificates.json");
  return merge<Certificate>("certificate", seed.certificates);
});

export const getAnnouncements = cache(async () => {
  const seed = announcements.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    tag: a.tag,
    date: a.date,
  }));
  const merged = await merge<{ id: string; title: string; body: string; tag: string; date: string; hidden?: boolean }>(
    "announcement",
    seed,
  );
  return merged.sort((a, b) => (a.date < b.date ? 1 : -1));
});

export async function verifyCertificate(number: string): Promise<Certificate | null> {
  const id = number.trim().toUpperCase().replace(/\s+/g, "");
  if (!/^SNT-ISETCH-2026-\d{3,5}$/.test(id)) return null;
  const all = await getCertificates();
  return all.find((c) => c.id.toUpperCase() === id) ?? null;
}
