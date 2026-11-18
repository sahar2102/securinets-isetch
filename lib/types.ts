import type { CategorySlug, Difficulty } from "@/data/site";

export type Role = "pending" | "member" | "admin";

export interface MemberProfile {
  university?: string;
  year?: string;
  field?: string;
  interests?: string[];
  motivation?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
  profile?: MemberProfile;
}

export type PublicUser = Omit<User, "passwordHash">;

export interface Solve {
  userId: string;
  challengeSlug: string;
  points: number;
  /** Points spent on hints for this challenge (deducted from the score). */
  hintCost: number;
  season: string;
  solvedAt: string;
}

/** First time a member opened a challenge (used to compute time-to-solve). */
export interface ChallengeStart {
  userId: string;
  challengeSlug: string;
  startedAt: string;
}

export type IntegrityKind = "copy" | "screenshot" | "print" | "menu";

/** A suspicious action detected while a member was viewing a challenge. */
export interface IntegrityEvent {
  userId: string;
  challengeSlug: string;
  kind: IntegrityKind;
  at: string;
}

export interface HintUnlock {
  userId: string;
  challengeSlug: string;
  hintIndex: number;
  cost: number;
  unlockedAt: string;
}

export interface ChallengeFile {
  name: string;
  href: string;
  size?: string;
}

export interface Hint {
  text: string;
  cost: number;
}

/**
 * Authoring shape: exactly what lives in data/challenges/*.json.
 * `flagHash` and `salt` never leave the server.
 */
export interface ChallengeRecord {
  id: string;
  slug: string;
  title: string;
  category: CategorySlug;
  difficulty: Difficulty;
  points: number;
  solves: number;
  author?: string;
  tags: string[];
  date: string;
  featured?: boolean;
  description: string;
  files?: ChallengeFile[];
  hints?: Hint[];
  flag?: string;
  flagHash?: string;
  salt?: string;
  hidden?: boolean;
  createdAt?: string;
}

/** What the browser is allowed to see. */
export type PublicChallenge = Omit<ChallengeRecord, "flag" | "flagHash" | "salt" | "hidden">;

export interface HintView extends Hint {
  index: number;
  unlocked: boolean;
}

export interface ChallengeDetail extends PublicChallenge {
  hints: HintView[];
  solved: boolean;
}

export interface Progress {
  score: number;
  solved: string[];
  hintSpend: number;
  byCategory: Record<string, { solved: number; total: number; points: number }>;
  achievements: string[];
  rank: number | null;
}

export interface LeaderboardRow {
  rank: number;
  userId: string;
  name: string;
  score: number;
  solves: number;
  lastSolve: string | null;
  isDemo?: boolean;
}

export interface Certificate {
  id: string;
  holder: string;
  event: string;
  type: string;
  issuedAt: string;
  hours?: number;
  status: "valid" | "revoked";
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  titleEn?: string;
  kind: "workshop" | "ctf" | "talk" | "meetup";
  status: "past" | "upcoming";
  date: string;
  endDate?: string;
  time: string;
  location: string;
  language: string;
  level: string;
  speakers: string[];
  summary: string;
  summaryEn?: string;
  attendees?: number;
  capacity?: number;
  registered?: number;
  prizes?: string[];
  recording?: string;
  gallery?: { src: string; caption: string }[];
  tags: string[];
  registrationOpen?: boolean;
  registrationUrl?: string;
  featured?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  roleFr?: string;
  team: "board" | "tech" | "hr" | "comms" | "events" | "mentors";
  bio: string;
  initials: string;
  accent: string;
  linkedin?: string;
  github?: string;
  photo?: string;
  hidden?: boolean;
}

export interface Registration {
  id: string;
  name: string;
  email: string;
  year: string;
  field: string;
  interests: string[];
  motivation: string;
  intent?: string;
  createdAt: string;
}

export interface ContentRow<T = unknown> {
  type: string;
  slug: string;
  data: T;
  deleted?: boolean;
  updatedAt?: string;
}
