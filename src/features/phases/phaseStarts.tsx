import type { ReactNode } from "react";

import { Phase1Motif } from "@/features/phases/motifs/Phase1Motif";
import { Phase2Motif } from "@/features/phases/motifs/Phase2Motif";
import type { PhaseAccent } from "@/features/phases/PhaseStart";
import type { PhaseId } from "@/features/session/types";

/** Content + artwork for a phase's editorial start screen. */
export interface PhaseStartContent {
  phaseNumber: 1 | 2 | 3 | 4 | 5;
  phaseName: string;
  eyebrow: string;
  heading: string;
  intro: string;
  accent: PhaseAccent;
  ctaLabel: string;
  motif: ReactNode;
}

/**
 * Registry of phase start screens. Only phases with an entry here show a start
 * screen on entry; phases without one go straight to their first work step.
 *
 * Phase 1 (accent "ist" — rosa, the IST convention) and Phase 2 (Horizont,
 * accent "accent") are in. Phases 3–5 follow by adding an entry with their own
 * motif and accent "accent": Ressourcen = Facetten, Handlungsplan = Pfad,
 * Nachhaltigkeit = Wurzeln/Kreislauf.
 */
const PHASE_STARTS: Partial<Record<PhaseId, PhaseStartContent>> = {
  1: {
    phaseNumber: 1,
    phaseName: "Ist-Situation",
    eyebrow: "Phase 1 · Ist-Situation",
    heading: "Verschaffe dir einen Überblick über deine Ist-Situation",
    intro:
      "Nun geht es los! Verstehe die Wechselwirkungen und Zusammenhänge deiner Situation. Am Ende der Phase 1 wirst du einen strukturierten und bewerteten Überblick über deinen systemischen Kontext erarbeitet haben. Damit du zu guten Ergebnissen kommst, orientiere dich konsequent an den Fragen und schreibe alles auf, was dir zu den Fragen einfällt.",
    accent: "ist",
    ctaLabel: "Los geht’s",
    motif: <Phase1Motif />,
  },
  2: {
    phaseNumber: 2,
    phaseName: "Ziel finden",
    eyebrow: "Phase 2 · Ziel",
    heading:
      "Entscheide dich für dein attraktives Ziel — und mache dir seine Folgen bewusst",
    intro:
      "Jede erfolgreiche Veränderung braucht eine ‚Hin-zu‘-Orientierung. Wie soll deine Situation in Zukunft aussehen? Bitte beachte: Auch jetzt geht es noch nicht um Lösungen, sondern um den Zustand, den du anstrebst — um dein ‚Wohin‘. Zum ‚Wie‘ kommst du in Phase 4, hab ein bisschen Geduld!",
    accent: "accent",
    ctaLabel: "Los geht’s",
    motif: <Phase2Motif />,
  },
};

/** The start-screen content for a phase, or undefined if it has none. */
export function getPhaseStart(phase: PhaseId): PhaseStartContent | undefined {
  return PHASE_STARTS[phase];
}
