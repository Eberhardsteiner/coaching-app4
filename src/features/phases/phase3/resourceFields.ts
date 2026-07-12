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

/** Counts of förderlich / hinderlich / still-open across the own resources. */
export function countPolarities(phase3: Phase3): {
  foerderlich: number;
  hinderlich: number;
  offen: number;
  total: number;
} {
  const items = collectSortableResources(phase3).map((entry) => entry.item);
  return {
    foerderlich: items.filter((i) => i.polarity === "foerderlich").length,
    hinderlich: items.filter((i) => i.polarity === "hinderlich").length,
    offen: items.filter((i) => !i.polarity).length,
    total: items.length,
  };
}
