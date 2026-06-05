import { Step1Dranbleiben } from "@/features/phases/phase5/Step1Dranbleiben";
import { Step2Erkenntnisse } from "@/features/phases/phase5/Step2Erkenntnisse";
import { Step3Abschluss } from "@/features/phases/phase5/Step3Abschluss";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";

/**
 * Phase 5 — Nachhaltigkeit. Three steps: 5.1 Dranbleiben (strategies), 5.2
 * Erkenntnisse, 5.3 Abschluss & Check. The final step calls `onComplete`
 * (owned by PhaseContainer) instead of advancing — completing it finishes the
 * whole 5+1 process and shows the session-complete view.
 */
export function Phase5View({
  nav,
  onComplete,
}: {
  nav: PhaseNavigation;
  onComplete: () => void;
}) {
  if (nav.stepIndex === 0) return <Step1Dranbleiben nav={nav} />;
  if (nav.stepIndex === 1) return <Step2Erkenntnisse nav={nav} />;
  return <Step3Abschluss nav={nav} onComplete={onComplete} />;
}
