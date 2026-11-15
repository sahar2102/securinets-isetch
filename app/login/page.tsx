import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { SessionNotice } from "@/components/auth/session-notice";
import { getViewer } from "@/lib/access";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to track your CTF progress and appear on the club leaderboard.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const viewer = await getViewer();

  // Already authenticated: no second login, just state it plainly.
  if (viewer) return <SessionNotice viewer={viewer} mode="login" />;

  return (
    <Suspense fallback={null}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
