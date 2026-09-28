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

/** Phase-3-Listen, deren Einträge eine Bewertung tragen können. */
const PHASE3_LISTS = [
  "motives",
  "values",
  "intelligences",
  "innerResources",
  "othersValues",
  "hypotheses",
  "experiential",
  "pastPatterns",
  "somaticMarkers",
  "personalityTraits",
] as const;

type RawRecord = Record<string, unknown>;

/**
 * E2: EINE Wertung („foerderlich“ | „hinderlich“) → zwei unabhängige Werte.
 * foerderlich → helpful, hinderlich → hindering. Idempotent: Einträge ohne
 * `polarity` bleiben unverändert.
 */
function splitPolarity(item: unknown): unknown {
  if (!item || typeof item !== "object") return item;
  const { polarity, ...rest } = item as RawRecord;
  if (polarity === "foerderlich") return { ...rest, helpful: true };
  if (polarity === "hinderlich") return { ...rest, hindering: true };
  return rest;
}

/** Migration chain, keyed by the version being upgraded FROM. */
const MIGRATIONS: Record<number, Migration> = {
  /** v1 → v2: introduce the navigation/progress field (start at phase 0). */
  1: (raw) => ({
    ...(raw as Record<string, unknown>),
    progress: { phase: 0, step: 0, completedPhases: [] },
  }),
  /**
   * v2 → v3 (E2): die Bewertung „förderlich ODER hinderlich“ wird zu zwei
   * unabhängigen Werten helpful / hindering, in allen Phase-3-Listen.
   */
  2: (raw) => {
    const session = raw as RawRecord;
    const phase3 = (session.phase3 ?? {}) as RawRecord;
    const next: RawRecord = { ...phase3 };
    for (const key of PHASE3_LISTS) {
      const list = phase3[key];
      if (Array.isArray(list)) next[key] = list.map(splitPolarity);
    }
    return { ...session, phase3: next };
  },
};

/*
 * Additive v2-Felder OHNE Versionssprung (P8c/P9/P13 — Regel 5):
 * - ResourceItem.categories (Werte: Mehrfach-Zuordnung Mensch/Funktion/Ziel;
 *   Fallback beim Lesen: `categories ?? (category ? [category] : [])`),
 * - ResourceItem.personRef (Werte anderer: Zuordnung zu einer Person =
 *   "wer"-Eintrag; alte Werte ohne personRef bleiben cluster-weit gültig),
 * - Measure.basedOnResources (mehrere Ressourcen je Maßnahme; Fallback:
 *   `basedOnResources ?? (basedOnResource ? [basedOnResource] : [])`).
 * Alte Sitzungen laden unverändert — die UI, der Export (ganze Session) und
 * die Zusammenfassung lesen beide Formen defensiv.
 */

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
