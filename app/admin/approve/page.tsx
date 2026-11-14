import type { Metadata } from "next";
import Link from "next/link";
import { verifyActionToken } from "@/lib/approve-token";
import { getUserById } from "@/lib/db";

export const metadata: Metadata = {
  title: "Approve member",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ApprovePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; ok?: string }>;
}) {
  const { token, ok } = await searchParams;

  if (ok) {
    return (
      <Shell>
        <h1 className="font-display text-3xl font-semibold text-ink">Member approved.</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Their account is active — they can sign in and open the challenge range now. If they are
          already logged in, a refresh is enough.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/admin" className="btn btn-primary">
            Open admin
          </Link>
          <Link href="/challenges" className="btn btn-ghost">
            Challenge hub
          </Link>
        </div>
      </Shell>
    );
  }

  const claim = token ? verifyActionToken(token) : null;
  const user = claim?.action === "approve" ? await getUserById(claim.userId) : null;

  if (!token || !claim || !user) {
    return (
      <Shell>
        <h1 className="font-display text-3xl font-semibold text-ink">This link is not valid.</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          It may have expired (links last 3 days) or already been used. Open the admin panel and
          approve from Players instead.
        </p>
        <Link href="/admin" className="btn btn-primary mt-7">
          Open admin
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="eyebrow">One-click approval</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink">Approve {user.name}?</h1>
      <dl className="mt-6 space-y-2 rounded-xl border border-line/10 bg-elev/40 p-4 text-[14px]">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Name</dt>
          <dd className="text-ink">{user.name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Email</dt>
          <dd className="text-ink">{user.email}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Status</dt>
          <dd className="font-mono text-[12px] uppercase text-ember-text">{user.role}</dd>
        </div>
      </dl>
      <p className="mt-5 text-[13px] leading-relaxed text-muted">
        Approving grants access to the members-only challenge range. The button below is a POST on
        purpose, so email scanners cannot approve someone by opening the link.
      </p>
      <form action="/api/admin/approve" method="post" className="mt-6 flex flex-wrap gap-3">
        <input type="hidden" name="token" value={token} />
        <button type="submit" className="btn-primary">
          Approve access
        </button>
        <Link href="/admin" className="btn btn-ghost">
          Open admin instead
        </Link>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden pb-24 pt-32">
      <div aria-hidden className="grid-lines absolute inset-0 opacity-60" />
      <div className="container-x relative max-w-xl">{children}</div>
    </section>
  );
}
