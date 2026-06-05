/**
 * Session export — wrap a Session in a versioned envelope and download it as a
 * JSON file. No backend; the file stays on the user's device.
 */

import { cleanSessionForHandoff } from "@/features/session/handoff";
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

/** File name for the cleaned coachee handoff (…-uebergabe.json). */
export function handoffFileName(session: Session): string {
  const date = new Date().toISOString().slice(0, 10);
  const shortId = session.meta.id.slice(0, 8);
  return `coaching-session_${date}_${shortId}-uebergabe.json`;
}

/** Serialise `data` as pretty JSON and trigger a browser download. */
function downloadJson(data: unknown, fileName: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

/** Full coach backup: download the complete session (incl. coach_only/coachNotes). */
export function downloadSession(session: Session): void {
  downloadJson(buildExportEnvelope(session), exportFileName(session));
}

/**
 * Cleaned coachee handoff: download a copy with coach_only cards + coachNotes
 * removed and branch set to "self" (see cleanSessionForHandoff). Same envelope
 * format, fresh exportedAt, distinct filename.
 */
export function downloadHandoff(session: Session): void {
  const cleaned = cleanSessionForHandoff(session);
  downloadJson(buildExportEnvelope(cleaned), handoffFileName(session));
}
