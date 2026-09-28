import { Check, ChevronDown } from "lucide-react";
import { type ReactNode } from "react";

import { CloudSymbol } from "@/components/icons/PhaseSymbols";
import { BeispielPaar } from "@/components/method/BeispielPaar";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

/** Höchstens zwei Gefühle aus der Liste (B1). */
const MAX_FEELINGS = 2;

/** „A und B" → ["A", "B"] (getrimmt, ohne Leereinträge). */
function splitFeelings(value: string): string[] {
  return value
    .split(" und ")
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Phase 1, Step 1.1 — „Wie fühlst du dich in Bezug auf dein Thema?“ (IST).
 *
 * B1: Es gibt genau EINEN Eintragsort, das Feld „Was ist dein Gefühl?“. Es
 * speichert direkt in phase1.istWord (A2: nichts geht mehr durch fehlendes
 * Bestätigen verloren). Die Gefühlsliste ist eingeklappt; ein Klick fügt das
 * Gefühl ins Feld ein oder nimmt es wieder heraus, höchstens zwei Gefühle
 * („A und B“). Die Prüffrage „Gefühl oder gedanklicher Zustand?“ steht als
 * Hinweis unter dem Feld und sperrt nichts. Leidensdruck und „Thema anpassen“
 * bleiben unverändert. „Weiter“ ist nie gesperrt (keine Pflichteingabe).
 */
export function Step1Gefuehl({ nav }: { nav: PhaseNavigation }) {
  const istWord = useSessionStore((s) => s.session?.phase1.istWord ?? "");
  const istBurden = useSessionStore((s) => s.session?.phase1.istBurden);
  const patch = useSessionStore((s) => s.patch);

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

  const parts = splitFeelings(istWord);
  const canAddMore = parts.length < MAX_FEELINGS;

  /** Listen-Klick: Gefühl ins Feld einfügen oder wieder herausnehmen. */
  function toggleFeeling(feeling: string) {
    if (parts.includes(feeling)) {
      setIstWord(parts.filter((part) => part !== feeling).join(" und "));
      return;
    }
    if (!canAddMore) return;
    setIstWord([...parts, feeling].join(" und "));
  }

  const trimmedIst = istWord.trim();
  const hasIst = trimmedIst.length > 0;
  const lowBurden =
    istBurden !== undefined && istBurden <= LOW_BURDEN_THRESHOLD;

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

        {/* B1: der eine Eintragsort, zuerst das Freitextfeld. */}
        <div className="space-y-2">
          <label
            htmlFor="ist-gefuehl"
            className="block font-medium text-foreground"
          >
            Was ist dein Gefühl?
          </label>
          <Input
            id="ist-gefuehl"
            value={istWord}
            onChange={(event) => setIstWord(event.target.value)}
            placeholder="Dein Gefühl in einem Wort"
            className="focus-visible:ring-ist"
          />
          <p className="text-sm text-faint">{CHECK_TEXT}</p>

          {/* Gefühl vs. gedanklicher Zustand — Beispiel-Paar (Baukasten). */}
          <BeispielPaar
            bad="„Unentschlossen“"
            badWhy="gedanklicher Zustand — kein Gefühl"
            good="„Zerrissenheit“"
            goodWhy="ein Gefühl"
          />
        </div>

        {/* B1: die Liste eingeklappt, als Hilfe, falls kein Wort einfällt.
            Ein Klick füllt das Feld (höchstens zwei Gefühle). */}
        <details className="group rounded-xl border border-subtle bg-surface p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium text-foreground">
            Nicht sicher? Wähle ein Gefühl aus der Liste
            <ChevronDown
              className="size-4 shrink-0 text-muted motion-safe:transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className="mt-2 text-sm text-faint">
            Tippe ein Gefühl an, es erscheint oben im Feld. Du kannst höchstens
            zwei Gefühle wählen.
          </p>
          <ul
            aria-label="Gefühle zur Auswahl (höchstens zwei)"
            className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"
          >
            {FEELINGS.map((feeling) => {
              const isSelected = parts.includes(feeling);
              const locked = !isSelected && !canAddMore;
              return (
                <li key={feeling}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    disabled={locked}
                    onClick={() => toggleFeeling(feeling)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ist",
                      isSelected
                        ? "border-ist bg-ist/10 font-medium text-ist"
                        : "border-subtle bg-surface text-foreground hover:border-ist/40",
                      locked && "cursor-not-allowed opacity-45",
                    )}
                  >
                    <span>{feeling}</span>
                    {isSelected ? (
                      <Check className="size-4 shrink-0 text-ist" aria-hidden />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </details>

        {/* Das Wort im Mittelpunkt — die zentrale Gefühls-Karte (Anzeige). */}
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
            <p className="mt-2 font-serif text-4xl break-words text-foreground">
              {trimmedIst}
            </p>
          ) : (
            <p className="mt-2 font-serif text-2xl text-faint">
              Dein Wort kommt hierher
            </p>
          )}
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
                <Button variant="ghost" size="sm" onClick={goNext}>
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
        canNext
      />
    </div>
  );
}
