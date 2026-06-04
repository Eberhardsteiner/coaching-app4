/**
 * Session import — read a JSON export file, validate the envelope, migrate if
 * needed and return a current-schema Session. All failures surface as a
 * SessionImportError carrying a user-friendly German message.
 */

import { CURRENT_SCHEMA_VERSION, type Session } from "@/features/session/types";
import { EXPORT_FORMAT } from "@/features/session/exportSession";
import { migrateSession } from "@/features/session/migrations";

/** A user-facing import failure (its message is safe to show in the UI). */
export class SessionImportError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Minimal structural check of the required session fields (not exhaustive). */
function looksLikeSession(value: unknown): value is Session {
  if (!isRecord(value)) return false;
  const meta = value.meta;
  if (!isRecord(meta)) return false;
  if (typeof meta.id !== "string") return false;
  if (meta.branch !== "coached" && meta.branch !== "self") return false;
  const phases = [
    "phase0",
    "phase1",
    "phase2",
    "phase3",
    "phase4",
    "phase5",
  ] as const;
  return phases.every((phase) => isRecord(value[phase]));
}

/**
 * Parse + validate + migrate a session export file.
 * @throws {SessionImportError} on any invalid/too-new/incomplete input.
 */
export async function importSessionFromFile(file: File): Promise<Session> {
  let text: string;
  try {
    text = await file.text();
  } catch {
    throw new SessionImportError("Die Datei konnte nicht gelesen werden.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new SessionImportError("Die Datei ist keine gültige JSON-Datei.");
  }

  if (!isRecord(parsed)) {
    throw new SessionImportError("Unerwartetes Dateiformat.");
  }

  if (parsed.format !== EXPORT_FORMAT) {
    throw new SessionImportError(
      "Diese Datei ist keine Coaching-Sitzung in diesem Format.",
    );
  }

  const schemaVersion = parsed.schemaVersion;
  if (typeof schemaVersion !== "number" || !Number.isFinite(schemaVersion)) {
    throw new SessionImportError("Die Schemaversion fehlt oder ist ungültig.");
  }

  if (schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new SessionImportError(
      "Diese Datei wurde mit einer neueren App-Version erstellt. Bitte aktualisiere die Anwendung.",
    );
  }

  if (!isRecord(parsed.session)) {
    throw new SessionImportError("Die Sitzungsdaten fehlen in der Datei.");
  }

  let migrated: Session;
  try {
    migrated = migrateSession(parsed.session, schemaVersion);
  } catch {
    throw new SessionImportError(
      "Die Sitzung konnte nicht auf die aktuelle Version aktualisiert werden.",
    );
  }

  if (!looksLikeSession(migrated)) {
    throw new SessionImportError("Die Sitzungsdaten sind unvollständig.");
  }

  // Stamp the current schema version after a successful migration.
  return {
    ...migrated,
    meta: { ...migrated.meta, schemaVersion: CURRENT_SCHEMA_VERSION },
  };
}
