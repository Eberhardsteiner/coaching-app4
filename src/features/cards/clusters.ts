/**
 * Cluster helpers for the moderation board. Single source of truth:
 * `card.clusterId` defines membership; `Cluster.cardIds` and `Cluster.isCore`
 * are *derived* from it (and from the weights) via {@link normalizeClusters}.
 */

import { CARD_COLORS } from "@/features/cards/cardColors";
import type { Card, Cluster } from "@/features/session/types";

/** A situation rarely needs more than a handful of clusters. */
export const MAX_CLUSTERS = 5;

/** Special drop-zone / select id for cards that belong to no cluster. */
export const UNASSIGNED = "unassigned";

/**
 * Recompute the derived cluster fields from the cards:
 *  - `cardIds` = the cards whose `clusterId` points at this cluster,
 *  - `isCore`  = true on exactly the single highest-weight cluster
 *                (ties resolve to the first — see {@link hasWeightTie}).
 * Pure: returns a new array; never mutates its inputs.
 */
export function normalizeClusters(
  cards: Card[],
  clusters: Cluster[],
): Cluster[] {
  let coreIndex = -1;
  let maxWeight = -Infinity;
  clusters.forEach((cluster, index) => {
    const weight = cluster.weight ?? -Infinity;
    if (weight > maxWeight) {
      maxWeight = weight;
      coreIndex = index;
    }
  });

  return clusters.map((cluster, index) => ({
    ...cluster,
    cardIds: cards
      .filter((card) => card.clusterId === cluster.id)
      .map((card) => card.id),
    isCore: index === coreIndex,
  }));
}

/**
 * True when two or more clusters share the top weight — then the core theme is
 * ambiguous and we gently ask the user to differentiate the weights.
 */
export function hasWeightTie(clusters: Cluster[]): boolean {
  const weights = clusters
    .map((cluster) => cluster.weight)
    .filter((weight): weight is number => weight != null);
  if (weights.length < 2) return false;
  const maxWeight = Math.max(...weights);
  return weights.filter((weight) => weight === maxWeight).length > 1;
}

/**
 * Pick a colour for a new cluster: the first not-yet-used non-neutral palette
 * colour, falling back to a simple rotation once all are taken.
 */
export function pickNextClusterColor(clusters: Cluster[]): string {
  const used = new Set(clusters.map((cluster) => cluster.color));
  const free = CARD_COLORS.find(
    (color) => color.id !== "neutral" && !used.has(color.id),
  );
  // All distinct colours taken (only possible at the 5th cluster) → neutral.
  return free?.id ?? CARD_COLORS[0].id;
}
