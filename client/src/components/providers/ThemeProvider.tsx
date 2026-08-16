"use client";

/** Light-only editorial theme — no next-themes script injection (avoids React 19 script warnings). */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
