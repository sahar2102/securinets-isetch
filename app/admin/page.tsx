import { getAllChallenges } from "@/lib/challenges";
import { getAnnouncements, getEvents, getTeam } from "@/lib/content";
import { countRegistrations, countUsers, getAllSolves, listRegistrations, listUsers } from "@/lib/db";
import { auth } from "@/auth";
import { AdminDashboard } from "@/components/admin/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  const [challenges, events, team, announcements, registrations, users, solves, applications, allUsers] =
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
      stats={{ members: users, solves: solves.length, applications }}
    />
  );
}
