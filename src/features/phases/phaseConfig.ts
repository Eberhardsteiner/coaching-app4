import type { PhaseId } from "@/features/session/types";

/** A single step within a phase. */
export interface PhaseStepDef {
  /** Stable id (e.g. "0.1") — for debug/analytics, not shown raw. */
  id: string;
  title: string;
  /** Short anmoderation shown in the step header. */
  intro?: string;
}

/** One phase of the 5+1 process. */
export interface PhaseDef {
  id: PhaseId;
  title: string;
  short: string;
  steps: PhaseStepDef[];
}

/**
 * Central phase configuration. Phase 0 (Vereinbarung) is fully defined with its
 * four steps; phases 1–5 carry a single placeholder step for now (filled in
 * later prompts).
 */
export const PHASES: PhaseDef[] = [
  {
    id: 0,
    title: "Vereinbarung",
    short: "Ankommen, Werte und dein Thema klären.",
    steps: [
      {
        id: "0.1",
        title: "Ankommen & Erwartungen",
        intro: "Kurz ankommen — und klären, was dieser Weg von dir braucht.",
      },
      {
        id: "0.2",
        title: "Werte & Vorgehen",
        intro: "Worauf dieses Coaching baut — und wie der Weg grob verläuft.",
      },
      {
        id: "0.3",
        title: "Wer steuert was",
        intro: "Wer im Prozess wofür verantwortlich ist.",
      },
      {
        id: "0.4",
        title: "Passt das Thema? & Dein Thema",
        intro:
          "Eine ruhige Selbsteinschätzung — und eine erste Skizze deines Themas.",
      },
    ],
  },
  {
    id: 1,
    title: "IST verstehen",
    short: "Die heutige Situation sichtbar machen.",
    steps: [
      {
        id: "1.1",
        title: "Gefühl benennen",
        intro: "Ein einziges Wort für deinen IST-Zustand.",
      },
      {
        id: "1.2",
        title: "Zusammenhänge sammeln",
        intro: "Was hängt alles mit deinem IST-Zustand zusammen?",
      },
      {
        id: "1.3",
        title: "Perspektive wechseln",
        intro: "Den Blick weiten (folgt im nächsten Paket).",
      },
      {
        id: "1.4",
        title: "Clustern & gewichten",
        intro: "Karten gruppieren und gewichten (folgt im nächsten Paket).",
      },
    ],
  },
  {
    id: 2,
    title: "Ziel finden",
    short: "Ein attraktives, selbstgewähltes Ziel.",
    steps: [{ id: "2.1", title: "Ziel finden" }],
  },
  {
    id: 3,
    title: "Ressourcen erkennen",
    short: "Was du schon mitbringst.",
    steps: [{ id: "3.1", title: "Ressourcen erkennen" }],
  },
  {
    id: 4,
    title: "Handlungsplan",
    short: "Konkrete eigene Schritte.",
    steps: [{ id: "4.1", title: "Handlungsplan" }],
  },
  {
    id: 5,
    title: "Nachhaltigkeit",
    short: "Dranbleiben und absichern.",
    steps: [{ id: "5.1", title: "Nachhaltigkeit" }],
  },
];

/** Phase definition by id (PHASES is ordered 0…5). */
export function getPhaseDef(id: PhaseId): PhaseDef {
  return PHASES[id];
}
