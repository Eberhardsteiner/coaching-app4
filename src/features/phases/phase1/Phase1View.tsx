import { Step1Gefuehl } from "@/features/phases/phase1/Step1Gefuehl";
import { Step2Zusammenhaenge } from "@/features/phases/phase1/Step2Zusammenhaenge";
import { Step3Perspektive } from "@/features/phases/phase1/Step3Perspektive";
import { Step4Clustern } from "@/features/phases/phase1/Step4Clustern";
import { Step5Abschluss } from "@/features/phases/phase1/Step5Abschluss";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";

/**
 * Phase 1 — IST verstehen. All five steps are built: 1.1 Gefühl benennen,
 * 1.2 Zusammenhänge sammeln, 1.3 Perspektive wechseln, 1.4 Clustern & gewichten,
 * 1.5 Abschluss & Check. Completing 1.5 finishes Phase 1 and unlocks Phase 2.
 */
export function Phase1View({ nav }: { nav: PhaseNavigation }) {
  if (nav.stepIndex === 0) return <Step1Gefuehl nav={nav} />;
  if (nav.stepIndex === 1) return <Step2Zusammenhaenge nav={nav} />;
  if (nav.stepIndex === 2) return <Step3Perspektive nav={nav} />;
  if (nav.stepIndex === 3) return <Step4Clustern nav={nav} />;
  return <Step5Abschluss nav={nav} />;
}
