import type { Phase2 } from "@/features/session/types";

/** Standard-Satzanfang, solange keine eigene Ergänzung eingetragen ist. */
export const DEFAULT_SATZANFANG = "Ab dem";

/** ISO-Datum (yyyy-mm-dd) als deutsches Datum, ohne Zeitzonen-Verschiebung. */
export function formatGermanDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}.${m}.${y}` : iso;
}

/** Ersten Buchstaben groß schreiben (Satzanfang). */
function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

/**
 * D4: den Zielsatz aus seinen Bausteinen zusammensetzen:
 * Satzanfang + Datum, „werde ich als“ + Rolle, Gefühl, „in Bezug auf“ +
 * freier Bezug, „erreicht haben“. Die Clusterüberschrift wird NICHT mehr
 * automatisch eingesetzt. Fehlende Bausteine erscheinen als „…“. Ist noch gar
 * nichts ausgefüllt, gibt es noch keinen Satz ("").
 */
export function assembleGoalText(parts: {
  satzanfang?: string;
  datum?: string;
  rolle?: string;
  gefuehl?: string;
  bezug?: string;
}): string {
  const rolle = (parts.rolle ?? "").trim();
  const gefuehl = (parts.gefuehl ?? "").trim();
  const bezug = (parts.bezug ?? "").trim();
  const datum = parts.datum ?? "";
  if (!rolle && !gefuehl && !bezug && !datum) return "";
  const anfang = capitalize(
    (parts.satzanfang ?? "").trim() || DEFAULT_SATZANFANG,
  );
  const datePart = datum ? formatGermanDate(datum) : "…";
  const rollePart = rolle ? `als ${rolle} ` : "";
  return `${anfang} ${datePart} werde ich ${rollePart}${gefuehl || "…"} in Bezug auf ${bezug || "…"} erreicht haben.`;
}

/**
 * Bausteine einer Phase 2 ändern und den Zielsatz neu zusammensetzen, solange
 * er nicht von Hand bearbeitet wurde (goalTextManuell).
 */
export function withBausteine(
  phase2: Phase2,
  partial: Partial<
    Pick<Phase2, "satzanfang" | "datum" | "rolle" | "gefuehl" | "bezug">
  >,
): Phase2 {
  const merged: Phase2 = { ...phase2, ...partial };
  if (merged.goalTextManuell) return merged;
  return { ...merged, goalText: assembleGoalText(merged) };
}
