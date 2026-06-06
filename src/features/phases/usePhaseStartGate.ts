import { useCallback, useEffect, useState } from "react";

import { getKvFlag, setKvFlag } from "@/features/session/sessionRepository";
import type { PhaseId } from "@/features/session/types";

/** kv key for "the start screen of phase N has been dismissed". */
export function phaseStartSeenKey(phase: PhaseId): string {
  return `phaseStartSeen:${phase}`;
}

export interface PhaseStartGate {
  /** null while the kv flag is being read; then true (seen) / false (show it). */
  seen: boolean | null;
  /** Persist "seen" + flip locally — call it when the user clicks "Los geht's". */
  markSeen: () => void;
}

/**
 * Per-phase "start screen seen" gate, persisted via a kv flag.
 *
 * The flag is the single source of truth for "this phase's opening screen has
 * been dismissed", so the screen shows exactly once per phase: on entry the gate
 * reads false → PhaseContainer renders the start screen; "Los geht's" sets the
 * flag → the work steps render, and stepping back to step 0 no longer
 * re-triggers it (no loop). A reload before dismissing shows it again (the flag
 * is still false), which is intended. `active` keeps the gate inert (seen = true,
 * no kv read) for phases/steps that never show a start screen.
 *
 * The read result is tagged with its phase so a stale result from a previous
 * phase never leaks through, and so state is only ever set from the async
 * callback (never synchronously in the effect body).
 */
export function usePhaseStartGate(
  phase: PhaseId,
  active: boolean,
): PhaseStartGate {
  const [read, setRead] = useState<{ phase: PhaseId; seen: boolean } | null>(
    null,
  );

  useEffect(() => {
    if (!active) return;
    let alive = true;
    void getKvFlag(phaseStartSeenKey(phase)).then((value) => {
      if (alive) setRead({ phase, seen: value });
    });
    return () => {
      alive = false;
    };
  }, [phase, active]);

  const markSeen = useCallback(() => {
    setRead({ phase, seen: true });
    void setKvFlag(phaseStartSeenKey(phase), true);
  }, [phase]);

  // Inactive → inert (true). Active → the read for *this* phase, else null (loading).
  const seen = !active
    ? true
    : read !== null && read.phase === phase
      ? read.seen
      : null;

  return { seen, markSeen };
}
