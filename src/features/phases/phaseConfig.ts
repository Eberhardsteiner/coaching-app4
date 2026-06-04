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
 * Central phase configuration. Phase 0 (Vereinbarung, 4 steps), Phase 1 (IST,
 * 5 steps) and Phase 2 (Ziel, 5 steps) are fully built; Phase 3 (Ressourcen, 7
 * steps) has steps 3.1–3.3 built and 3.4–3.7 as placeholders; phases 4–5 carry a
 * single placeholder step for now (filled in later prompts).
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
        intro: "Den Blick mit einem Modell weiten.",
      },
      {
        id: "1.4",
        title: "Clustern & gewichten",
        intro:
          "Verwandte Karten bündeln, gewichten und das Kernthema bestimmen.",
      },
      {
        id: "1.5",
        title: "Abschluss & Check",
        intro: "Kurz festhalten, was du aus dieser Phase mitnimmst.",
      },
    ],
  },
  {
    id: 2,
    title: "Ziel finden",
    short: "Ein attraktives, selbstgewähltes Ziel.",
    steps: [
      {
        id: "2.1",
        title: "Wunsch & Vision",
        intro: "Den gewünschten Zustand beschreiben — nicht den Weg.",
      },
      {
        id: "2.2",
        title: "Zielformel",
        intro: "Dein Ziel als erreichten Zustand formulieren (Futur II).",
      },
      {
        id: "2.3",
        title: "Zielprüfung",
        intro: "Prüfen, ob das Ziel trägt — mit dem 10/10-Check.",
      },
      {
        id: "2.4",
        title: "Zielfolgen",
        intro: "Was sich für dein Umfeld ändert, wenn du das Ziel erreichst.",
      },
      {
        id: "2.5",
        title: "Abschluss & Check",
        intro: "Kurz festhalten, was du aus dieser Phase mitnimmst.",
      },
    ],
  },
  {
    id: 3,
    title: "Ressourcen erkennen",
    short: "Was du schon mitbringst.",
    steps: [
      {
        id: "3.1",
        title: "Eigene Ressourcen",
        intro: "Mit einem Modell deine Stärken, Werte und Fähigkeiten sammeln.",
      },
      {
        id: "3.2",
        title: "Werte der Beteiligten",
        intro: "Was den Menschen rund um dein Kernthema wichtig ist.",
      },
      {
        id: "3.3",
        title: "Hypothesen & Impulse",
        intro: "Mit guten Fragen weitere Ressourcen entdecken.",
      },
      {
        id: "3.4",
        title: "Erfahrungen & Muster",
        intro: "Folgt im nächsten Paket.",
      },
      {
        id: "3.5",
        title: "Körpersignale",
        intro: "Folgt im nächsten Paket.",
      },
      {
        id: "3.6",
        title: "Sortieren",
        intro: "Folgt im nächsten Paket.",
      },
      {
        id: "3.7",
        title: "Abschluss & Check",
        intro: "Folgt im nächsten Paket.",
      },
    ],
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
