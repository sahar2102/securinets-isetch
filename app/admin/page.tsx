import { getAllChallenges } from "@/lib/challenges";
import { getAnnouncements, getEvents, getTeam } from "@/lib/content";
import {
  countRegistrations,
  countUsers,
  getAllIntegrityEvents,
  getAllSolves,
  getAllStarts,
  listRegistrations,
  listUsers,
} from "@/lib/db";
import { auth } from "@/auth";
import { AdminDashboard } from "@/components/admin/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  const [challenges, events, team, announcements, registrations, users, solves, applications, allUsers, starts, integrity] =
    await Promise.all([
      getAllChallenges(true),
      getEvents(),
      getTeam(),
      getAnnouncements(),
      listRegistrations(),
      countUsers(),
      getAllSolves(),
      countRegistrations(),
      listUsers(),
      getAllStarts(),
      getAllIntegrityEvents(),
    ]);

  // Never ship flag hashes or salts to the browser, even for admins.
  const safeChallenges = challenges.map((challenge) => ({
    ...challenge,
    flag: undefined,
    flagHash: challenge.flagHash ? "set" : undefined,
    salt: undefined,
  }));

  const players = allUsers.map((u) => {
    const mine = solves.filter((solve) => solve.userId === u.id);
    const last = mine.reduce<string | null>(
      (acc, solve) => (!acc || solve.solvedAt > acc ? solve.solvedAt : acc),
      null,
    );
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      solves: mine.length,
      score: mine.reduce((sum, solve) => sum + solve.points - (solve.hintCost ?? 0), 0),
      lastSolve: last,
    };
  });

  // One row per solve: who, which challenge, when, how long it took, and how many
  // suspicious actions (copy / screenshot / print attempts) happened on that challenge.
  const titles = new Map(challenges.map((c) => [c.slug, c.title]));
  const people = new Map(allUsers.map((u) => [u.id, u]));
  const startedAt = new Map(starts.map((x) => [`${x.userId}:${x.challengeSlug}`, x.startedAt]));
  const alerts = new Map<string, number>();
  for (const e of integrity) {
    const key = `${e.userId}:${e.challengeSlug}`;
    alerts.set(key, (alerts.get(key) ?? 0) + 1);
  }

  const activity = solves
    .map((solve) => {
      const key = `${solve.userId}:${solve.challengeSlug}`;
      const started = startedAt.get(key) ?? null;
      const seconds = started
        ? Math.max(0, Math.round((Date.parse(solve.solvedAt) - Date.parse(started)) / 1000))
        : null;
      return {
        userId: solve.userId,
        name: people.get(solve.userId)?.name ?? "Deleted user",
        email: people.get(solve.userId)?.email ?? "",
        slug: solve.challengeSlug,
        title: titles.get(solve.challengeSlug) ?? solve.challengeSlug,
        points: solve.points - (solve.hintCost ?? 0),
        solvedAt: solve.solvedAt,
        startedAt: started,
        seconds,
        alerts: alerts.get(key) ?? 0,
      };
    })
    .sort((a, b) => b.solvedAt.localeCompare(a.solvedAt));

  return (
    <AdminDashboard
      user={{
        name: session?.user?.name ?? "Admin",
        email: session?.user?.email ?? "",
      }}
      challenges={safeChallenges}
      events={events}
      team={team}
      announcements={announcements}
      registrations={registrations}
      players={players}
      activity={activity}
      stats={{ members: users, solves: solves.length, applications }}
    />
  );
}
