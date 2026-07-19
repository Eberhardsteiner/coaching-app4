import { CockpitButton } from "@/features/phases/phase3/CockpitButton";
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
  const step =
    nav.stepIndex === 0 ? (
      <Step1Orientierung nav={nav} />
    ) : nav.stepIndex === 1 ? (
      <Step2Intelligenzen nav={nav} />
    ) : nav.stepIndex === 2 ? (
      <Step3MotivePE nav={nav} />
    ) : nav.stepIndex === 3 ? (
      <Step4Werte nav={nav} />
    ) : nav.stepIndex === 4 ? (
      <Step5WerteAnderer nav={nav} />
    ) : nav.stepIndex === 5 ? (
      <Step6ModellRessourcen nav={nav} />
    ) : nav.stepIndex === 6 ? (
      <Step7BiografieUmfeld nav={nav} />
    ) : nav.stepIndex === 7 ? (
      <Step8Koerpersignale nav={nav} />
    ) : nav.stepIndex === 8 ? (
      <Step9DontMuster nav={nav} />
    ) : (
      <Step10Abschluss nav={nav} />
    );

  // K2: fester Cockpit-Zugriff mit Füllstand — an konsistenter Stelle über
  // JEDEM Schritt der Phase 3 (zusätzlich zum Werkzeuge-Eintrag).
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <CockpitButton />
      </div>
      {step}
    </div>
  );
}
