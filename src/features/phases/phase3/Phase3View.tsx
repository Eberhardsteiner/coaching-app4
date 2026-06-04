import { Step1EigeneRessourcen } from "@/features/phases/phase3/Step1EigeneRessourcen";
import { Step2WerteBeteiligte } from "@/features/phases/phase3/Step2WerteBeteiligte";
import { Step3Hypothesen } from "@/features/phases/phase3/Step3Hypothesen";
import { StepPlaceholder } from "@/features/phases/StepPlaceholder";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";

/**
 * Phase 3 — Ressourcen erkennen. Seven steps; in this prompt steps 3.1–3.3 are
 * built (Eigene Ressourcen, Werte der Beteiligten, Hypothesen & Impulse), steps
 * 3.4–3.7 are placeholders, so Phase 3 cannot be completed yet (Phase 4 locked).
 */
export function Phase3View({ nav }: { nav: PhaseNavigation }) {
  if (nav.stepIndex === 0) return <Step1EigeneRessourcen nav={nav} />;
  if (nav.stepIndex === 1) return <Step2WerteBeteiligte nav={nav} />;
  if (nav.stepIndex === 2) return <Step3Hypothesen nav={nav} />;
  return <StepPlaceholder nav={nav} />;
}
