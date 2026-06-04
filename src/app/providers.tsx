import type { ReactNode } from "react";

import { ThemeProvider } from "@/app/ThemeProvider";

/**
 * Global provider shell. Wraps the app in the ThemeProvider (persona theming),
 * so everything it renders — including the router — sits inside the theme.
 * Further providers (session state etc.) arrive in later prompts.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
