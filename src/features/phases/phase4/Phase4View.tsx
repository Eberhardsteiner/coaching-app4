import { Step1Massnahmen } from "@/features/phases/phase4/Step1Massnahmen";
import { Step2Hindernisse } from "@/features/phases/phase4/Step2Hindernisse";
import { Step3Abschluss } from "@/features/phases/phase4/Step3Abschluss";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";

/**
 * Phase 4 — Handlungsplan. Three steps: 4.1 Maßnahmen (Ich-Sätze from förderliche
 * resources per cluster), 4.2 Mögliche Hindernisse (pre-mortem), 4.3 Abschluss &
 * Check. Completing 4.3 unlocks Phase 5.
 */
export function Phase4View({ nav }: { nav: PhaseNavigation }) {
  if (nav.stepIndex === 0) return <Step1Massnahmen nav={nav} />;
  if (nav.stepIndex === 1) return <Step2Hindernisse nav={nav} />;
  return <Step3Abschluss nav={nav} />;
}
