/**
 * Schema migration scaffold.
 *
 * As CURRENT_SCHEMA_VERSION grows, add an entry per step to MIGRATIONS:
 * MIGRATIONS[n] upgrades a v`n` object to v`n+1`. migrateSession() then walks
 * the chain from the file's version up to the current one. For v1→v1 the chain
 * is empty (identity).
 */

import { CURRENT_SCHEMA_VERSION, type Session } from "@/features/session/types";

/** Upgrades a raw session object by exactly one schema version. */
type Migration = (raw: unknown) => unknown;

/** Migration chain, keyed by the version being upgraded FROM. */
const MIGRATIONS: Record<number, Migration> = {
  /** v1 → v2: introduce the navigation/progress field (start at phase 0). */
  1: (raw) => ({
    ...(raw as Record<string, unknown>),
    progress: { phase: 0, step: 0, completedPhases: [] },
  }),
};

/** Raised when no migration path exists for a given version. */
export class MigrationError extends Error {}

/**
 * Migrate a raw session from `fromVersion` up to CURRENT_SCHEMA_VERSION by
 * applying each step in turn. Returns the (now current-shaped) Session.
 */
export function migrateSession(
  rawSession: unknown,
  fromVersion: number,
): Session {
  let version = fromVersion;
  let data = rawSession;

  while (version < CURRENT_SCHEMA_VERSION) {
    const migrate = MIGRATIONS[version];
    if (!migrate) {
      throw new MigrationError(
        `Keine Migration von Schemaversion ${version} verfügbar.`,
      );
    }
    data = migrate(data);
    version += 1;
  }

  return data as Session;
}
