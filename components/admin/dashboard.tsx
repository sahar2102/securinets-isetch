"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { categories, difficulties } from "@/data/site";
import type { ChallengeRecord, EventItem, TeamMember } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { Icon, type IconName } from "@/components/ui/icons";
import { cn, formatDate, slugify } from "@/lib/utils";
import {
  removeAnnouncement,
  removeChallenge,
  removeEvent,
  removeMember,
  saveAnnouncement,
  saveChallenge,
  saveEvent,
  saveMember,
  resetUserPassword,
  setUserRole,
  type ActionResult,
} from "@/app/admin/actions";

type Tab = "overview" | "challenges" | "events" | "members" | "announcements" | "applications" | "players";

interface Announcement {
  id: string;
  title: string;
  body: string;
  tag: string;
  date: string;
}

interface Props {
  user: { name: string; email: string };
  players: {
    id: string;
    name: string;
    email: string;
    role: "pending" | "member" | "admin";
    solves: number;
    score: number;
    lastSolve: string | null;
    profile?: {
      university?: string;
      year?: string;
      field?: string;
      motivation?: string;
    };
  }[];
  challenges: ChallengeRecord[];
  events: EventItem[];
  team: TeamMember[];
  announcements: Announcement[];
  registrations: Record<string, unknown>[];
  stats: { members: number; solves: number; applications: number };
}

