import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const READ_MS = 8000; // sichtbar (zum Lesen) — bei Bedarf anpassen
const FADE_MS = 900; // Dauer des Ausblendens

/**
 * Kurze Überleitung von Schritt 1 zu Schritt 2 im Look der Startseite:
 * ruhiger Hero-Gradient mit dezenten, pulsierenden Kreisen, Serif-Headline und
 * drei, vier Sätzen. Blendet nach READ_MS über FADE_MS aus und gibt Schritt 2
 * frei; „Überspringen" blendet sofort aus. onDone() entfernt den Schirm.
 */
export function Step2Intro({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  // Nach der Lesezeit das Ausblenden starten.
  useEffect(() => {
    const t = window.setTimeout(() => setLeaving(true), READ_MS);
    return () => window.clearTimeout(t);
  }, []);

  // Nach Abschluss des Ausblendens entfernen.
  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(onDone, FADE_MS);
    return () => window.clearTimeout(t);
  }, [leaving, onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{ transitionDuration: `${FADE_MS}ms` }}
      className={cn(
        "fixed inset-0 z-[70] flex items-center justify-center overflow-hidden bg-hero-gradient px-6 text-white transition-opacity ease-out",
        leaving ? "pointer-events-none opacity-0" : "opacity-100",
      )}
    >
      {/* Ruhige, pulsierende Kreise — Motiv der Startseite. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span
          className="animate-pulse-calm absolute left-[8%] top-[18%] size-48 rounded-full bg-green-200/20 ring-1 ring-white/10"
          style={{ animationDelay: "0s" }}
        />
        <span
          className="animate-pulse-calm absolute right-[10%] top-[22%] size-64 rounded-full bg-blue-400/20 ring-1 ring-white/10"
          style={{ animationDelay: "-3s" }}
        />
        <span
          className="animate-pulse-calm absolute bottom-[-3rem] left-1/3 size-52 rounded-full bg-teal-200/15 ring-1 ring-white/10"
          style={{ animationDelay: "-6s" }}
        />
      </div>

      <div className="relative max-w-xl space-y-5 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-100">
          Weiter zur Ist-Analyse
        </p>
        <h2 className="font-serif text-3xl leading-snug sm:text-4xl">
          Dein Ausgangsgefühl steht — der Startpunkt deiner Ist-Analyse.
        </h2>
        <p className="text-lg leading-relaxed text-blue-100">
          Jetzt schaust du, wer oder was mit diesem Gefühl zusammenhängt, und
          hältst es auf einzelnen Karten fest. Beschreibe nur, wie es aktuell
          wirklich ist — Lösungen kommen später. Nimm dir ruhig Zeit.
        </p>
        <div className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            autoFocus
            onClick={() => setLeaving(true)}
            className="text-blue-100 hover:bg-white/10 hover:text-white"
          >
            Überspringen
          </Button>
        </div>
      </div>
    </div>
  );
}
