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
 * Phase 3 (Ressourcen, 10 steps — MP3), Phase 4 (Handlungsplan, 4 steps —
 * MP4) and Phase 5 (Nachhaltigkeit, 3 steps). Completing Phase 5 finishes the
 * process.
 * Old sessions saved mid-phase before a step-count change are clamped in
 * usePhaseNavigation (stepIndex never exceeds the current step count).
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
        title: "Orientierung: Ressourcen & Cockpit",
        intro:
          "Das Kompetenzmodell als Landkarte — und dein Cockpit, das sich füllt.",
      },
      {
        id: "3.2",
        title: "Meine Intelligenzen",
        intro: "Deine Begabungen — und ob sie dir Richtung Ziel helfen.",
      },
      {
        id: "3.3",
        title: "Motive & Persönlichkeitseigenschaften",
        intro: "Was dich antreibt und ausmacht — gewertet am Ziel.",
      },
      {
        id: "3.4",
        title: "Meine Werte",
        intro: "Als Mensch, in deiner Funktion, für dein Ziel — je max. fünf.",
      },
      {
        id: "3.5",
        title: "Werte der Anderen",
        intro: "Was deine systemischen Mitspieler wichtig nehmen — je Cluster.",
      },
      {
        id: "3.6",
        title: "Ressourcen aus Modellen",
        intro: "Die Vogelperspektive: wissenschaftliche Modelle als Impuls.",
      },
      {
        id: "3.7",
        title: "Biografie & Umfeld",
        intro: "Gemeisterte Situationen und äußere Ressourcen sammeln.",
      },
      {
        id: "3.8",
        title: "Körpersignale",
        intro: "Deine bekannten Signalgeber — Wahrnehmung, keine Symptome.",
      },
      {
        id: "3.9",
        title: "Bisheriges Muster — Don’t!",
        intro: "Welche Ressourcenkombination dich immer wieder hineinführt.",
      },
      {
        id: "3.10",
        title: "Abschluss & Check",
        intro: "Dein Cockpit im Überblick — kurz festhalten, was du mitnimmst.",
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
        title: "Maßnahmen je Cluster",
        intro:
          "Aus deinen förderlichen Ressourcen konkrete Ich-Sätze — Cluster für Cluster.",
      },
      {
        id: "4.2",
        title: "Qualitätsprüfung",
        intro: "Vier Kriterien für wirksame Maßnahmen — prüfe jede einzelne.",
      },
      {
        id: "4.3",
        title: "Maßnahmenplan",
        intro: "Deine Maßnahmen als Tabelle — mit Terminen und Plan B.",
      },
      {
        id: "4.4",
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
