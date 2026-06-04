import { Step1Vision } from "@/features/phases/phase2/Step1Vision";
import { Step2Zielformel } from "@/features/phases/phase2/Step2Zielformel";
import { Step3Zielpruefung } from "@/features/phases/phase2/Step3Zielpruefung";
import { Step4Zielfolgen } from "@/features/phases/phase2/Step4Zielfolgen";
import { Step5Abschluss } from "@/features/phases/phase2/Step5Abschluss";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";

/**
 * Phase 2 — Ziel finden (SOLL). Five steps: 2.1 Wunsch & Vision, 2.2 Zielformel
 * (Futur II), 2.3 Zielprüfung (component checklist + 10/10 stopper), 2.4
 * Zielfolgen, 2.5 Abschluss & Check. Completing 2.5 unlocks Phase 3.
 */
export function Phase2View({ nav }: { nav: PhaseNavigation }) {
  if (nav.stepIndex === 0) return <Step1Vision nav={nav} />;
  if (nav.stepIndex === 1) return <Step2Zielformel nav={nav} />;
  if (nav.stepIndex === 2) return <Step3Zielpruefung nav={nav} />;
  if (nav.stepIndex === 3) return <Step4Zielfolgen nav={nav} />;
  return <Step5Abschluss nav={nav} />;
}
