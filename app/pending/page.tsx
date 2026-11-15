import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SessionNotice } from "@/components/auth/session-notice";
import { getViewer } from "@/lib/access";

export const metadata: Metadata = {
  title: "Account status",
  description: "Check whether your membership request has been approved.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const viewer = await getViewer();

  if (!viewer) {
    return (
      <section className="container-x flex min-h-[calc(100svh-68px)] items-center py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-line/12 bg-elev/50 p-7 text-center backdrop-blur">
          <h1 className="font-display text-2xl font-semibold text-ink">No session found.</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
            Sign in with the email you registered with to see your request status.
          </p>
          <Link href="/login" className="btn-primary mt-6 w-full justify-center">
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  if (viewer.role !== "pending") redirect("/challenges");

  return <SessionNotice viewer={viewer} mode="status" />;
}
