import { useState } from "react";
import {
  Frame,
  Gauge,
  LifeBuoy,
  PanelRight,
  Save,
  Sparkles,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** Seven steps — operation only, no methodology. */
const STEPS = [
  {
    icon: Sparkles,
    title: "Willkommen",
    text: "Ein kurzer Rundgang durch die Bedienung — in unter einer Minute.",
  },
  {
    icon: Gauge,
    title: "Phasenleiste",
    text: "Oben links zeigt die Phasenleiste, wo du im 5+1-Prozess stehst.",
  },
  {
    icon: Frame,
    title: "Bühne",
    text: "In der Mitte liegt die Bühne — deine ruhige Arbeitsfläche. Hier entstehen später Karten und Eingaben.",
  },
  {
    icon: PanelRight,
    title: "Schubladen",
    text: "Rechts findest du vier Schubladen: Werkzeuge, Notizbuch, Modelle und Hilfe. Es ist immer nur eine geöffnet.",
  },
  {
    icon: Save,
    title: "Speichern & Export",
    text: "Oben rechts sicherst du deine Sitzung jederzeit als Datei.",
  },
  {
    icon: Upload,
    title: "Import & Fortsetzen",
    text: "Eine frühere Sitzung lädst du über Import — oder du setzt sie von der Startseite fort.",
  },
  {
    icon: LifeBuoy,
    title: "Hilfe & Sicherheit",
    text: "In der Hilfe-Schublade findest du jederzeit Sicherheitshinweise — und kannst diesen Rundgang erneut starten.",
  },
];

type TourProps = {
  open: boolean;
  /** Called when the tour closes; `dontShowAgain` reflects the checkbox. */
  onClose: (dontShowAgain: boolean) => void;
};

/**
 * Onboarding tour — a calm, accessible step dialog (Radix Dialog: focus trap,
 * Esc, ARIA). Explains the UI only. Weiter / Zurück / Überspringen + a
 * "Nicht mehr anzeigen" checkbox (checked by default → shown only once).
 */
export function Tour({ open, onClose }: TourProps) {
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function close() {
    onClose(dontShowAgain);
    // Reset for the next time the tour is opened (from the help drawer).
    setStep(0);
    setDontShowAgain(true);
  }

  const Icon = current.icon;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent aria-label="Rundgang durch die Bedienung">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Icon className="size-5" aria-hidden />
            </span>
            <DialogTitle>{current.title}</DialogTitle>
          </div>
          <DialogDescription>{current.text}</DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <ol className="flex items-center gap-1.5" aria-hidden>
            {STEPS.map((s, index) => (
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
            Schritt {step + 1} von {STEPS.length}
          </span>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(event) => setDontShowAgain(event.target.checked)}
            className="size-4 accent-accent"
          />
          Nicht mehr anzeigen
        </label>

        <div className="flex items-center justify-between gap-3">
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
              <Button size="sm" onClick={close}>
                Fertig
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                Weiter
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
