import { Step1Massnahmen } from "@/features/phases/phase4/Step1Massnahmen";
import { Step2Qualitaet } from "@/features/phases/phase4/Step2Qualitaet";
import { Step3Plan } from "@/features/phases/phase4/Step3Plan";
import { Step4Abschluss } from "@/features/phases/phase4/Step4Abschluss";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";

/**
 * Phase 4 — Handlungsplan (MP4, four steps): 4.1 Maßnahmen je Cluster
 * (geführter Durchgang mit Wirkindikator aus Phase 2), 4.2 Qualitätsprüfung
 * (vier Kriterien je Maßnahme), 4.3 Maßnahmenplan (Tabelle mit Terminen und
 * Plan B), 4.4 Abschluss & Check. Completing 4.4 unlocks Phase 5.
 */
export function Phase4View({ nav }: { nav: PhaseNavigation }) {
  if (nav.stepIndex === 0) return <Step1Massnahmen nav={nav} />;
  if (nav.stepIndex === 1) return <Step2Qualitaet nav={nav} />;
  if (nav.stepIndex === 2) return <Step3Plan nav={nav} />;
  return <Step4Abschluss nav={nav} />;
}
