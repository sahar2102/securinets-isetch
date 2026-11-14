"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { AppStoreProvider } from "@/lib/client-store";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppStoreProvider>{children}</AppStoreProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
