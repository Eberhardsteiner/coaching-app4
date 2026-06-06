import { Check } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import { cn } from "@/lib/utils";

/** The feeling-question intro (verbatim, three paragraphs). */
const INTRO_PARAGRAPHS = [
  "Noch bevor unser Verstand weiß: ‚Da ist etwas faul‘, wissen unsere Gefühle, dass wir uns nicht wohlfühlen. Treten unangenehme Gefühle regelmäßig in bestimmten Situationen auf, kann das der Auslöser für einen Veränderungswunsch — für ein Coaching — sein. Also wundere dich bitte nicht, wenn die erste Frage lautet: ‚Wie fühlst du dich in Bezug auf dein Thema?‘",
  "Bitte beginne damit, dass du dich innerlich mit deiner aktuellen Situation in Bezug setzt. Welches Gefühl spürst du vor allem, wenn du an das denkst, was du verändern möchtest? Wenn du mehrere Gefühle spürst, dann nimm dasjenige, das am stärksten und häufigsten auftritt. Die Liste der Gefühle kann dir helfen — sie ist jedoch erweiterbar. Wenn du dein Gefühl darauf nicht findest, dann fühl dich frei, ein eigenes zu benennen. Stelle dabei bitte sicher, dass du wirklich ein Gefühl aufschreibst und keinen gedanklichen Zustand (z. B. ‚Unentschlossen‘ ist ein gedanklicher Zustand, kein Gefühl. ‚Zerrissenheit‘ dagegen ist ein Gefühl).",
  "Wenn du dein Ausgangsgefühl gefunden hast, steht dieses im Mittelpunkt deiner weiteren Reflexion zu deiner Ist-Situation.",
];

/**
 * The selectable feelings (verbatim, in this order). This list is already
 * checked, so picking from it sets the feeling directly. The "…" of the template
 * is the free-text path below (which gets the quality check).
 */
const FEELINGS = [
  "Wut",
  "Gestresstsein",
  "Überforderung",
  "Ausgebranntsein",
  "Unzufriedenheit",
  "Lustlosigkeit",
  "Angst",
  "Hilflosigkeit",
  "Festgefahrensein",
  "Orientierungslosigkeit",
  "Traurigkeit",
  "Frust",
  "Sinnlosigkeit",
  "Fremdbestimmung",
  "Unsicherheit",
  "Einsamkeit",
];

/** Verbatim text of the free-text quality check (Gefühl vs. gedanklicher Zustand). */
const CHECK_TEXT =
  "Prüfe, ob du wirklich ein Gefühl aufgeschrieben hast und keinen gedanklichen Zustand (z. B. ‚Unentschlossen‘ ist ein gedanklicher Zustand, kein Gefühl. ‚Zerrissenheit‘ dagegen ist ein Gefühl).";

const BURDEN_SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const LOW_BURDEN_THRESHOLD = 3;

/**
 * Phase 1, Step 1.1 — „Wie fühlst du dich in Bezug auf dein Thema?“ (IST).
 *
 * The verbatim intro, a clickable feeling list and a free-text path all feed the
 * single IST feeling (phase1.istWord), shown prominently as "Dein Ausgangsgefühl".
 * Picking from the (pre-checked) list commits directly; the free-text path runs a
 * verbatim quality check (AlertDialog) before committing. The existing
 * Leidensdruck / "Thema anpassen" logic (low burden → goTo(0,3)) is kept.
 *
 * Commit across input methods: a single click/tap *marks* a feeling (rosa IST
 * accent); committing happens via double-click (mouse), Enter/Space on the
 * focused button (keyboard → click with detail 0) or the "Übernehmen" button
 * (touch + everyone). "Weiter" is gated on a non-empty istWord.
 */
