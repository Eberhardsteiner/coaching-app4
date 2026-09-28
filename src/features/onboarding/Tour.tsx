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
  X,
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
    text: "Rechts findest du die Schubladen: Zielsatz, Notizbuch, Modelle und Hilfe. Es ist immer nur eine geöffnet.",
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
const EST_POPOVER_H = 280; // Startwert, bis die echte Höhe gemessen ist
const MOBILE_MAX_W = 640; // darunter: Box als unten/oben angedocktes Blatt

/** Wert in [min, max] klemmen (max < min → min). */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * A1: Box-Position so berechnen, dass sie IMMER vollständig im Viewport liegt.
 * Reihenfolge: unter dem Ziel, über dem Ziel, links, rechts; passt nichts
 * (Ziele in voller Höhe wie Bühne oder Schubladen-Leiste), wird die Box mittig
 * über das Ziel gelegt. Mobil wird sie als Blatt unten (bzw. oben, wenn das
 * Ziel unten liegt) angedockt. Zum Schluss wird immer geklemmt.
 */
function placeBox(
  rect: DOMRect | null,
  boxH: number,
): { top: number; left: number; width: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(POPOVER_W, vw - MARGIN * 2);
  const maxTop = vh - boxH - MARGIN;
  const maxLeft = vw - width - MARGIN;

  if (vw < MOBILE_MAX_W) {
    const targetLow = rect ? rect.top + rect.height / 2 > vh * 0.6 : false;
    const small = rect ? rect.height < vh * 0.5 : true;
    const top = targetLow && small ? MARGIN : maxTop;
    return { top: clamp(top, MARGIN, maxTop), left: MARGIN, width };
  }

  if (!rect) {
    return {
      top: clamp((vh - boxH) / 2, MARGIN, maxTop),
      left: clamp((vw - width) / 2, MARGIN, maxLeft),
      width,
    };
  }

  const centerX = rect.left + rect.width / 2 - width / 2;
  const centerY = rect.top + rect.height / 2 - boxH / 2;
  let top: number;
  let left: number;
  if (rect.bottom + GAP + boxH <= vh - MARGIN) {
    top = rect.bottom + GAP;
    left = centerX;
  } else if (rect.top - GAP - boxH >= MARGIN) {
    top = rect.top - GAP - boxH;
    left = centerX;
  } else if (rect.left - GAP - width >= MARGIN) {
    top = centerY;
    left = rect.left - GAP - width;
  } else if (rect.right + GAP + width <= vw - MARGIN) {
    top = centerY;
    left = rect.right + GAP;
  } else {
    top = centerY;
    left = centerX;
  }
  return {
    top: clamp(top, MARGIN, maxTop),
    left: clamp(left, MARGIN, maxLeft),
    width,
  };
}

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
  const [boxH, setBoxH] = useState<number | null>(null);
  const primaryRef = useRef<HTMLButtonElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const close = useCallback(() => {
    onClose(dontShowAgain);
    setStep(0);
    setDontShowAgain(true);
  }, [onClose, dontShowAgain]);

  /** Ziel-Element; ein Ziel ohne Layout (display:none) gilt als „kein Ziel“. */
  const findTarget = useCallback((): Element | null => {
    if (!current.target) return null;
    const el = document.querySelector(`[data-tour="${current.target}"]`);
    if (!el || el.getClientRects().length === 0) return null;
    return el;
  }, [current.target]);

  const measure = useCallback(() => {
    const el = findTarget();
    setRect(el ? el.getBoundingClientRect() : null);
    if (boxRef.current) setBoxH(boxRef.current.offsetHeight);
  }, [findTarget]);

  // Ziel ins Bild scrollen (nur wenn es nicht ganz sichtbar ist) und Rect
  // verfolgen (Schrittwechsel, Resize, Scroll).
  useLayoutEffect(() => {
    if (!open) return;
    const el = findTarget();
    if (el) {
      const r = el.getBoundingClientRect();
      const visible =
        r.top >= 0 &&
        r.left >= 0 &&
        r.bottom <= window.innerHeight &&
        r.right <= window.innerWidth;
      if (!visible) {
        el.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    }
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
  }, [open, step, findTarget, measure]);

  // Echte Box-Höhe verfolgen (Schriftgröße, Zoom, Textlänge).
  useEffect(() => {
    const box = boxRef.current;
    if (!open || !box || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setBoxH(box.offsetHeight));
    observer.observe(box);
    return () => observer.disconnect();
  }, [open]);

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

  // Box-Position: immer vollständig im Viewport (A1).
  const place = placeBox(rect, boxH ?? EST_POPOVER_H);
  const popStyle: CSSProperties = {
    position: "fixed",
    top: place.top,
    left: place.left,
    width: place.width,
    // Bis zur ersten Messung unsichtbar, damit die Box nicht springt.
    visibility: boxH === null ? "hidden" : "visible",
  };

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

      {/* Coach-Box — am Ziel verankert, immer im Viewport (A1). Aufbau: Kopf
          (mit Schließen-X) · scrollbarer Inhalt · fest stehende Buttonleiste,
          damit „Weiter“ und „Schließen“ nie aus dem Bild fallen. */}
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="false"
        aria-label="Rundgang durch die Bedienung"
        style={popStyle}
        className="z-[60] flex max-h-[calc(100dvh-1.5rem)] flex-col rounded-2xl border border-subtle bg-background shadow-xl motion-safe:animate-[fade-in_140ms_ease-out]"
      >
        <div className="flex shrink-0 items-center gap-3 p-5 pb-0">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Icon className="size-5" aria-hidden />
          </span>
          <h2 className="min-w-0 flex-1 font-serif text-lg text-foreground">
            {current.title}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Rundgang schließen"
            title="Schließen"
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5">
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
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-subtle p-4 pt-3 mt-3">
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
