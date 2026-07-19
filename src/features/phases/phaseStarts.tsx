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
  /** Kurzer Text ODER gesetzte Absätze (K1) — PhaseStart rendert ein <div>. */
  intro: ReactNode;
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
    // K1: zwei Absätze — Auftakt/Überblick · Arbeitsweise.
    intro: (
      <>
        <p>
          Nun geht es los! Verstehe die Wechselwirkungen und Zusammenhänge
          deiner Situation. Am Ende der Phase 1 wirst du einen strukturierten
          und bewerteten Überblick über deinen systemischen Kontext erarbeitet
          haben.
        </p>
        <p>
          Damit du zu guten Ergebnissen kommst, orientiere dich konsequent an
          den Fragen und schreibe alles auf, was dir zu den Fragen einfällt.
        </p>
      </>
    ),
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
    // K1: zwei Absätze — Hin-zu-Orientierung · noch keine Lösungen.
    intro: (
      <>
        <p>
          Jede erfolgreiche Veränderung braucht eine „Hin-zu“-Orientierung. Wie
          soll deine Situation in Zukunft aussehen?
        </p>
        <p>
          Bitte beachte: Auch jetzt geht es noch nicht um Lösungen, sondern um
          den Zustand, den du anstrebst. Um dein „Wohin“. Zum „Wie“ kommst du
          schon noch in Phase 4 – hab ein bisschen Geduld!
        </p>
      </>
    ),
    accent: "accent",
    ctaLabel: "Los geht’s",
    motif: <Phase2Motif />,
  },
  3: {
    phaseNumber: 3,
    phaseName: "Ressourcen erkennen",
    eyebrow: "Phase 3 · Ressourcen",
    heading: "Identifiziere deine Ressourcen auf dem Weg zum Ziel",
    // K1: drei Absätze (Frage/Weg · Kuchen-Bild · Einladung/Cockpit) +
    // Schlusszeile — Wortlaut unverändert, nur gesetzt.
    intro: (
      <>
        <p>
          Du weißt, wo du stehst und wohin du möchtest. Was fehlt noch? Viele
          antworten: ‚der Weg dorthin‘.
        </p>
        <p>
          Doch eine Maßnahmenliste, die nicht berücksichtigt, welche Ressourcen
          du hast, bleibt leer und frustrierend — bevor ich den Weg beschreiben
          kann, muss ich mir einen Überblick über meine Mittel verschaffen. Will
          ich einen Kuchen backen, ist ein gutes Rezept super — aber finde ich
          im Vorratsschrank keine geeigneten Zutaten, nützt mir das schönste
          Rezept nichts.
        </p>
        <p>
          Deshalb bist du eingeladen, dir ein richtiges{" "}
          <strong className="font-semibold text-foreground">
            Ressourcen-Cockpit
          </strong>{" "}
          aufzubauen. Wenn du weißt, worauf du zurückgreifen kannst — und was du
          vielleicht noch zusätzlich brauchst —, ist der anschließende
          Handlungsplan ganz leicht.
        </p>
        <p className="font-medium text-foreground">
          Und vor allem: <strong className="font-semibold">realistisch!</strong>
        </p>
      </>
    ),
    accent: "accent",
    ctaLabel: "Los geht’s",
    motif: <Phase3Motif />,
  },
  4: {
    phaseNumber: 4,
    phaseName: "Handlungsplan",
    eyebrow: "Phase 4 · Maßnahmen",
    heading: "So kommst du zu deinem Handlungsplan",
    // K1: drei Absätze — Ungeduld/ressourcenbasiert · alle Ressourcen ·
    // Vorgehen + Zielsatz.
    intro: (
      <>
        <p>
          Bestimmt bist du schon voller Ungeduld, nun endlich die Maßnahmen zu
          beschreiben, die dich ans Ziel bringen! Damit sie wirklich tragen, ist
          es essenziell, dass du sie aus deinen Ressourcen heraus entwickelst.
        </p>
        <p>
          Alle stehen dir zur Verfügung: alle zielförderlichen Intelligenzen,
          Motive, Persönlichkeitseigenschaften und Werte, alle Erkenntnisse aus
          Modellen, alle Erfahrungen und äußeren Ressourcen.
        </p>
        <p>
          Geh einfach durch alle Cluster — die Reihenfolge spielt keine Rolle.
          Und sorge nun wieder dafür, dass dir dein Ziel stets vor Augen steht —
          dein Zielsatz begleitet dich deshalb durch den ganzen Schritt.
        </p>
      </>
    ),
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
