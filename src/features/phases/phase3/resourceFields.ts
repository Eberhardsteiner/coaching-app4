import type { Phase3 } from "@/features/session/types";

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
