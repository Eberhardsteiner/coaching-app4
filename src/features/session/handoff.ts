/**
 * Coach → coachee handoff cleaning. Produces a copy of the session with all
 * coach-private content removed, so the coachee can continue from the shared
 * state in the calm, console-free (self) view. Schema-valid, no orphan refs.
 */

import { normalizeClusters } from "@/features/cards/clusters";
import { stageVisibleCards } from "@/features/cards/visibility";
import type { Session } from "@/features/session/types";

/**
 * A cleaned copy for the coachee:
 *  - drop coach_only cards (keep shared; missing visibility = shared),
 *  - keep only clusters that still hold ≥1 surviving card and re-derive their
 *    `cardIds` + `isCore` (no orphan references; stays schema-valid),
 *  - drop `coachNotes`,
 *  - set `meta.branch = "self"` (opens in the console-free work view).
 * Everything else (phases 0, 2–5, progress, the rest of meta) is unchanged —
 * including `notebook` (the Erkenntnisboard): that is coachee content and
 * deliberately travels in the handoff, unlike coachNotes.
 */
export function cleanSessionForHandoff(session: Session): Session {
  const cards = stageVisibleCards(session.phase1.cards);
  const keptClusters = session.phase1.clusters.filter((cluster) =>
    cards.some((card) => card.clusterId === cluster.id),
  );
  const clusters = normalizeClusters(cards, keptClusters);

  return {
    ...session,
    meta: { ...session.meta, branch: "self" },
    coachNotes: undefined,
    phase1: { ...session.phase1, cards, clusters },
  };
}
