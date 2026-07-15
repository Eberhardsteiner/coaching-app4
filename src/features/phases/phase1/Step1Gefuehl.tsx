import { Check, ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

import { CloudSymbol } from "@/components/icons/PhaseSymbols";
import { BeispielPaar } from "@/components/method/BeispielPaar";

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
import { armStep2Intro } from "@/features/phases/phase1/step2IntroSignal";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import { cn } from "@/lib/utils";

/** Dezente, Token-basierte Hervorhebung (fett) wichtiger Punkte. */
function Em({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}

/**
 * Der sichtbare coachende Einstieg (VOICE-1): die führenden Sätze bleiben
 * sichtbar — nur die Hintergrund-Vertiefung ist aufklappbar.
 */
const INTRO_SHORT: ReactNode = (
  <>
    Noch bevor dein Verstand weiß: ‚Da ist etwas faul‘, wissen es deine{" "}
    <Em>Gefühle</Em>. Deshalb lautet die erste Frage:{" "}
    <Em>‚Wie fühlst du dich in Bezug auf dein Thema?‘</Em> Spürst du mehrere
    Gefühle, nimm das <Em>stärkste und häufigste</Em>.
  </>
);

/** Kern-Anleitung — sichtbar (VOICE-1): so gehst du an die Frage heran. */
const INTRO_ANLEITUNG: ReactNode = (
  <>
    Setze dich innerlich mit deiner aktuellen Situation in Bezug: Welches Gefühl
    spürst du vor allem, wenn du an das denkst, was du verändern möchtest? Dein{" "}
    <Em>Ausgangsgefühl</Em> steht anschließend{" "}
    <Em>im Mittelpunkt deiner weiteren Reflexion</Em>.
  </>
);

/** Vertiefung (aufklappbar): warum Gefühle der Auslöser sein können. */
const INTRO_VERTIEFUNG: ReactNode = (
  <>
    Treten unangenehme Gefühle regelmäßig in bestimmten Situationen auf, kann
    das der <Em>Auslöser für einen Veränderungswunsch</Em> — für ein Coaching —
    sein.
  </>
);

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
 * Leidensdruck / "Thema anpassen" logic (low burden → goTo(0,1)) is kept.
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

  /** Forward to Schritt 2 — arm the 1 → 2 transition intro first. */
  function goNext() {
    armStep2Intro();
    nav.advance();
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
        {/* Coaching-Einstieg + Kern-Anleitung sichtbar (VOICE-1);
            aufklappbar bleibt nur die Vertiefung. */}
        <div className="space-y-3">
          <p className="text-muted">{INTRO_SHORT}</p>
          <p className="text-muted">{INTRO_ANLEITUNG}</p>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-accent">
              <ChevronDown
                className="size-4 motion-safe:transition-transform group-open:rotate-180"
                aria-hidden
              />
              Warum zuerst das Gefühl?
            </summary>
            <p className="mt-2 text-sm text-muted">{INTRO_VERTIEFUNG}</p>
          </details>
        </div>

        {/* Das eine Wort im Mittelpunkt — die zentrale Gefühls-Karte. */}
        <div
          aria-live="polite"
          className={cn(
            "rounded-2xl border px-6 py-8 text-center",
            hasIst
              ? "border-ist/30 bg-ist/5"
              : "border-dashed border-ist/30 bg-surface",
          )}
        >
          <CloudSymbol className="mx-auto size-10 text-ist" />
          <p className="mt-2 text-xs font-medium uppercase tracking-wider text-ist">
            Dein Ausgangsgefühl
          </p>
          {hasIst ? (
            <p className="mt-2 font-serif text-4xl text-foreground">
              {trimmedIst}
            </p>
          ) : (
            <p className="mt-2 font-serif text-2xl text-faint">
              Dein Wort kommt hierher
            </p>
          )}
        </div>

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

          {/* Gefühl vs. gedanklicher Zustand — Beispiel-Paar (Baukasten). */}
          <BeispielPaar
            bad="„Unentschlossen“"
            badWhy="gedanklicher Zustand — kein Gefühl"
            good="„Zerrissenheit“"
            goodWhy="ein Gefühl"
          />
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
                  onClick={() => nav.goTo(0, 1)}
                >
                  Thema anpassen
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!canNext}
                  onClick={goNext}
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
        onNext={goNext}
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
