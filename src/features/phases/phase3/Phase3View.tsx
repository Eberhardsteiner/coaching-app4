import { Step1EigeneRessourcen } from "@/features/phases/phase3/Step1EigeneRessourcen";
import { Step2WerteBeteiligte } from "@/features/phases/phase3/Step2WerteBeteiligte";
import { Step3Hypothesen } from "@/features/phases/phase3/Step3Hypothesen";
import { Step4ErfahrungenMuster } from "@/features/phases/phase3/Step4ErfahrungenMuster";
import { Step5Koerpersignale } from "@/features/phases/phase3/Step5Koerpersignale";
import { Step6Sortieren } from "@/features/phases/phase3/Step6Sortieren";
import { Step7Abschluss } from "@/features/phases/phase3/Step7Abschluss";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";

/**
 * Phase 3 — Ressourcen erkennen. All seven steps are built: 3.1 Eigene
 * Ressourcen, 3.2 Werte der Beteiligten, 3.3 Hypothesen & Impulse, 3.4
 * Erfahrungen & Muster, 3.5 Körpersignale, 3.6 Sortieren, 3.7 Abschluss & Check.
 * Completing 3.7 unlocks Phase 4.
 */
export function Phase3View({ nav }: { nav: PhaseNavigation }) {
  if (nav.stepIndex === 0) return <Step1EigeneRessourcen nav={nav} />;
  if (nav.stepIndex === 1) return <Step2WerteBeteiligte nav={nav} />;
  if (nav.stepIndex === 2) return <Step3Hypothesen nav={nav} />;
  if (nav.stepIndex === 3) return <Step4ErfahrungenMuster nav={nav} />;
  if (nav.stepIndex === 4) return <Step5Koerpersignale nav={nav} />;
  if (nav.stepIndex === 5) return <Step6Sortieren nav={nav} />;
  return <Step7Abschluss nav={nav} />;
}
