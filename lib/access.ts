import { auth } from "@/auth";
import type { Role } from "./types";

/** Challenges are members-only unless MEMBERS_ONLY=false is set. */
export const membersOnly = process.env.MEMBERS_ONLY !== "false";

export interface Viewer {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export async function getViewer(): Promise<Viewer | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: (session.user.role as Role) ?? "member",
  };
}

export function canUseChallenges(role?: Role | null): boolean {
  if (!membersOnly) return true;
  return role === "member" || role === "admin";
}
