/**
 * Session export — wrap a Session in a versioned envelope and download it as a
 * JSON file. No backend; the file stays on the user's device.
 */

import { CURRENT_SCHEMA_VERSION, type Session } from "@/features/session/types";

/** File format identifier embedded in every export. */
export const EXPORT_FORMAT = "nhs-coaching-session";

/** Neutral privacy line that travels with the file (no brand/person names). */
export const EXPORT_PRIVACY_NOTE =
  "Die Datei enthält deine Eingaben und bleibt bei dir.";

/** The on-disk shape of an exported session. */
export interface SessionExportEnvelope {
  format: typeof EXPORT_FORMAT;
  schemaVersion: number;
  exportedAt: string; // ISO
  appVersion: string;
  privacyNote: string;
  session: Session;
}

/** Build the export envelope for a session. */
export function buildExportEnvelope(session: Session): SessionExportEnvelope {
  return {
    format: EXPORT_FORMAT,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: __APP_VERSION__,
    privacyNote: EXPORT_PRIVACY_NOTE,
    session,
  };
}

/** File name convention: coaching-session_<YYYY-MM-DD>_<id-kurz>.json */
export function exportFileName(session: Session): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const shortId = session.meta.id.slice(0, 8);
  return `coaching-session_${date}_${shortId}.json`;
}

/** Serialise + trigger a browser download of the session as a JSON file. */
export function downloadSession(session: Session): void {
  const envelope = buildExportEnvelope(session);
  const json = JSON.stringify(envelope, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = exportFileName(session);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}
