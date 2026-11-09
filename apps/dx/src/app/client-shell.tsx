"use client";

import { ThemeProvider, ThemeCustomizer } from "@local-git/ui";

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <ThemeCustomizer />
    </ThemeProvider>
  );
}

