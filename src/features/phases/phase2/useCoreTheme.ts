import { useSessionStore } from "@/features/session/sessionStore";

/** The core theme carried over from Phase 1 (the single `isCore` cluster). */
export interface CoreTheme {
  id: string;
  /** Raw cluster name (may be empty if it was left unnamed). */
  name: string;
}

/**
 * Reference to Phase 1's core theme: the single cluster with `isCore === true`
 * (the highest-weighted one). Phase 2 builds its goal in relation to it.
 * Returns null only in the exceptional case that no core cluster exists.
 */
export function useCoreTheme(): CoreTheme | null {
  const clusters = useSessionStore((s) => s.session?.phase1.clusters ?? []);
  const core = clusters.find((cluster) => cluster.isCore);
  if (!core) return null;
  return { id: core.id, name: core.name.trim() };
}

/** Display name for the core theme, with a calm fallback when unnamed. */
export function coreThemeLabel(core: CoreTheme | null): string {
  return core?.name || "dein Kernthema";
}
