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
 * Central phase configuration — all phases are fully built: Phase 0
 * (Vereinbarung, 2 steps), Phase 1 (IST, 5 steps), Phase 2 (Ziel, 5 steps),
 * Phase 3 (Ressourcen, 7 steps), Phase 4 (Handlungsplan, 3 steps) and Phase 5
 * (Nachhaltigkeit, 3 steps). Completing Phase 5 finishes the process.
 */
export const PHASES: PhaseDef[] = [
  {
    id: 0,
    title: "Vereinbarung",
    short: "Werte, Rollen und dein Thema klären.",
    steps: [
      {
        id: "0.1",
        title: "Vereinbarung",
        intro: "Werte, Rollen und der grobe Weg — kurz bestätigt.",
      },
      {
        id: "0.2",
        title: "Dein Thema",
        intro: "Skizziere dein Thema kurz — ein paar Fakten genügen.",
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
        title: "Was strebe ich an?",
        intro:
          "Stell dir vor, es geht dir richtig gut — beschreibe den Zustand, nicht den Weg.",
      },
      {
        id: "2.2",
        title: "Mein Zielsatz",
        intro: "Dein Ziel als ein Satz — wie ein Mantra, im Futur II.",
      },
      {
        id: "2.3",
        title: "Zielprüfung",
        intro: "Sechs Qualitätskriterien — und der 10/10-Check.",
      },
      {
        id: "2.4",
        title: "Folgen meines Ziels",
        intro: "Rückenwind oder Gegenwind? Geh durch alle deine Cluster.",
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
        intro: "Erfahrungen, äußere Ressourcen und alte Muster sammeln.",
      },
      {
        id: "3.5",
        title: "Körpersignale",
        intro: "Wahrnehmen, was sich stimmig oder unstimmig anfühlt.",
      },
      {
        id: "3.6",
        title: "Sortieren",
        intro: "Ressourcen als förderlich oder hinderlich einstufen.",
      },
      {
        id: "3.7",
        title: "Abschluss & Check",
        intro: "Kurz festhalten, was du aus dieser Phase mitnimmst.",
      },
    ],
  },
  {
    id: 4,
    title: "Handlungsplan",
    short: "Konkrete eigene Schritte.",
    steps: [
      {
        id: "4.1",
        title: "Maßnahmen",
        intro: "Aus förderlichen Ressourcen konkrete Ich-Schritte ableiten.",
      },
      {
        id: "4.2",
        title: "Mögliche Hindernisse",
        intro: "Kurz vorausdenken — und jetzt schon gegensteuern.",
      },
      {
        id: "4.3",
        title: "Abschluss & Check",
        intro: "Kurz festhalten, was du aus dieser Phase mitnimmst.",
      },
    ],
  },
  {
    id: 5,
    title: "Nachhaltigkeit",
    short: "Dranbleiben und absichern.",
    steps: [
      {
        id: "5.1",
        title: "Dranbleiben",
        intro: "Pro Ressource eine konkrete Strategie, um dranzubleiben.",
      },
      {
        id: "5.2",
        title: "Erkenntnisse",
        intro: "Festhalten, was du aus dem ganzen Prozess mitnimmst.",
      },
      {
        id: "5.3",
        title: "Abschluss & Check",
        intro: "Kurz festhalten — und die Sitzung abschließen.",
      },
    ],
  },
];

/** Phase definition by id (PHASES is ordered 0…5). */
export function getPhaseDef(id: PhaseId): PhaseDef {
  return PHASES[id];
}
