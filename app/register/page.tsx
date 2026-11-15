import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { SessionNotice } from "@/components/auth/session-notice";
import { getViewer } from "@/lib/access";

export const metadata: Metadata = {
  title: "Create an account",
  description: "One account for challenges, events and certificates at Securinets ISET Charguia.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const viewer = await getViewer();

  // A session already exists: either it is active or it is waiting for the
  // board's approval. Both cases replace the form with a clear status panel.
  if (viewer) return <SessionNotice viewer={viewer} mode="register" />;

  return (
    <Suspense fallback={null}>
      <AuthForm mode="register" />
    </Suspense>
  );
}
