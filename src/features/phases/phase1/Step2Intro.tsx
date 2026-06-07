import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const READ_MS = 8000; // sichtbar (zum Lesen) — bei Bedarf anpassen
const FADE_MS = 900; // Dauer des Ausblendens

/**
 * Kurze Überleitung von Schritt 1 zu Schritt 2: ein ruhiger Vollbild-Schirm mit
 * drei, vier Sätzen, der nach ein paar Sekunden langsam ausblendet und Schritt 2
 * freigibt. „Überspringen" blendet sofort aus. onDone() wird nach Abschluss des
 * Ausblendens aufgerufen (Schirm wird entfernt).
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
        "fixed inset-0 z-[70] flex items-center justify-center bg-background p-6 transition-opacity ease-out",
        leaving ? "pointer-events-none opacity-0" : "opacity-100",
      )}
    >
      <div className="max-w-md space-y-4 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-faint">
          Weiter zur Ist-Analyse
        </p>
        <p className="text-lg leading-relaxed text-foreground">
          Dein Ausgangsgefühl steht — es ist der Startpunkt deiner Ist-Analyse.
          Jetzt schaust du, wer oder was mit diesem Gefühl zusammenhängt, und
          hältst es auf einzelnen Karten fest. Beschreibe nur, wie es aktuell
          wirklich ist — Lösungen kommen später. Nimm dir ruhig Zeit.
        </p>
        <Button
          variant="outline"
          size="sm"
          autoFocus
          onClick={() => setLeaving(true)}
        >
          Überspringen
        </Button>
      </div>
    </div>
  );
}
