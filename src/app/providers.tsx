import type { ReactNode } from "react";

/**
 * Global provider shell. Currently a pass-through.
 *
 * The theme / persona provider (accent switching via the `--color-accent`
 * token, see styles/tokens.css) and any client-side state providers land in
 * Prompt 2+.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
