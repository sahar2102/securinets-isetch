import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { findUserByEmail, getUserById } from "@/lib/db";
import { ensureSeed } from "@/lib/seed";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? "dev-only-secret-change-me-in-production-32chars",
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 14 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        await ensureSeed().catch(() => undefined);

        const user = await findUserByEmail(parsed.data.email);
        if (!user) {
          // Constant-ish work to avoid trivially timing user existence.
          await bcrypt.compare(parsed.data.password, "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
          return null;
        }
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as { id?: string }).id;
        token.role = (user as { role?: string }).role ?? "member";
      }
      return token;
    },
    async session({ session, token }) {
      // A member approved while logged in keeps a "pending" token until they
      // sign out. Re-read the role (only for pending users) so access opens
      // immediately after an admin approves the account.
      const uid = typeof token.uid === "string" ? token.uid : null;
      if (uid && token.role === "pending") {
        const fresh = await getUserById(uid).catch(() => null);
        if (fresh && fresh.role !== "pending") token.role = fresh.role;
      }
      if (session.user) {
        session.user.id = String(token.uid ?? "");
        session.user.role = token.role === "admin" ? "admin" : token.role === "pending" ? "pending" : "member";
      }
      return session;
    },
  },
});
