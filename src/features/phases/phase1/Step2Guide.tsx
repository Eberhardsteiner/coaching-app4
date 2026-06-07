import { useCallback, useEffect, useRef, useState } from "react";
import { Info, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GuideSlide = {
  title: string;
  text: string;
  /** Stufenfarbe (Header-Badge + Punkt); ohne → Intro mit Sparkles. */
  swatch?: string;
  swatchLabel?: string;
  howto?: string;
  warning?: string;
};

const SLIDES: GuideSlide[] = [
  {
    title: "So gehst du vor",
    text: "Bitte gehe konsequent nach der Reihenfolge der Fragen vor. Damit erkundest du deine Ist-Situation bestmöglich. Jede der vier Fragen hat ihre eigene Farbe.",
  },
  {
    title: "1. Dein Gefühl",
    swatch: "bg-ist",
    swatchLabel: "So geht es mir aktuell",
    text: "Welches Gefühl hast du in Bezug auf dein Thema vor allem? Wenn du mehrere spürst, wähle das stärkste und wichtigste aus!",
    howto:
      "Es steht als rosa Karte in der Mitte — dein Startpunkt aus Schritt 1.",
  },
  {
    title: "2. Zusammenhänge",
    swatch: "bg-amber-200",
    swatchLabel: "Das hängt zusammen mit …",
    text: "Schreibe alles, was damit zusammenhängt, auf einzelne Karten auf!",
    howto: "Klick auf „Zusammenhang“ (gelb), um eine Karte hinzuzufügen.",
  },
  {
    title: "3. Konkretisierung",
    swatch: "bg-green-400",
    swatchLabel: "Das meine ich konkret damit",
    text: "Erläutere für jede Karte, was du genau damit meinst. Manchmal sind das auch mehrere Punkte.",
    howto: "Klick auf „Konkretisierung“ (grün).",
  },
  {
    title: "4. Beitrag",
    swatch: "bg-faint",
    swatchLabel: "So trägt das zu meinem Gefühl bei",
    text: "Schreibe bitte auf, auf welche Weise diese Punkte zu deinem Gefühl beitragen.",
    howto: "Klick auf „Beitrag“ (grau).",
    warning:
      "ACHTUNG: keine Lösungen! Wenn dir eine Lösung einfällt, frage dich: ‚Wie ist es aktuell wirklich?‘",
  },
];

type Step2GuideProps = {
  open: boolean;
  onClose: (dontShowAgain: boolean) => void;
};

/**
 * Schritt-für-Schritt-Coach für die IST-Analyse (Schritt 2). Zentrierter,
 * ruhiger Stepper ohne Blur: erklärt die vier Fragen, jeweils mit ihrer Farbe
 * und einem kurzen „so geht's". Weiter / Zurück / Überspringen + „Nicht mehr
 * automatisch anzeigen". Esc schließt; der Primär-Button erhält Fokus.
 */
export function Step2Guide({ open, onClose }: Step2GuideProps) {
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);
  const primaryRef = useRef<HTMLButtonElement | null>(null);

  const current = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  const close = useCallback(() => {
    onClose(dontShowAgain);
    setStep(0);
    setDontShowAgain(true);
  }, [onClose, dontShowAgain]);

  useEffect(() => {
    if (!open) return;
    primaryRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step, close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Anleitung: Zusammenhänge Schritt für Schritt"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-subtle bg-background p-5 shadow-xl motion-safe:animate-[fade-in_140ms_ease-out]"
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              current.swatch ? current.swatch : "bg-accent/10 text-accent",
            )}
          >
            {current.swatch ? (
              <span className="text-sm font-bold text-foreground/70">
                {step}
              </span>
            ) : (
              <Sparkles className="size-5" aria-hidden />
            )}
          </span>
          <h2 className="font-serif text-lg text-foreground">
            {current.title}
          </h2>
        </div>

        {current.swatchLabel ? (
          <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-subtle bg-surface-2 p-3">
            <span
              aria-hidden
              className={cn("size-4 shrink-0 rounded-full", current.swatch)}
            />
            <span className="text-sm font-medium text-foreground">
              {current.swatchLabel}
            </span>
          </div>
        ) : null}

        <p className="mt-3 text-sm leading-relaxed text-muted">
          {current.text}
        </p>

        {current.howto ? (
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            {current.howto}
          </p>
        ) : null}

        {current.warning ? (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-ist/30 bg-ist/5 p-3">
            <Info className="mt-0.5 size-4 shrink-0 text-ist" aria-hidden />
            <p className="text-sm font-medium text-ist">{current.warning}</p>
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-2">
          <ol className="flex items-center gap-1.5" aria-hidden>
            {SLIDES.map((s, index) => (
              <li
                key={s.title}
                className={cn(
                  "h-1.5 rounded-full transition-colors",
                  index === step ? "w-5 bg-accent" : "w-1.5 bg-subtle",
                )}
              />
            ))}
          </ol>
          <span className="text-xs text-faint">
            Schritt {step + 1} von {SLIDES.length}
          </span>
        </div>

        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(event) => setDontShowAgain(event.target.checked)}
            className="size-4 accent-accent"
          />
          Nicht mehr automatisch anzeigen
        </label>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={close}>
            Überspringen
          </Button>
          <div className="flex gap-2">
            {step > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => s - 1)}
              >
                Zurück
              </Button>
            ) : null}
            {isLast ? (
              <Button ref={primaryRef} size="sm" onClick={close}>
                Verstanden
              </Button>
            ) : (
              <Button
                ref={primaryRef}
                size="sm"
                onClick={() => setStep((s) => s + 1)}
              >
                Weiter
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