export function Step1Gefuehl({ nav }: { nav: PhaseNavigation }) {
  const istWord = useSessionStore((s) => s.session?.phase1.istWord ?? "");
  const istBurden = useSessionStore((s) => s.session?.phase1.istBurden);
  const patch = useSessionStore((s) => s.patch);

  // Visual candidate in the list — a single click marks it; commit confirms it.
  const [selected, setSelected] = useState<string | null>(() =>
    FEELINGS.includes(istWord) ? istWord : null,
  );
  // Free-text draft (prefilled when the stored feeling is a custom one).
  const [customFeeling, setCustomFeeling] = useState(() =>
    istWord && !FEELINGS.includes(istWord) ? istWord : "",
  );
  // The free-text quality-check dialog (only ever opened from the free-text path).
  const [checkOpen, setCheckOpen] = useState(false);

  function setIstWord(value: string) {
    patch((s) => ({ ...s, phase1: { ...s.phase1, istWord: value } }));
  }
  function setBurden(value: number) {
    patch((s) => ({ ...s, phase1: { ...s.phase1, istBurden: value } }));
  }

  /** Commit a feeling from the (pre-checked) list — no dialog. */
  function commitFromList(feeling: string) {
    setSelected(feeling);
    setIstWord(feeling);
  }

  /** Click on a list feeling: keyboard (detail 0) commits; mouse/touch marks. */
  function onFeelingClick(feeling: string, detail: number) {
    if (detail === 0) commitFromList(feeling);
    else setSelected(feeling);
  }

  const customTrimmed = customFeeling.trim();

  /** Free-text "Übernehmen": run the verbatim check before committing. */
  function onCustomSubmit() {
    if (customTrimmed) setCheckOpen(true);
  }
  /** Confirmed in the dialog → the free text becomes the feeling. */
  function confirmCustom() {
    setIstWord(customTrimmed);
    setSelected(null);
    setCheckOpen(false);
  }

  const trimmedIst = istWord.trim();
  const hasIst = trimmedIst.length > 0;
  const lowBurden =
    istBurden !== undefined && istBurden <= LOW_BURDEN_THRESHOLD;
  const canNext = hasIst;

  return (
    <div>
      <div className="space-y-8">
        {/* Intro (verbatim) */}
        <div className="space-y-3 text-muted">
          {INTRO_PARAGRAPHS.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* The chosen starting feeling — centre of the further reflection. */}
        {hasIst ? (
          <div
            aria-live="polite"
            className="rounded-xl border border-ist/30 bg-ist/5 px-5 py-4"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-ist">
              Dein Ausgangsgefühl
            </p>
            <p className="mt-1 font-serif text-2xl text-foreground">
              {trimmedIst}
            </p>
          </div>
        ) : null}

        {/* Feeling list */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Wähle ein Gefühl
            </h3>
            <p className="mt-0.5 text-xs text-faint">
              Ein Klick markiert — Doppelklick, Enter oder „Übernehmen“ wählt es
              aus.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {FEELINGS.map((feeling) => {
              const isSelected = selected === feeling;
              const isCommitted = trimmedIst === feeling;
              return (
                <li key={feeling}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={(event) => onFeelingClick(feeling, event.detail)}
                    onDoubleClick={() => commitFromList(feeling)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ist",
                      isSelected
                        ? "border-ist bg-ist/10 font-medium text-ist"
                        : "border-subtle bg-surface text-foreground hover:border-ist/40",
                    )}
                  >
                    <span>{feeling}</span>
                    {isCommitted ? (
                      <Check className="size-4 shrink-0 text-ist" aria-hidden />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
          {selected && selected !== trimmedIst ? (
            <Button onClick={() => commitFromList(selected)}>
              „{selected}“ übernehmen
            </Button>
          ) : null}
        </div>

        {/* Free-text feeling (the "…" path) — quality-checked before it counts. */}
        <div className="space-y-2">
          <label
            htmlFor="custom-feeling"
            className="block text-sm font-medium text-foreground"
          >
            Eigenes Gefühl
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="custom-feeling"
              type="text"
              value={customFeeling}
              onChange={(event) => setCustomFeeling(event.target.value)}
              placeholder="Dein eigenes Gefühl …"
              className="w-full rounded-md border border-subtle bg-surface px-3 py-2.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ist"
            />
            <Button
              variant="outline"
              onClick={onCustomSubmit}
              disabled={!customTrimmed}
              className="shrink-0"
            >
              Übernehmen
            </Button>
          </div>
          <p className="text-xs text-faint">
            Wenn dein Gefühl nicht in der Liste steht, benenne hier ein eigenes.
          </p>
        </div>

        {/* Leidensdruck + "Thema anpassen" (kept from before) */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Wie sehr belastet dich das gerade?
          </p>
          <div
            role="group"
            aria-label="Belastung von 1 bis 10"
            className="flex flex-wrap gap-1.5"
          >
            {BURDEN_SCALE.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={istBurden === value}
                aria-label={`${value} von 10`}
                onClick={() => setBurden(value)}
                className={cn(
                  "size-9 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  istBurden === value
                    ? "bg-accent text-white"
                    : "bg-surface-2 text-muted hover:text-foreground",
                )}
              >
                {value}
              </button>
            ))}
          </div>

          {lowBurden ? (
            <div className="mt-2 rounded-lg border border-subtle bg-surface-2 p-4">
              <p className="text-sm text-foreground">
                Wenn dich das gerade kaum belastet, fehlt vielleicht der Anlass
                für Veränderung. Möchtest du dein Thema noch einmal anschauen?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => nav.goTo(0, 3)}
                >
                  Thema anpassen
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!canNext}
                  onClick={() => nav.advance()}
                >
                  Trotzdem weiter
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext={canNext}
      />

      {/* Free-text quality check — opened only from the free-text "Übernehmen". */}
      <AlertDialog open={checkOpen} onOpenChange={setCheckOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Gefühl oder gedanklicher Zustand?
            </AlertDialogTitle>
            <AlertDialogDescription>{CHECK_TEXT}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Zurück</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={confirmCustom}>Ja, das ist ein Gefühl</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
