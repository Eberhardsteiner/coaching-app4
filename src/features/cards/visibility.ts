import type { Card, Cluster, Visibility } from "@/features/session/types";

/**
 * Stage visibility helpers. In the self branch visibility is meaningless (every
 * element belongs to the person). In the coached branch a card may be
 * `coach_only` — the coach's private thinking surface — and is then hidden from
 * the shared (coachee-facing) stage view. A missing `visibility` counts as
 * `shared` (default-safe — no schema bump). These helpers are the single way to
 * derive the shared stage view (reused by the stage preview here and the
 * presenter in P3).
 */

/** Effective visibility of a card; missing = shared. */
export function effectiveVisibility(card: Card): Visibility {
  return card.visibility ?? "shared";
}

/** True when the card is shown on the shared stage. */
export function isShared(card: Card): boolean {
  return effectiveVisibility(card) === "shared";
}

/** The opposite visibility (for a toggle). */
export function toggleVisibility(visibility: Visibility): Visibility {
  return visibility === "coach_only" ? "shared" : "coach_only";
}

/** The shared (stage) view: only shared cards. */
export function stageVisibleCards(cards: Card[]): Card[] {
  return cards.filter(isShared);
}

/**
 * Clusters paired with their stage-visible cards. Clusters are kept even when
 * they have no visible card (callers can treat empty ones gently).
 */
export function stageVisibleClusters(
  clusters: Cluster[],
  cards: Card[],
): { cluster: Cluster; cards: Card[] }[] {
  const shared = stageVisibleCards(cards);
  return clusters.map((cluster) => ({
    cluster,
    cards: shared.filter((card) => card.clusterId === cluster.id),
  }));
}
