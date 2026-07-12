import { Step1Vision } from "@/features/phases/phase2/Step1Vision";
import { Step2Zielformel } from "@/features/phases/phase2/Step2Zielformel";
import { Step3Zielpruefung } from "@/features/phases/phase2/Step3Zielpruefung";
import { Step4Zielfolgen } from "@/features/phases/phase2/Step4Zielfolgen";
import { Step5Abschluss } from "@/features/phases/phase2/Step5Abschluss";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";

/**
 * Phase 2 — Ziel finden (SOLL), following the method's 2a → 2b → 2c arc.
 * Five steps: 2.1 Was strebe ich an? (brainstorming + feeling choice), 2.2
 * Mein Zielsatz (mantra builder, Futur II), 2.3 Zielprüfung (six quality
 * criteria + 10/10 stopper), 2.4 Folgen meines Ziels (guided cluster pass),
 * 2.5 Abschluss & Check. Completing 2.5 unlocks Phase 3.
 */
export function Phase2View({ nav }: { nav: PhaseNavigation }) {
  if (nav.stepIndex === 0) return <Step1Vision nav={nav} />;
  if (nav.stepIndex === 1) return <Step2Zielformel nav={nav} />;
  if (nav.stepIndex === 2) return <Step3Zielpruefung nav={nav} />;
  if (nav.stepIndex === 3) return <Step4Zielfolgen nav={nav} />;
  return <Step5Abschluss nav={nav} />;
}
