import { Step01Ankommen } from "@/features/phases/phase0/Step01Ankommen";
import { Step02Werte } from "@/features/phases/phase0/Step02Werte";
import { Step03Steuerung } from "@/features/phases/phase0/Step03Steuerung";
import { Step04Thema } from "@/features/phases/phase0/Step04Thema";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";

/** Phase 0 — Vereinbarung. Renders the current of its four steps. */
export function Phase0View({ nav }: { nav: PhaseNavigation }) {
  switch (nav.stepIndex) {
    case 0:
      return <Step01Ankommen nav={nav} />;
    case 1:
      return <Step02Werte nav={nav} />;
    case 2:
      return <Step03Steuerung nav={nav} />;
    case 3:
      return <Step04Thema nav={nav} />;
    default:
      return null;
  }
}
