import type { Phase3, ResourceItem } from "@/features/session/types";

/**
 * Phase-3 fields that hold the user's *own* resources as ResourceItem[].
 * Step 3.1 routes a taken model term into one of these by model id.
 */
export type OwnResourceField =
  | "motives"
  | "values"
  | "intelligences"
  | "innerResources";

/** German labels for the own-resource fields (used in the collected list). */
export const OWN_RESOURCE_LABEL: Record<OwnResourceField, string> = {
  motives: "Motive",
  values: "Werte",
  intelligences: "Intelligenzarten / Stärken",
  innerResources: "Innere Ressourcen",
};

export const OWN_RESOURCE_FIELDS: OwnResourceField[] = [
  "motives",
  "values",
  "intelligences",
  "innerResources",
];

/**
 * Map a resource model to the Phase-3 field its terms are collected into.
 * Simple, consistent mapping:
 *   werteliste      → values
 *   intelligenzarten→ intelligences
 *   motive          → motives
 *   everything else → innerResources (fallback)
 */
export function fieldForModel(modelId: string): OwnResourceField {
  if (modelId === "werteliste") return "values";
  if (modelId === "intelligenzarten") return "intelligences";
  if (modelId === "motive") return "motives";
  return "innerResources";
}

/** Type guard: is this Phase-3 key an own-resource list? */
export function isOwnResourceField(key: keyof Phase3): key is OwnResourceField {
  return (
    key === "motives" ||
    key === "values" ||
    key === "intelligences" ||
    key === "innerResources"
  );
}

/**
 * All Phase-3 fields holding the user's *own* resources that take part in the
 * sorting step (3.6). The context field `othersValues` is intentionally NOT
 * included — sorting förderlich/hinderlich only applies to one's own resources.
 */
export type SortableResourceField =
  | OwnResourceField
  | "experiential"
  | "pastPatterns"
  | "somaticMarkers"
  | "hypotheses";

export const SORTABLE_RESOURCE_FIELDS: SortableResourceField[] = [
  "motives",
  "values",
  "intelligences",
  "innerResources",
  "experiential",
  "pastPatterns",
  "somaticMarkers",
  "hypotheses",
];

export const SORTABLE_RESOURCE_LABEL: Record<SortableResourceField, string> = {
  ...OWN_RESOURCE_LABEL,
  experiential: "Erfahrungen & äußere Ressourcen",
  pastPatterns: "Bisheriges Verhalten",
  somaticMarkers: "Körpersignale",
  hypotheses: "Hypothesen & Impulse",
};

/** Flatten every sortable resource, tagged with its source field. */
export function collectSortableResources(
  phase3: Phase3,
): { field: SortableResourceField; item: ResourceItem }[] {
  return SORTABLE_RESOURCE_FIELDS.flatMap((field) =>
    phase3[field].map((item) => ({ field, item })),
  );
}

/** Counts of förderlich / hinderlich / still-open across the sortable fields. */
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
