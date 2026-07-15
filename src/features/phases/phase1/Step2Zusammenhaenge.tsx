import { ChevronDown, Info, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { AddStage } from "@/features/cards/CardBoard";
import { CoachCardBoard } from "@/features/cards/CoachCardBoard";
import { GefuehlsAnker } from "@/features/phases/phase1/GefuehlsAnker";
import { StepNav } from "@/features/phases/StepNav";
import { Step2Guide } from "@/features/phases/phase1/Step2Guide";
import { Step2Intro } from "@/features/phases/phase1/Step2Intro";
import { consumeStep2Intro } from "@/features/phases/phase1/step2IntroSignal";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { Card } from "@/features/session/types";
import { cn } from "@/lib/utils";

/** Intro (verbatim, three paragraphs). */
const INTRO_PARAGRAPHS = [
  "Du weißt nun, wie du dich bezogen auf dein Thema hauptsächlich fühlst und hast das aufgeschrieben.",
  "Nun geht es darum, dass du einmal alles herunterschreibst, wer oder was damit zusammenhängt. Bitte beachte dabei, dass du deine Ist-Situation so klar wie möglich darstellst. Und das geht am besten, wenn du alles weglässt, was vielleicht Lösungen in der Zukunft sein könnten. Wenn dir eine Lösung einfällt, dann frage dich bitte: ‚Wie ist es denn aktuell wirklich?‘, denn das beschreibt deine aktuelle Ist-Situation.",
  "Bitte gehe konsequent durch diese Fragen, ausgehend von deinem Gefühl:",
];

/** The compact question guide (verbatim, four points). */
const GUIDE_POINTS = [
  "1. Welches Gefühl hast du in Bezug auf dein Thema vor allem? Wenn du mehrere spürst, wähle das stärkste und wichtigste aus!",
  "2. Schreibe alles, was damit zusammenhängt, auf einzelne Karten auf!",
  "3. Erläutere für jede Karte, was du genau damit meinst. Manchmal sind das auch mehrere Punkte.",
  "4. Schreibe bitte auf, auf welche Weise diese Punkte zu deinem Gefühl beitragen.",
];

/** A stage of the colour key — "Farbe = Bedeutung". */
type Stage = {
  num: number;
  swatch: string;
  label: string;
  question: string;
  /** colorId/addLabel only for the card stages 2–4 (stage 1 = the anchor). */
  colorId?: string;
  addLabel?: string;
};

const STAGES: Stage[] = [
  {
    num: 1,
    swatch: "bg-ist",
    label: "So geht es mir aktuell",
    question: "Dein Gefühl — der Startpunkt (aus Schritt 1).",
  },
  {
    num: 2,
    swatch: "bg-orange-200",
    label: "Das hängt zusammen mit …",
    question: "Wer oder was hängt mit meinem Gefühl zusammen?",
    colorId: "zusammenhang",
    addLabel: "Zusammenhang",
  },
  {
    num: 3,
    swatch: "bg-green-400",
    label: "Das meine ich konkret damit",
    question: "Wen oder was genau meinst du damit?",
    colorId: "konkretisierung",
    addLabel: "Konkretisierung",
  },
  {
    num: 4,
    swatch: "bg-faint",
    label: "So trägt das zu meinem Gefühl bei",
    question: "Wie tragen die Aspekte konkret bei?",
    colorId: "beitrag",
    addLabel: "Beitrag",
  },
];

/** Per-stage add affordances for the board (stages 2–4). */
const ADD_STAGES: AddStage[] = STAGES.flatMap((stage) =>
  stage.colorId && stage.addLabel
    ? [{ colorId: stage.colorId, addLabel: stage.addLabel }]
    : [],
);

/** One example line (verbatim) — colour-coded to its stage. */
const EXAMPLE_LINES = [
  {
    swatch: "bg-orange-200",
    question: "‚Wer oder was hängt mit meinem Gefühl zusammen?‘",
    answer: "Familie.",
  },
  {
    swatch: "bg-green-400",
    question: "‚Wen oder was genau meinst du damit?‘",
    answer: "Ehemann, Schwiegervater.",
  },
  {
    swatch: "bg-faint",
    question:
      "‚Wie tragen die einzelnen Aspekte zu deinem Gefühl konkret bei?‘",
    answer:
      "Ehemann macht keine Hausarbeit; Schwiegervater gibt unerwünschte Ratschläge.",
  },
];

/**
 * Phase 1, Step 1.2 — Zusammenhänge (IST-Analyse Teil 1). Verbatim intro + a
 * compact question guide (with the calm "keine Lösungen!" note) + a collapsible
 * generic example + a colour-coded card board: "Farbe = Bedeutung", four stages
 * (1 = IST-rosa anchor from istWord, not deletable; 2 Amber / 3 Grün / 4 Grau).
 * Cards are added per stage, filled and freely moved (reused CardBoard, pointer +
 * keyboard). No connection lines. Persisted in phase1.cards (color = stage).
 */
export function Step2Zusammenhaenge({ nav }: { nav: PhaseNavigation }) {
  const istWord = useSessionStore((s) => s.session?.phase1.istWord ?? "");
  const cards = useSessionStore((s) => s.session?.phase1.cards ?? []);
  const patch = useSessionStore((s) => s.patch);

  function setCards(next: Card[]) {
    patch((s) => ({ ...s, phase1: { ...s.phase1, cards: next } }));
  }

  function setIstWord(text: string) {
    patch((s) => ({ ...s, phase1: { ...s.phase1, istWord: text } }));
  }

  // Schritt-für-Schritt-Coach: nur per Button geöffnet (kein Auto-Öffnen).
  const [guideOpen, setGuideOpen] = useState(false);

  // Überleitung 1 → 2: das transiente Signal beim Mounten einmalig verbrauchen
  // (ref-gesichert gegen den Strict-Mode-Doppel-Effekt).
  const [showIntro, setShowIntro] = useState(false);
  const introConsumed = useRef(false);
  useEffect(() => {
    if (introConsumed.current) return;
    introConsumed.current = true;
    // Einmaliger Verbrauch eines transienten Mount-Signals (impur, ref-gesichert)
    // — nicht im Render ableitbar, daher bewusst hier.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (consumeStep2Intro()) setShowIntro(true);
  }, []);

  return (
    <div>
      <div className="space-y-6">
        {/* Gefühls-Anker aus 1.1 + Schritt-für-Schritt-Coach. */}
        <div className="flex items-center justify-between gap-2">
          <GefuehlsAnker />
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => setGuideOpen(true)}
          >
            <Sparkles aria-hidden />
            Schritt für Schritt
          </Button>
        </div>

        {/* Compact, collapsible instructions so the board gets the most space. */}
        <details className="group/anleitung">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-foreground">
            <ChevronDown
              className="size-4 text-muted motion-safe:transition-transform group-open/anleitung:rotate-180"
              aria-hidden
            />
            Anleitung
          </summary>
          <div className="mt-3 space-y-6">
            {/* Intro (verbatim) */}
            <div className="space-y-3 text-muted">
              {INTRO_PARAGRAPHS.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Compact question guide + "keine Lösungen!" */}
            <div className="rounded-xl border border-subtle bg-surface-2 p-4">
              <ol className="list-none space-y-1.5 text-sm text-foreground">
                {GUIDE_POINTS.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ol>
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-ist/30 bg-ist/5 p-3">
                <Info className="mt-0.5 size-4 shrink-0 text-ist" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-ist">
                    ACHTUNG: keine Lösungen!
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    Wenn dir eine Lösung einfällt, frage dich: ‚Wie ist es
                    aktuell wirklich?‘
                  </p>
                </div>
              </div>
            </div>

            {/* Example (collapsed by default, generic) */}
            <details className="group rounded-xl border border-subtle bg-surface p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-foreground">
                Beispiel ansehen
                <ChevronDown
                  className="size-4 text-muted motion-safe:transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="mt-3 space-y-2 text-sm text-muted">
                <p>Nimm an, mein Gefühl wäre ‚Genervt‘.</p>
                <ul className="space-y-2">
                  {EXAMPLE_LINES.map((line) => (
                    <li key={line.question} className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className={cn(
                          "mt-1.5 size-2 shrink-0 rounded-full",
                          line.swatch,
                        )}
                      />
                      <span>
                        <span className="text-foreground">{line.question}</span>{" "}
                        → {line.answer}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </details>

            {/* Colour key — "Farbe = Bedeutung" */}
            <div className="rounded-xl border border-subtle bg-surface-2 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-faint">
                Farbe = Bedeutung
              </p>
              <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
                {STAGES.map((stage) => (
                  <li key={stage.num} className="flex items-start gap-2.5">
                    <span
                      aria-hidden
                      className={cn(
                        "mt-1 size-3 shrink-0 rounded-full",
                        stage.swatch,
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {stage.label}
                      </p>
                      <p className="text-xs text-faint">{stage.question}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Calm working hint */}
            <p className="text-sm text-muted">
              Mache so lange weiter, bis dir nichts mehr einfällt. Falls du
              wenig Zeit hast, beschränke dich auf die 3–4 wichtigsten Aspekte —
              beantworte dennoch konsequent die nachfolgenden Fragen.
            </p>
          </div>
        </details>

        {/* The board: IST-rosa anchor from istWord + per-stage colour cards. */}
        <CoachCardBoard
          cards={cards}
          onCardsChange={setCards}
          anchorCard={{
            text: istWord,
            label: "So geht es mir aktuell",
            hint: "Starte hier",
            onTextChange: setIstWord,
          }}
          addStages={ADD_STAGES}
          large
        />
      </div>

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext
      />

      <Step2Guide open={guideOpen} onClose={() => setGuideOpen(false)} />

      {showIntro ? <Step2Intro onDone={() => setShowIntro(false)} /> : null}
    </div>
  );
}
