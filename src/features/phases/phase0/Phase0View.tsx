import { Step01Vereinbarung } from "@/features/phases/phase0/Step01Vereinbarung";
import { Step04Thema } from "@/features/phases/phase0/Step04Thema";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";

/** Phase 0 — Vereinbarung. Renders the current of its two steps. */
export function Phase0View({ nav }: { nav: PhaseNavigation }) {
  switch (nav.stepIndex) {
    case 0:
      return <Step01Vereinbarung nav={nav} />;
    case 1:
      return <Step04Thema nav={nav} />;
    default:
      return null;
  }
}
