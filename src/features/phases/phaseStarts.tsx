import type { ReactNode } from "react";

import { Phase1Motif } from "@/features/phases/motifs/Phase1Motif";
import { Phase2Motif } from "@/features/phases/motifs/Phase2Motif";
import { Phase3Motif } from "@/features/phases/motifs/Phase3Motif";
import { Phase4Motif } from "@/features/phases/motifs/Phase4Motif";
import { Phase5Motif } from "@/features/phases/motifs/Phase5Motif";
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
 * All five phases have a start screen: Phase 1 (accent "ist" — rosa, the IST
 * convention), Phase 2 (Horizont), Phase 3 (Cockpit-Facetten), Phase 4
 * (Bausteine-Brücke) and Phase 5 (Weg mit Wegmarken), 2–5 with accent
 * "accent".
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
      "Jede erfolgreiche Veränderung braucht eine „Hin-zu“-Orientierung. Wie soll deine Situation in Zukunft aussehen? Bitte beachte: Auch jetzt geht es noch nicht um Lösungen, sondern um den Zustand, den du anstrebst. Um dein „Wohin“. Zum „Wie“ kommst du schon noch in Phase 4 – hab ein bisschen Geduld!",
    accent: "accent",
    ctaLabel: "Los geht’s",
    motif: <Phase2Motif />,
  },
  3: {
    phaseNumber: 3,
    phaseName: "Ressourcen erkennen",
    eyebrow: "Phase 3 · Ressourcen",
    heading: "Identifiziere deine Ressourcen auf dem Weg zum Ziel",
    intro:
      "Du weißt, wo du stehst und wohin du möchtest. Was fehlt noch? Viele antworten: ‚der Weg dorthin‘. Doch eine Maßnahmenliste, die nicht berücksichtigt, welche Ressourcen du hast, bleibt leer und frustrierend — bevor ich den Weg beschreiben kann, muss ich mir einen Überblick über meine Mittel verschaffen. Will ich einen Kuchen backen, ist ein gutes Rezept super — aber finde ich im Vorratsschrank keine geeigneten Zutaten, nützt mir das schönste Rezept nichts. Deshalb bist du eingeladen, dir ein richtiges Ressourcen-Cockpit aufzubauen. Wenn du weißt, worauf du zurückgreifen kannst — und was du vielleicht noch zusätzlich brauchst —, ist der anschließende Handlungsplan ganz leicht. Und vor allem: realistisch!",
    accent: "accent",
    ctaLabel: "Los geht’s",
    motif: <Phase3Motif />,
  },
  4: {
    phaseNumber: 4,
    phaseName: "Handlungsplan",
    eyebrow: "Phase 4 · Maßnahmen",
    heading: "So kommst du zu deinem Handlungsplan",
    intro:
      "Bestimmt bist du schon voller Ungeduld, nun endlich die Maßnahmen zu beschreiben, die dich ans Ziel bringen! Damit sie wirklich tragen, ist es essenziell, dass du sie aus deinen Ressourcen heraus entwickelst. Alle stehen dir zur Verfügung: alle zielförderlichen Intelligenzen, Motive, Persönlichkeitseigenschaften und Werte, alle Erkenntnisse aus Modellen, alle Erfahrungen und äußeren Ressourcen. Geh einfach durch alle Cluster — die Reihenfolge spielt keine Rolle.",
    accent: "accent",
    ctaLabel: "Los geht’s",
    motif: <Phase4Motif />,
  },
  5: {
    phaseNumber: 5,
    phaseName: "Nachhaltigkeit",
    eyebrow: "Phase 5 · Dranbleiben",
    heading: "So sorgst du für Nachhaltigkeit",
    intro:
      "Dein Plan steht — jetzt geht es darum, ihn in der Wirklichkeit lebendig zu halten. Diese letzte, kurze Phase hilft dir, Unterstützung zu organisieren: Wer oder was hilft dir beim Umsetzen und Dranbleiben? Auch hier gilt: aus deinen Ressourcen heraus.",
    accent: "accent",
    ctaLabel: "Los geht’s",
    motif: <Phase5Motif />,
  },
};

/** The start-screen content for a phase, or undefined if it has none. */
export function getPhaseStart(phase: PhaseId): PhaseStartContent | undefined {
  return PHASE_STARTS[phase];
}
