import type { Phase3, ResourceItem } from "@/features/session/types";

/**
 * All Phase-3 fields holding the user's *own* resources — the basis for the
 * Cockpit counters, the summary and the Phase-4/5 resource pickers. The
 * context field `othersValues` is intentionally NOT included: förderlich/
 * hinderlich only applies to one's own resources. `personalityTraits` is
 * additive-optional (MP3), so collection reads every field defensively.
 */
export type SortableResourceField =
  | "motives"
  | "values"
  | "intelligences"
  | "innerResources"
  | "personalityTraits"
  | "experiential"
  | "pastPatterns"
  | "somaticMarkers"
  | "hypotheses";

export const SORTABLE_RESOURCE_FIELDS: SortableResourceField[] = [
  "intelligences",
  "motives",
  "personalityTraits",
  "values",
  "innerResources",
  "hypotheses",
  "experiential",
  "pastPatterns",
  "somaticMarkers",
];

export const SORTABLE_RESOURCE_LABEL: Record<SortableResourceField, string> = {
  intelligences: "Intelligenzen",
  motives: "Motive",
  personalityTraits: "Persönlichkeitseigenschaften",
  values: "Werte",
  innerResources: "Innere Ressourcen",
  hypotheses: "Ressourcen aus Modellen",
  experiential: "Biografie & Umfeld",
  pastPatterns: "Bisheriges Verhalten",
  somaticMarkers: "Körpersignale",
};

/** Flatten every own resource, tagged with its source field (defensive). */
export function collectSortableResources(
  phase3: Phase3,
): { field: SortableResourceField; item: ResourceItem }[] {
  return SORTABLE_RESOURCE_FIELDS.flatMap((field) =>
    (phase3[field] ?? []).map((item) => ({ field, item })),
  );
}

/**
 * E2: die Bewertung einer Ressource — hilfreich und hinderlich sind
 * UNABHÄNGIG (beides, eins oder keins). Rückfall auf die Altform `polarity`,
 * falls ein Eintrag noch nicht umgewandelt wurde (z. B. read-only-Pfade).
 */
export function ratingOf(item: ResourceItem): {
  helpful: boolean;
  hindering: boolean;
} {
  if (item.helpful !== undefined || item.hindering !== undefined) {
    return {
      helpful: item.helpful === true,
      hindering: item.hindering === true,
    };
  }
  return {
    helpful: item.polarity === "foerderlich",
    hindering: item.polarity === "hinderlich",
  };
}

export const isHelpful = (item: ResourceItem): boolean =>
  ratingOf(item).helpful;
export const isHindering = (item: ResourceItem): boolean =>
  ratingOf(item).hindering;

/**
 * E4: Körpersignale haben keine Bewertung mehr. Alte Werte bleiben in den
 * Daten, zählen aber nirgends mehr als hilfreich oder hinderlich.
 */
export const isRatedField = (field: SortableResourceField): boolean =>
  field !== "somaticMarkers";

/**
 * Einträge ohne Bewertungsschalter: Ableitungen (3.7, dritter Anker) sind
 * Erkenntnisse, Körpersignale (3.8, E4) Signalgeber — beide zählen nie als
 * „noch offen“.
 */
function isUnratable(field: SortableResourceField, item: ResourceItem) {
  return field === "somaticMarkers" || item.category === "ableitung";
}

/**
 * Zähler hilfreich / hinderlich / noch offen über die eigenen Ressourcen.
 * Eine Ressource, die beides ist, zählt in beiden Spalten.
 */
export function countPolarities(phase3: Phase3): {
  foerderlich: number;
  hinderlich: number;
  offen: number;
  total: number;
} {
  const all = collectSortableResources(phase3);
  const entries = all.filter((e) => isRatedField(e.field));
  return {
    foerderlich: entries.filter((e) => isHelpful(e.item)).length,
    hinderlich: entries.filter((e) => isHindering(e.item)).length,
    offen: entries.filter((e) => {
      if (isUnratable(e.field, e.item)) return false;
      const r = ratingOf(e.item);
      return !r.helpful && !r.hindering;
    }).length,
    total: all.length,
  };
}
