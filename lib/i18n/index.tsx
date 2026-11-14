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
import { en, type Dictionary } from "./en";
import { fr } from "./fr";
import { ar } from "./ar";

export const locales = ["en", "fr", "ar"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, { short: string; long: string; dir: "ltr" | "rtl" }> = {
  en: { short: "EN", long: "English", dir: "ltr" },
  fr: { short: "FR", long: "Français", dir: "ltr" },
  ar: { short: "AR", long: "العربية", dir: "rtl" },
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[]
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

function merge<T>(base: T, override: DeepPartial<T> | undefined): T {
  if (!override) return base;
  if (Array.isArray(base)) return (override as T) ?? base;
  if (typeof base !== "object" || base === null) return (override as T) ?? base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = merge((base as Record<string, unknown>)[key], value as never);
    } else if (value !== undefined) {
      out[key] = value;
    }
  }
  return out as T;
}

const dictionaries: Record<Locale, Dictionary> = {
  en,
  fr,
  ar: merge<Dictionary>(en as Dictionary, ar),
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "snt-locale";

export function I18nProvider({
  children,
  initialLocale = "en",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && locales.includes(stored) && stored !== locale) {
      setLocaleState(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = localeLabels[locale].dir;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* storage may be blocked — the toggle still works for this session */
    }
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: dictionaries[locale],
      dir: localeLabels[locale].dir,
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

export function interpolate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}