export function AdminDashboard({ user, players, challenges, events, team, announcements, registrations, stats }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [toast, setToast] = useState<string | null>(null);

  const [challengeDraft, setChallengeDraft] = useState<Partial<ChallengeRecord> | null>(null);
  const [eventDraft, setEventDraft] = useState<Partial<EventItem> | null>(null);
  const [memberDraft, setMemberDraft] = useState<Partial<TeamMember> | null>(null);
  const [announcementDraft, setAnnouncementDraft] = useState<Partial<Announcement> | null>(null);

  const approve = async (id: string, role: "pending" | "member" = "member") => {
    const result = await setUserRole(id, role);
    if (result.ok) {
      setToast(role === "member" ? "Member approved" : "Access revoked");
      router.refresh();
    } else {
      setToast("Not authorized");
    }
    setTimeout(() => setToast(null), 3000);
  };

  const notify = (result: ActionResult, message = "Saved") => {
    if (result.ok) {
      setToast(message);
      setChallengeDraft(null);
      setEventDraft(null);
      setMemberDraft(null);
      setAnnouncementDraft(null);
      router.refresh();
    } else {
      setToast(result.error === "unauthorized" ? "Not authorized" : "Check the fields and try again");
    }
    setTimeout(() => setToast(null), 3200);
  };

  const nav: { key: Tab; label: string; icon: IconName; count?: number }[] = [
    { key: "overview", label: t.admin.overview, icon: "grid" },
    { key: "challenges", label: t.admin.challenges, icon: "flag", count: challenges.length },
    { key: "events", label: t.admin.events, icon: "calendar", count: events.length },
    { key: "members", label: t.admin.members, icon: "users", count: team.length },
    { key: "announcements", label: t.admin.announcements, icon: "mic", count: announcements.length },
    { key: "applications", label: t.admin.registrations, icon: "mail", count: registrations.length },
    {
      key: "players",
      label: "Players",
      icon: "trophy",
      count: players.filter((p) => p.role === "pending").length || undefined,
    },
  ];

  const resetPassword = async (id: string, email: string) => {
    const next = window.prompt(`New password for ${email} (min 8 characters).\nGive it to the member privately — it is shown only here.`);
    if (!next) return;
    if (next.length < 8) { setToast("Password must be at least 8 characters"); setTimeout(() => setToast(null), 3000); return; }
    const result = await resetUserPassword(id, next);
    setToast(result.ok ? `Password updated for ${email}` : "Could not update password");
    setTimeout(() => setToast(null), 3500);
    if (result.ok) router.refresh();
  };

  return (
    <div className="container-x py-10">
      <div className="flex flex-col justify-between gap-4 border-b border-line/10 pb-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ember">/admin</p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">{t.admin.title}</h1>
          <p className="mt-1 text-[12.5px] text-muted">
            {user.name} · {user.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="btn-ghost !py-2 !text-[12px]">
            {t.admin.backToSite}
          </Link>
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/" })}
            className="btn-quiet !py-2 !text-[12px]"
          >
            {t.admin.signOut}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="scrollbar-none flex gap-1 overflow-x-auto lg:flex-col" aria-label="Admin">
          {nav.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-start text-[13px] transition-colors",
                tab === item.key ? "bg-ember/10 text-ember" : "text-muted hover:bg-line/5 hover:text-ink",
              )}
            >
              <Icon name={item.icon} size={15} />
              {item.label}
              {typeof item.count === "number" ? (
                <span className="ms-auto font-mono text-[10px] text-muted/50">{item.count}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {tab === "overview" ? (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: t.admin.stats.members, value: stats.members, icon: "users" as IconName },
                  { label: t.admin.stats.challenges, value: challenges.length, icon: "flag" as IconName },
                  { label: t.admin.stats.solves, value: stats.solves, icon: "trophy" as IconName },
                  { label: t.admin.stats.applications, value: stats.applications, icon: "mail" as IconName },
                ].map((card) => (
                  <div key={card.label} className="rounded-xl border border-line/10 bg-elev/40 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">
                        {card.label}
                      </span>
                      <Icon name={card.icon} size={14} className="text-ember" />
                    </div>
                    <p className="mt-3 font-display text-2xl font-semibold text-ink">{card.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-line/10 bg-elev/40 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-[15px] font-semibold text-ink">{t.admin.registrations}</h2>
                  <button
                    type="button"
                    onClick={() => setTab("applications")}
                    className="font-mono text-[10px] text-ember hover:underline"
                  >
                    view all
                  </button>
                </div>
                <ul className="mt-4 divide-y divide-line/8">
                  {registrations.slice(0, 5).map((reg, i) => (
                    <li key={i} className="flex items-center justify-between gap-4 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] text-ink">{String(reg.name ?? "—")}</p>
                        <p className="truncate font-mono text-[10px] text-muted">{String(reg.email ?? "")}</p>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] text-muted/60">
                        {String(reg.year ?? "")}
                      </span>
                    </li>
                  ))}
                  {registrations.length === 0 ? (
                    <li className="py-3 text-[12.5px] text-muted">No applications yet.</li>
                  ) : null}
                </ul>
              </div>

              <div className="rounded-xl border border-ember/20 bg-ember/[0.04] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ember">/how-to</p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                  Everything here is written to the database (or the local .data store) and merged over the
                  JSON seed. Nothing you change requires a deploy. New challenges appear on the public hub
                  immediately after saving.
                </p>
                <Link href="/challenges" className="mt-3 inline-flex items-center gap-1 font-mono text-[10.5px] text-ember">
                  open public hub <Icon name="arrowUpRight" size={11} />
                </Link>
              </div>
            </div>
          ) : null}

          {tab === "challenges" ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  {challenges.length} challenges
                </p>
                <button
                  type="button"
                  onClick={() => setChallengeDraft({ difficulty: "beginner", category: "web", points: 50, date: new Date().toISOString().slice(0, 10), tags: [], hints: [] })}
                  className="btn-primary !py-2 !text-[12px]"
                >
                  <Icon name="flag" size={14} />
                  {t.admin.newChallenge}
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-line/10">
                <table className="w-full text-start">
                  <thead className="bg-elev/50 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                    <tr>
                      <th className="px-3 py-2.5 text-start">Title</th>
                      <th className="hidden px-3 py-2.5 text-start sm:table-cell">Category</th>
                      <th className="px-3 py-2.5 text-end">Pts</th>
                      <th className="px-3 py-2.5 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challenges.map((challenge) => (
                      <tr key={challenge.slug} className="border-t border-line/8">
                        <td className="px-3 py-2.5">
                          <p className="text-[12.5px] text-ink">{challenge.title}</p>
                          <p className="font-mono text-[9.5px] text-muted/60">
                            {challenge.slug}
                            {challenge.flagHash || challenge.flag ? " · flag set" : " · no flag"}
                          </p>
                        </td>
                        <td className="hidden px-3 py-2.5 font-mono text-[10px] text-muted sm:table-cell">
                          {challenge.category} · {challenge.difficulty}
                        </td>
                        <td className="px-3 py-2.5 text-end font-mono text-[11px] text-ink">{challenge.points}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setChallengeDraft(challenge)}
                              className="rounded-md border border-line/12 px-2 py-1 text-[10.5px] text-muted hover:text-ink"
                            >
                              {t.admin.edit}
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!window.confirm(t.admin.confirmDelete)) return;
                                notify(await removeChallenge(challenge.slug), "Deleted");
                              }}
                              className="rounded-md border border-line/12 px-2 py-1 text-[10.5px] text-muted hover:border-ember/40 hover:text-ember"
                            >
                              {t.admin.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {tab === "events" ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{events.length} events</p>
                <button
                  type="button"
                  onClick={() =>
                    setEventDraft({
                      status: "upcoming",
                      kind: "workshop",
                      date: new Date().toISOString().slice(0, 10),
                      time: "18:00 – 20:00",
                      level: "Beginner",
                      language: "FR",
                      speakers: [],
                      tags: [],
                      registrationOpen: true,
                      capacity: 30,
                      registered: 0,
                    })
                  }
                  className="btn-primary !py-2 !text-[12px]"
                >
                  <Icon name="calendar" size={14} />
                  New event
                </button>
              </div>

              <div className="space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-line/10 bg-elev/30 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] text-ink">{event.title}</p>
                      <p className="font-mono text-[10px] text-muted">
                        {formatDate(event.date)} · {event.location} · {event.status}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setEventDraft(event)}
                        className="rounded-md border border-line/12 px-2 py-1 text-[10.5px] text-muted hover:text-ink"
                      >
                        {t.admin.edit}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm(t.admin.confirmDelete)) return;
                          notify(await removeEvent(event.id), "Deleted");
                        }}
                        className="rounded-md border border-line/12 px-2 py-1 text-[10.5px] text-muted hover:text-ember"
                      >
                        {t.admin.delete}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "members" ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{team.length} members</p>
                <button
                  type="button"
                  onClick={() => setMemberDraft({ team: "board", accent: "#FF2D3D", initials: "" })}
                  className="btn-primary !py-2 !text-[12px]"
                >
                  <Icon name="users" size={14} />
                  New member
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {team.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 rounded-xl border border-line/10 bg-elev/30 p-3">
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg font-display text-[11px] font-bold"
                      style={{ background: `${member.accent}22`, color: member.accent }}
                    >
                      {member.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] text-ink">{member.name}</p>
                      <p className="truncate font-mono text-[9.5px] text-muted">{member.role}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setMemberDraft(member)}
                        className="rounded-md border border-line/12 px-1.5 py-1 text-[10px] text-muted hover:text-ink"
                      >
                        {t.admin.edit}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm(t.admin.confirmDelete)) return;
                          notify(await removeMember(member.id), "Deleted");
                        }}
                        className="rounded-md border border-line/12 px-1.5 py-1 text-[10px] text-muted hover:text-ember"
                      >
                        {t.admin.delete}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "announcements" ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  {announcements.length} announcements
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setAnnouncementDraft({ date: new Date().toISOString().slice(0, 10), tag: "Platform" })
                  }
                  className="btn-primary !py-2 !text-[12px]"
                >
                  <Icon name="mic" size={14} />
                  New announcement
                </button>
              </div>

              <div className="space-y-2">
                {announcements.map((item) => (
                  <div key={item.id} className="rounded-xl border border-line/10 bg-elev/30 p-4">
                    <div className="flex items-center gap-2">
                      <span className="chip">{item.tag}</span>
                      <span className="font-mono text-[10px] text-muted">{formatDate(item.date)}</span>
                      <div className="ms-auto flex gap-1">
                        <button
                          type="button"
                          onClick={() => setAnnouncementDraft(item)}
                          className="rounded-md border border-line/12 px-2 py-0.5 text-[10.5px] text-muted hover:text-ink"
                        >
                          {t.admin.edit}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm(t.admin.confirmDelete)) return;
                            notify(await removeAnnouncement(item.id), "Deleted");
                          }}
                          className="rounded-md border border-line/12 px-2 py-0.5 text-[10.5px] text-muted hover:text-ember"
                        >
                          {t.admin.delete}
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-[13px] font-medium text-ink">{item.title}</p>
                    <p className="mt-1 text-[12px] text-muted">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "players" ? (
            <div className="rounded-2xl border border-line/10 bg-elev/40">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/10 p-5">
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink">Players</h2>
                  <p className="mt-1 text-[12.5px] text-muted">
                    Who solved what, how much, and who still needs approval.
                  </p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  {players.length} accounts
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-[12.5px]">
                  <thead className="border-b border-line/10 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    <tr>
                      <th className="px-5 py-3">Member</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Solved</th>
                      <th className="px-3 py-3">Score</th>
                      <th className="px-3 py-3">Last solve</th>
                      <th className="px-5 py-3 text-right">Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((p) => (
                      <tr key={p.id} className="border-b border-line/5 last:border-0">
                        <td className="px-5 py-3">
                          <p className="font-medium text-ink">{p.name}</p>
                          <p className="font-mono text-[10.5px] text-muted">{p.email}</p>
                          {p.profile?.university ? (
                            <p className="mt-1 max-w-[280px] text-[11px] leading-snug text-muted/80">
                              {p.profile.university} · {p.profile.year} · {p.profile.field}
                            </p>
                          ) : null}
                          {p.profile?.motivation ? (
                            <p className="mt-1 max-w-[300px] text-[11px] leading-snug text-muted/60">
                              “{p.profile.motivation}”
                            </p>
                          ) : null}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={cn(
                              "rounded-full px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.1em]",
                              p.role === "admin"
                                ? "bg-ember/15 text-ember"
                                : p.role === "member"
                                  ? "bg-[#2FBF8F]/15 text-[#2FBF8F]"
                                  : "bg-line/10 text-muted",
                            )}
                          >
                            {p.role}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono">{p.solves}</td>
                        <td className="px-3 py-3 font-mono">{p.score}</td>
                        <td className="px-3 py-3 font-mono text-[11px] text-muted">
                          {p.lastSolve ? formatDate(p.lastSolve) : "—"}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {p.role === "pending" ? (
                            <button
                              type="button"
                              onClick={() => void approve(p.id)}
                              className="rounded-lg bg-ember px-3 py-1.5 text-[11.5px] font-semibold text-white"
                            >
                              Approve
                            </button>
                          ) : p.role === "member" ? (
                            <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
                              <button
                                type="button"
                                onClick={() => void resetPassword(p.id, p.email)}
                                className="text-[11.5px] text-muted underline-offset-4 hover:text-ink hover:underline"
                              >
                                Reset password
                              </button>
                              <button
                                type="button"
                                onClick={() => void approve(p.id, "pending")}
                                className="text-[11.5px] text-muted underline-offset-4 hover:text-ink hover:underline"
                              >
                                Revoke
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {tab === "applications" ? (

            <div className="overflow-hidden rounded-xl border border-line/10">
              {registrations.length === 0 ? (
                <p className="p-8 text-center text-[13px] text-muted">No applications yet.</p>
              ) : (
                <table className="w-full text-start">
                  <thead className="bg-elev/50 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                    <tr>
                      <th className="px-3 py-2.5 text-start">Name</th>
                      <th className="hidden px-3 py-2.5 text-start sm:table-cell">Year / field</th>
                      <th className="px-3 py-2.5 text-start">Motivation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg, i) => (
                      <tr key={i} className="border-t border-line/8 align-top">
                        <td className="px-3 py-3">
                          <p className="text-[12.5px] text-ink">{String(reg.name ?? "—")}</p>
                          <a
                            href={`mailto:${String(reg.email ?? "")}`}
                            className="font-mono text-[9.5px] text-ember hover:underline"
                          >
                            {String(reg.email ?? "")}
                          </a>
                        </td>
                        <td className="hidden px-3 py-3 font-mono text-[10px] text-muted sm:table-cell">
                          {String(reg.year ?? "")}
                          <br />
                          {String(reg.field ?? "")}
                        </td>
                        <td className="max-w-sm px-3 py-3 text-[11.5px] leading-relaxed text-muted">
                          {String(reg.motivation ?? "").slice(0, 220)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-full border border-line/15 bg-elev px-4 py-2.5 text-[12.5px] text-ink shadow-2xl"
            role="status"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <EditorModal open={Boolean(challengeDraft)} title={challengeDraft?.title ? "Edit challenge" : t.admin.newChallenge} onClose={() => setChallengeDraft(null)}>
        {challengeDraft ? (
          <ChallengeForm initial={challengeDraft} onSubmit={async (data) => notify(await saveChallenge(data))} />
        ) : null}
      </EditorModal>

      <EditorModal open={Boolean(eventDraft)} title={eventDraft?.title ? "Edit event" : "New event"} onClose={() => setEventDraft(null)}>
        {eventDraft ? <EventForm initial={eventDraft} onSubmit={async (data) => notify(await saveEvent(data))} /> : null}
      </EditorModal>

      <EditorModal open={Boolean(memberDraft)} title={memberDraft?.name ? "Edit member" : "New member"} onClose={() => setMemberDraft(null)}>
        {memberDraft ? <MemberForm initial={memberDraft} onSubmit={async (data) => notify(await saveMember(data))} /> : null}
      </EditorModal>

      <EditorModal
        open={Boolean(announcementDraft)}
        title={announcementDraft?.title ? "Edit announcement" : "New announcement"}
        onClose={() => setAnnouncementDraft(null)}
      >
        {announcementDraft ? (
          <AnnouncementForm initial={announcementDraft} onSubmit={async (data) => notify(await saveAnnouncement(data))} />
        ) : null}
      </EditorModal>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function EditorModal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            className="my-4 w-full max-w-2xl overflow-hidden rounded-2xl border border-line/15 bg-elev shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line/10 px-5 py-4">
              <h2 className="font-display text-[15px] font-semibold text-ink">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-muted hover:text-ink">
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="max-h-[75svh] overflow-y-auto p-5">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint ? <span className="mt-1 block font-mono text-[9.5px] text-muted/60">{hint}</span> : null}
    </label>
  );
}

/* -------------------------------------------------------------------------- */

function ChallengeForm({
  initial,
  onSubmit,
}: {
  initial: Partial<ChallengeRecord>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    slug: initial.slug ?? "",
    title: initial.title ?? "",
    category: initial.category ?? "web",
    difficulty: initial.difficulty ?? "beginner",
    points: initial.points ?? 50,
    author: initial.author ?? "",
    date: initial.date ?? new Date().toISOString().slice(0, 10),
    description: initial.description ?? "",
    tags: (initial.tags ?? []).join(", "),
    hints: initial.hints ?? [],
    flag: "",
    featured: initial.featured ?? false,
    hidden: initial.hidden ?? false,
    solves: initial.solves ?? 0,
  });
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        await onSubmit({
          ...form,
          slug: form.slug || slugify(form.title),
          tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          hints: form.hints.filter((hint) => hint.text.trim()),
        });
        setBusy(false);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input
            className="input"
            required
            value={form.title}
            onChange={(e) => {
              set("title", e.target.value);
              if (!initial.slug) set("slug", slugify(e.target.value));
            }}
          />
        </Field>
        <Field label="Slug" hint="lowercase, hyphens only">
          <input className="input font-mono" required value={form.slug} onChange={(e) => set("slug", e.target.value)} />
        </Field>
        <Field label="Category">
          <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Difficulty">
          <select className="input" value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
            {Object.entries(difficulties).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label} ({meta.points[0]}–{meta.points[1]} pts)
              </option>
            ))}
          </select>
        </Field>
        <Field label="Points">
          <input type="number" className="input" value={form.points} onChange={(e) => set("points", Number(e.target.value))} />
        </Field>
        <Field label="Author">
          <input className="input" value={form.author} onChange={(e) => set("author", e.target.value)} />
        </Field>
        <Field label="Release date">
          <input type="date" className="input" value={form.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
        <Field label="Solves (display)">
          <input type="number" className="input" value={form.solves} onChange={(e) => set("solves", Number(e.target.value))} />
        </Field>
      </div>

      <Field label="Description (Markdown)">
        <textarea rows={6} className="input resize-y font-mono text-[12px]" required value={form.description} onChange={(e) => set("description", e.target.value)} />
      </Field>

      <Field label="Tags" hint="comma separated">
        <input className="input" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
      </Field>

      <div>
        <span className="label">Hints</span>
        <div className="space-y-2">
          {form.hints.map((hint, index) => (
            <div key={index} className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Hint text"
                value={hint.text}
                onChange={(e) => {
                  const next = [...form.hints];
                  next[index] = { ...next[index], text: e.target.value };
                  set("hints", next);
                }}
              />
              <input
                type="number"
                className="input !w-20"
                value={hint.cost}
                onChange={(e) => {
                  const next = [...form.hints];
                  next[index] = { ...next[index], cost: Number(e.target.value) };
                  set("hints", next);
                }}
              />
              <button
                type="button"
                onClick={() => set("hints", form.hints.filter((_, i) => i !== index))}
                className="rounded-lg border border-line/12 px-2 text-muted hover:text-ember"
                aria-label="Remove hint"
              >
                <Icon name="close" size={13} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => set("hints", [...form.hints, { text: "", cost: 25 }])}
          className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ember"
        >
          + add hint
        </button>
      </div>

      <Field label="Flag" hint={initial.flagHash ? "A flag is already set. Leave blank to keep it." : "Stored as a salted SHA-256 hash, never in clear."}>
        <input
          className="input font-mono"
          placeholder="SNT{...}"
          value={form.flag}
          onChange={(e) => set("flag", e.target.value)}
          autoComplete="off"
        />
      </Field>

      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-[12.5px] text-muted">
          <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-[#B3001B]" />
          Featured on home
        </label>
        <label className="flex items-center gap-2 text-[12.5px] text-muted">
          <input type="checkbox" checked={form.hidden} onChange={(e) => set("hidden", e.target.checked)} className="h-4 w-4 accent-[#B3001B]" />
          Hidden from public
        </label>
      </div>

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "Saving…" : "Save challenge"}
      </button>
    </form>
  );
}

function EventForm({ initial, onSubmit }: { initial: Partial<EventItem>; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    id: initial.id ?? initial.slug ?? "",
    title: initial.title ?? "",
    kind: initial.kind ?? "workshop",
    status: initial.status ?? "upcoming",
    date: initial.date ?? new Date().toISOString().slice(0, 10),
    time: initial.time ?? "",
    location: initial.location ?? "",
    level: initial.level ?? "Beginner",
    language: initial.language ?? "FR",
    speakers: (initial.speakers ?? []).join(", "),
    summary: initial.summary ?? "",
    capacity: initial.capacity ?? 30,
    registered: initial.registered ?? 0,
    registrationOpen: initial.registrationOpen ?? true,
    tags: (initial.tags ?? []).join(", "),
  });
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof form, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        await onSubmit({
          ...form,
          id: form.id || slugify(form.title),
          speakers: form.speakers.split(",").map((s) => s.trim()).filter(Boolean),
          tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        });
        setBusy(false);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input className="input" required value={form.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="ID" hint="stable identifier">
          <input className="input font-mono" value={form.id} onChange={(e) => set("id", e.target.value)} />
        </Field>
        <Field label="Kind">
          <select className="input" value={form.kind} onChange={(e) => set("kind", e.target.value)}>
            {["workshop", "ctf", "talk", "meetup"].map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select className="input" value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="upcoming">upcoming</option>
            <option value="past">past</option>
          </select>
        </Field>
        <Field label="Date">
          <input type="date" className="input" value={form.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
        <Field label="Time">
          <input className="input" value={form.time} onChange={(e) => set("time", e.target.value)} />
        </Field>
        <Field label="Location">
          <input className="input" value={form.location} onChange={(e) => set("location", e.target.value)} />
        </Field>
        <Field label="Level">
          <input className="input" value={form.level} onChange={(e) => set("level", e.target.value)} />
        </Field>
        <Field label="Language">
          <input className="input" value={form.language} onChange={(e) => set("language", e.target.value)} />
        </Field>
        <Field label="Speakers" hint="comma separated">
          <input className="input" value={form.speakers} onChange={(e) => set("speakers", e.target.value)} />
        </Field>
        <Field label="Capacity">
          <input type="number" className="input" value={form.capacity} onChange={(e) => set("capacity", Number(e.target.value))} />
        </Field>
        <Field label="Registered">
          <input type="number" className="input" value={form.registered} onChange={(e) => set("registered", Number(e.target.value))} />
        </Field>
      </div>

      <Field label="Summary">
        <textarea rows={3} className="input resize-y" value={form.summary} onChange={(e) => set("summary", e.target.value)} />
      </Field>

      <Field label="Tags" hint="comma separated">
        <input className="input" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
      </Field>

      <label className="flex items-center gap-2 text-[12.5px] text-muted">
        <input type="checkbox" checked={form.registrationOpen} onChange={(e) => set("registrationOpen", e.target.checked)} className="h-4 w-4 accent-[#B3001B]" />
        Registration open
      </label>

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "Saving…" : "Save event"}
      </button>
    </form>
  );
}

function MemberForm({ initial, onSubmit }: { initial: Partial<TeamMember>; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    id: initial.id ?? "",
    name: initial.name ?? "",
    role: initial.role ?? "",
    roleFr: initial.roleFr ?? "",
    team: initial.team ?? "board",
    bio: initial.bio ?? "",
    initials: initial.initials ?? "",
    accent: initial.accent ?? "#FF2D3D",
    linkedin: initial.linkedin ?? "",
    github: initial.github ?? "",
  });
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof form, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        await onSubmit({
          ...form,
          id: form.id || slugify(form.name),
          initials:
            form.initials ||
            form.name
              .split(/\s+/)
              .slice(0, 2)
              .map((p) => p[0])
              .join("")
              .toUpperCase(),
          linkedin: form.linkedin || undefined,
          github: form.github || undefined,
          roleFr: form.roleFr || undefined,
        });
        setBusy(false);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input className="input" required value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Role">
          <input className="input" required value={form.role} onChange={(e) => set("role", e.target.value)} />
        </Field>
        <Field label="Role (FR)">
          <input className="input" value={form.roleFr} onChange={(e) => set("roleFr", e.target.value)} />
        </Field>
        <Field label="Team">
          <select className="input" value={form.team} onChange={(e) => set("team", e.target.value)}>
            {["board", "tech", "hr", "comms", "events", "mentors"].map((team) => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </Field>
        <Field label="Initials">
          <input className="input" maxLength={3} value={form.initials} onChange={(e) => set("initials", e.target.value)} />
        </Field>
        <Field label="Accent colour">
          <input type="color" className="input !p-1" value={form.accent} onChange={(e) => set("accent", e.target.value)} />
        </Field>
        <Field label="LinkedIn URL">
          <input className="input" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
        </Field>
        <Field label="GitHub URL">
          <input className="input" value={form.github} onChange={(e) => set("github", e.target.value)} />
        </Field>
      </div>

      <Field label="Bio">
        <textarea rows={3} className="input resize-y" value={form.bio} onChange={(e) => set("bio", e.target.value)} />
      </Field>

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "Saving…" : "Save member"}
      </button>
    </form>
  );
}

function AnnouncementForm({
  initial,
  onSubmit,
}: {
  initial: Partial<Announcement>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    id: initial.id ?? "",
    title: initial.title ?? "",
    body: initial.body ?? "",
    tag: initial.tag ?? "Platform",
    date: initial.date ?? new Date().toISOString().slice(0, 10),
  });
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        await onSubmit({ ...form, id: form.id || slugify(form.title) });
        setBusy(false);
      }}
    >
      <Field label="Title">
        <input className="input" required value={form.title} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tag">
          <input className="input" value={form.tag} onChange={(e) => set("tag", e.target.value)} />
        </Field>
        <Field label="Date">
          <input type="date" className="input" value={form.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
      </div>
      <Field label="Body">
        <textarea rows={3} className="input resize-y" value={form.body} onChange={(e) => set("body", e.target.value)} />
      </Field>
      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "Saving…" : "Save announcement"}
      </button>
    </form>
  );
}
