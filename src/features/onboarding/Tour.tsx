import {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Frame,
  Gauge,
  LifeBuoy,
  type LucideIcon,
  PanelRight,
  Save,
  Sparkles,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TourStep = {
  icon: LucideIcon;
  title: string;
  text: string;
  /** data-tour-Schlüssel des hervorzuhebenden Elements; ohne → mittig. */
  target?: string;
};

const STEPS: TourStep[] = [
  {
    icon: Sparkles,
    title: "Willkommen",
    text: "Ein kurzer Rundgang durch die Bedienung — in unter einer Minute.",
  },
  {
    icon: Gauge,
    title: "Phasenleiste",
    text: "Oben links zeigt die Phasenleiste, wo du im Prozess stehst.",
    target: "phases",
  },
  {
    icon: Frame,
    title: "Bühne",
    text: "In der Mitte liegt die Bühne — deine ruhige Arbeitsfläche. Hier entstehen Karten und Eingaben.",
    target: "stage",
  },
  {
    icon: PanelRight,
    title: "Schubladen",
    text: "Rechts findest du die Schubladen: Werkzeuge, Notizbuch, Modelle und Hilfe. Es ist immer nur eine geöffnet.",
    target: "drawers",
  },
  {
    icon: Save,
    title: "Speichern & Export",
    text: "Oben rechts sicherst du deine Sitzung jederzeit als Datei.",
    target: "export",
  },
  {
    icon: Upload,
    title: "Import & Fortsetzen",
    text: "Eine frühere Sitzung lädst du über Import — oder du setzt sie von der Startseite fort.",
    target: "import",
  },
  {
    icon: LifeBuoy,
    title: "Hilfe & Sicherheit",
    text: "In der Hilfe-Schublade findest du jederzeit Sicherheitshinweise — und kannst diesen Rundgang erneut starten.",
    target: "help",
  },
];

type TourProps = {
  open: boolean;
  /** Wird beim Schließen aufgerufen; `dontShowAgain` spiegelt die Checkbox. */
  onClose: (dontShowAgain: boolean) => void;
};

const PAD = 8; // Spotlight-Rand um das Ziel
const GAP = 12; // Abstand Ziel ↔ Box
const MARGIN = 12; // Rand zum Viewport
const POPOVER_W = 340;
const EST_POPOVER_H = 240; // Schätzung für oben/unten-Platzierung

/**
 * Onboarding-Tour — ein ruhiger, ankerbasierter „Coach", der zu der erklärten
 * Stelle springt. Kein unscharfer Hintergrund: die erklärte Stelle bleibt über
 * einen Spotlight-Ausschnitt sichtbar (alles außer dem markierten Ziel wird
 * abgedunkelt). Schritte ohne Ziel werden mittig gezeigt.
 * Weiter / Zurück / Überspringen + „Nicht mehr anzeigen".
 */
export function Tour({ open, onClose }: TourProps) {
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const primaryRef = useRef<HTMLButtonElement | null>(null);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const close = useCallback(() => {
    onClose(dontShowAgain);
    setStep(0);
    setDontShowAgain(true);
  }, [onClose, dontShowAgain]);

  const measure = useCallback(() => {
    const el = current.target
      ? document.querySelector(`[data-tour="${current.target}"]`)
      : null;
    setRect(el ? el.getBoundingClientRect() : null);
  }, [current.target]);

  // Ziel ins Bild scrollen und Rect verfolgen (Schrittwechsel, Resize, Scroll).
  useLayoutEffect(() => {
    if (!open) return;
    const el = current.target
      ? document.querySelector(`[data-tour="${current.target}"]`)
      : null;
    el?.scrollIntoView({ block: "center", inline: "center", behavior: "auto" });
    // Synchronous layout read (measure → setRect) to place the spotlight before
    // paint; the rule's "derive during render" advice cannot apply to a DOM
    // measurement (getBoundingClientRect is only valid after layout).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    measure();
    const onChange = () => measure();
    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);
    const raf = requestAnimationFrame(measure);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
      cancelAnimationFrame(raf);
    };
  }, [open, current.target, measure]);

  // Primär-Button beim Öffnen/Schrittwechsel fokussieren; Esc schließt.
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

  const Icon = current.icon;

  // Box-Position: ohne Ziel mittig, sonst neben dem Ziel.
  let popStyle: CSSProperties;
  if (rect) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - POPOVER_W / 2, MARGIN),
      vw - POPOVER_W - MARGIN,
    );
    const placeBelow = rect.bottom + GAP + EST_POPOVER_H <= vh;
    popStyle = placeBelow
      ? { position: "fixed", top: rect.bottom + GAP, left, width: POPOVER_W }
      : {
          position: "fixed",
          bottom: vh - rect.top + GAP,
          left,
          width: POPOVER_W,
        };
  } else {
    popStyle = {
      position: "fixed",
      top: "50%",
      left: "50%",
      width: POPOVER_W,
      transform: "translate(-50%, -50%)",
    };
  }

  return (
    <>
      {/* Abdunkeln: Spotlight-Ausschnitt um das Ziel (kein Blur), sonst Scrim. */}
      {rect ? (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[55] rounded-xl ring-2 ring-accent transition-all duration-200"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
          }}
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[55] bg-black/45"
        />
      )}

      {/* Coach-Box — am Ziel verankert (oder mittig). */}
      <div
        role="dialog"
        aria-modal="false"
        aria-label="Rundgang durch die Bedienung"
        style={popStyle}
        className="z-[60] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-subtle bg-background p-5 shadow-xl motion-safe:animate-[fade-in_140ms_ease-out]"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Icon className="size-5" aria-hidden />
          </span>
          <h2 className="font-serif text-lg text-foreground">
            {current.title}
          </h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {current.text}
        </p>

        <div className="mt-4 flex items-center gap-2">
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

        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(event) => setDontShowAgain(event.target.checked)}
            className="size-4 accent-accent"
          />
          Nicht mehr anzeigen
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
                Fertig
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
    </>
  );
}
