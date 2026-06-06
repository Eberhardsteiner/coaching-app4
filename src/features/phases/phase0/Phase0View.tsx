import { Step01Ankommen } from "@/features/phases/phase0/Step01Ankommen";
import { Step02Werte } from "@/features/phases/phase0/Step02Werte";
import { Step03Steuerung } from "@/features/phases/phase0/Step03Steuerung";
import { Step04Eignung } from "@/features/phases/phase0/Step04Eignung";
import { Step05Thema } from "@/features/phases/phase0/Step05Thema";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";

/** Phase 0 — Vereinbarung. Renders the current of its five steps. */
export function Phase0View({ nav }: { nav: PhaseNavigation }) {
  switch (nav.stepIndex) {
    case 0:
      return <Step01Ankommen nav={nav} />;
    case 1:
      return <Step02Werte nav={nav} />;
    case 2:
      return <Step03Steuerung nav={nav} />;
    case 3:
      return <Step04Eignung nav={nav} />;
    case 4:
      return <Step05Thema nav={nav} />;
    default:
      return null;
  }
}
