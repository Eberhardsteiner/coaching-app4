import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { GoalComponents } from "@/features/session/types";
import { cn } from "@/lib/utils";

const SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const DEFAULT_COMPONENTS: GoalComponents = {
  futurII: false,
  adressat: false,
  terminiert: false,
  kontextbezug: false,
  loesungsfrei: false,
  emotionalAttraktiv: 0,
  selbstErreichbar: 0,
};

/** The boolean component keys (the two scales are numeric, handled separately). */
type BoolComponentKey =
  | "futurII"
  | "adressat"
  | "terminiert"
  | "kontextbezug"
  | "loesungsfrei";

/** The five boolean checklist items (the two scales are handled separately). */
const CHECKS: { key: BoolComponentKey; label: string; hint: string }[] = [
  {
    key: "futurII",
    label: "Als erreicht formuliert (Futur II)",
    hint: "„… werde ich … erreicht haben.“",
  },
  {
    key: "adressat",
    label: "Adressat ist klar",
    hint: "Es ist klar, worum und um wen es geht.",
  },
  {
    key: "terminiert",
    label: "Terminiert",
    hint: "Ein Datum ist gesetzt.",
  },
  {
    key: "kontextbezug",
    label: "Bezug zum Kernthema",
    hint: "Das Ziel bezieht sich auf dein Kernthema.",
  },
  {
    key: "loesungsfrei",
    label: "Lösungsfrei",
    hint: "Beschreibt einen Zustand — keine Maßnahme, keinen Weg.",
  },
];

/**
 * Phase 2, Step 2.3 — Zielprüfung. A guided component checklist (soft, no hard
 * block) plus the 10/10 stopper: forward only opens when both scales are at 10.
 * Below 10 there are calm sharpening impulses and a way back to the goal.
 */
export function Step3Zielpruefung({ nav }: { nav: PhaseNavigation }) {
  const components =
    useSessionStore((s) => s.session?.phase2.components) ?? DEFAULT_COMPONENTS;
  const datum = useSessionStore((s) => s.session?.phase2.datum ?? "");
  const clusterRef = useSessionStore((s) => s.session?.phase2.clusterRef ?? "");
  const patch = useSessionStore((s) => s.patch);

  function setComponents(partial: Partial<GoalComponents>) {
    patch((s) => ({
      ...s,
      phase2: {
        ...s.phase2,
        components: { ...s.phase2.components, ...partial },
      },
    }));
  }

  const { emotionalAttraktiv, selbstErreichbar } = components;
  const canNext = emotionalAttraktiv === 10 && selbstErreichbar === 10;

  /** Contextual note nudging a checklist item from earlier input. */
  function contextNote(key: BoolComponentKey): string | null {
    if (key === "terminiert" && datum) return "Datum ist gesetzt.";
    if (key === "kontextbezug" && clusterRef)
      return `Kernthema: „${clusterRef}“.`;
    return null;
  }

  return (
    <div>
      <div className="space-y-7">
        {/* Component checklist */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">
            Trägt dein Ziel? Prüfe in Ruhe.
          </legend>
          {CHECKS.map((item) => {
            const checked = Boolean(components[item.key]);
            const note = contextNote(item.key);
            return (
              <label
                key={item.key}
                htmlFor={`comp-${item.key}`}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-subtle bg-surface p-3"
              >
                <input
                  id={`comp-${item.key}`}
                  type="checkbox"
                  checked={checked}
                  onChange={(event) =>
                    setComponents({
                      [item.key]: event.target.checked,
                    } as Partial<GoalComponents>)
                  }
                  className="mt-0.5 size-4 shrink-0 accent-accent"
                />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                    {!checked ? (
                      <span className="text-xs text-amber-600">noch offen</span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {item.hint}
                    {note ? <span className="text-accent"> {note}</span> : null}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>

        {/* 10/10 stopper */}
        <div className="space-y-6 border-t border-subtle pt-6">
          <Scale
            label="Wie emotional attraktiv ist dieses Ziel für dich? (1–10)"
            ariaLabel="Emotional attraktiv von 1 bis 10"
            value={emotionalAttraktiv}
            onChange={(value) => setComponents({ emotionalAttraktiv: value })}
          />
          {emotionalAttraktiv >= 1 && emotionalAttraktiv < 10 ? (
            <Impulse>
              Was müsste sich am Ziel ändern, damit es für dich eine glatte 10
              wird?
            </Impulse>
          ) : null}

          <Scale
            label="Wie sehr liegt die Erreichung in deiner eigenen Hand? (1–10)"
            ariaLabel="Selbst erreichbar von 1 bis 10"
            value={selbstErreichbar}
            onChange={(value) => setComponents({ selbstErreichbar: value })}
          />
          {selbstErreichbar >= 1 && selbstErreichbar < 10 ? (
            <Impulse>
              Was davon liegt wirklich in deiner Hand? Formuliere das Ziel so,
              dass du es aus eigener Kraft erreichen kannst.
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => nav.goTo(2, 1)}
              >
                Ziel anpassen
              </Button>
            </Impulse>
          ) : null}

          {!canNext ? (
            <p className="text-xs text-faint">
              „Weiter“ öffnet sich, wenn beide Skalen auf 10 stehen — ein Ziel,
              das dich wirklich zieht und das du selbst erreichen kannst.
            </p>
          ) : null}
        </div>
      </div>

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext={canNext}
      />
    </div>
  );
}

/** A single 1–10 button scale (keyboard- and screenreader-accessible). */
function Scale({
  label,
  ariaLabel,
  value,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div
        role="group"
        aria-label={ariaLabel}
        className="flex flex-wrap gap-1.5"
      >
        {SCALE.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={value === n}
            aria-label={`${n} von 10`}
            onClick={() => onChange(n)}
            className={cn(
              "size-9 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              value === n
                ? "bg-accent text-white"
                : "bg-surface-2 text-muted hover:text-foreground",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

/** A calm sharpening impulse shown below an under-10 scale. */
function Impulse({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-subtle bg-surface-2 p-4 text-sm text-foreground">
      {children}
    </div>
  );
}
