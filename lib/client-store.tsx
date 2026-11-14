"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "pending" | "member" | "admin";
}

export interface ClientProgress {
  solved: string[];
  hints: Record<string, number[]>;
  guest: boolean;
  rank: number | null;
  score: number;
  achievements?: string[];
}

const GUEST_KEY = "snt-guest-progress";

const emptyProgress: ClientProgress = { solved: [], hints: {}, guest: true, rank: null, score: 0 };

interface StoreValue {
  user: SessionUser | null;
  loading: boolean;
  progress: ClientProgress;
  solvedSet: Set<string>;
  refresh: () => Promise<void>;
  recordSolve: (slug: string, points: number) => void;
  recordHint: (slug: string, index: number, cost: number) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

interface GuestState {
  solved: string[];
  hints: Record<string, number[]>;
  score: number;
}

function readGuest(): GuestState {
  try {
    const raw = window.localStorage.getItem(GUEST_KEY);
    if (!raw) return { solved: [], hints: {}, score: 0 };
    const parsed = JSON.parse(raw) as Partial<GuestState>;
    return {
      solved: parsed.solved ?? [],
      hints: parsed.hints ?? {},
      score: typeof parsed.score === "number" ? parsed.score : 0,
    };
  } catch {
    return { solved: [], hints: {}, score: 0 };
  }
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ClientProgress>(emptyProgress);

  const refresh = useCallback(async () => {
    try {
      const [sessionRes, progressRes] = await Promise.all([
        fetch("/api/auth/session", { cache: "no-store" }),
        fetch("/api/progress", { cache: "no-store" }),
      ]);
      const session = await sessionRes.json();
      const who = session?.user ?? null;
      setUser(who && who.id ? { ...who, role: who.role ?? "member" } : null);

      if (who?.id && progressRes.ok) {
        const data = await progressRes.json();
        setProgress({
          solved: data.solved ?? [],
          hints: data.hints ?? {},
          guest: false,
          rank: data.rank ?? null,
          score: data.score ?? 0,
          achievements: data.achievements ?? [],
        });
      } else {
        const guest = readGuest();
        setProgress({ ...guest, guest: true, rank: null });
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const persistGuest = useCallback((next: GuestState) => {
    try {
      window.localStorage.setItem(GUEST_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  }, []);

  const recordSolve = useCallback(
    (slug: string, points: number) => {
      setProgress((prev) => {
        if (prev.solved.includes(slug)) return prev;
        const solved = [...prev.solved, slug];
        const score = prev.score + points;
        if (prev.guest) persistGuest({ solved, hints: prev.hints, score });
        return { ...prev, solved, score };
      });
    },
    [persistGuest],
  );

  const recordHint = useCallback(
    (slug: string, index: number, cost: number) => {
      setProgress((prev) => {
        const current = prev.hints[slug] ?? [];
        if (current.includes(index)) return prev;
        const hints = { ...prev.hints, [slug]: [...current, index] };
        const score = Math.max(0, prev.score - cost);
        if (prev.guest) persistGuest({ solved: prev.solved, hints, score });
        return { ...prev, hints, score };
      });
    },
    [persistGuest],
  );

  const value = useMemo<StoreValue>(
    () => ({
      user,
      loading,
      progress,
      solvedSet: new Set(progress.solved),
      refresh,
      recordSolve,
      recordHint,
    }),
    [user, loading, progress, refresh, recordSolve, recordHint],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used inside <AppStoreProvider>");
  return ctx;
}
