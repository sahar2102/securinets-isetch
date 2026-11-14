import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "pending" | "member" | "admin";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "pending" | "member" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: "pending" | "member" | "admin";
  }
}
