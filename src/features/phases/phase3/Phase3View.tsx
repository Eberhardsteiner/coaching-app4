import { Step1Orientierung } from "@/features/phases/phase3/Step1Orientierung";
import { Step2Intelligenzen } from "@/features/phases/phase3/Step2Intelligenzen";
import { Step3MotivePE } from "@/features/phases/phase3/Step3MotivePE";
import { Step4Werte } from "@/features/phases/phase3/Step4Werte";
import { Step5WerteAnderer } from "@/features/phases/phase3/Step5WerteAnderer";
import { Step6ModellRessourcen } from "@/features/phases/phase3/Step6ModellRessourcen";
import { Step7BiografieUmfeld } from "@/features/phases/phase3/Step7BiografieUmfeld";
import { Step8Koerpersignale } from "@/features/phases/phase3/Step8Koerpersignale";
import { Step9DontMuster } from "@/features/phases/phase3/Step9DontMuster";
import { Step10Abschluss } from "@/features/phases/phase3/Step10Abschluss";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";

/**
 * Phase 3 — Ressourcen erkennen (MP3, ten steps): 3.1 Orientierung
 * (Kompetenzmodell + Cockpit), 3.2 Intelligenzen, 3.3 Motive & PE (EPP),
 * 3.4 Werte (MVWK + drei Spalten), 3.5 Werte der Anderen (cluster-geführt),
 * 3.6 Ressourcen aus Modellen, 3.7 Biografie & Umfeld, 3.8 Körpersignale,
 * 3.9 Bisheriges Muster — Don't!, 3.10 Abschluss & Check (Cockpit).
 * Rating happens directly in each step (kein Sortier-Schritt mehr).
 * Completing 3.10 unlocks Phase 4.
 */
export function Phase3View({ nav }: { nav: PhaseNavigation }) {
  if (nav.stepIndex === 0) return <Step1Orientierung nav={nav} />;
  if (nav.stepIndex === 1) return <Step2Intelligenzen nav={nav} />;
  if (nav.stepIndex === 2) return <Step3MotivePE nav={nav} />;
  if (nav.stepIndex === 3) return <Step4Werte nav={nav} />;
  if (nav.stepIndex === 4) return <Step5WerteAnderer nav={nav} />;
  if (nav.stepIndex === 5) return <Step6ModellRessourcen nav={nav} />;
  if (nav.stepIndex === 6) return <Step7BiografieUmfeld nav={nav} />;
  if (nav.stepIndex === 7) return <Step8Koerpersignale nav={nav} />;
  if (nav.stepIndex === 8) return <Step9DontMuster nav={nav} />;
  return <Step10Abschluss nav={nav} />;
}
