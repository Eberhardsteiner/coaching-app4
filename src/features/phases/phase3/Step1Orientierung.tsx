import { LayoutDashboard } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ContentLoadState } from "@/features/content/ContentLoadState";
import { useModel } from "@/features/content/useModel";
import { RessourcenCockpitOverlay } from "@/features/phases/phase3/RessourcenCockpit";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";

/** Anmoderation — sichtbar (VOICE-1, Methodik-Wortlaut). */
const INTRO_VOLLTEXT =
  "Im Coaching sind Ressourcen immer zuallererst deine inneren Ressourcen — alles, was du an Fähigkeiten und Kompetenzen in dir trägst. Aber auch die Motive und Werte, die dich als Persönlichkeit ausmachen und deinen inneren Kompass steuern. Als Orientierungshilfe findest du hier unser Kompetenzmodell, das der Ressourcenanalyse zugrunde liegt. Sieh es dir einmal an. Du beginnst von innen nach außen. Bitte halte deinen Zielsatz bereit — du brauchst ihn als Bewertungsmaßstab.";

/**
 * Decorative onion sketch — the competence model reads from the inside out.
 * Purely aria-hidden; the table below carries the actual content.
 */
function OnionSketch() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="mx-auto h-auto w-40"
      aria-hidden="true"
      focusable="false"
    >
      {[88, 68, 48, 28].map((r, index) => (
        <circle
          key={r}
          cx={100}
          cy={100}
          r={r}
          strokeWidth={1.25}
          className={
            index === 3
              ? "fill-accent/15 stroke-accent/50"
              : "fill-none stroke-accent/25"
          }
        />
      ))}
      <circle cx={100} cy={100} r={10} className="fill-accent/80" />
    </svg>
  );
}

/**
 * Phase 3, Step 3.1 — Orientierung. The method's competence model (10
 * elements, von innen nach außen — loaded from kompetenzmodell.json so the
 * content layer stays the single source for model wording) plus the goal
 * sentence as Bewertungsmaßstab and a preview pointer to the cockpit.
 */
export function Step1Orientierung({ nav }: { nav: PhaseNavigation }) {
  const goalText = useSessionStore((s) => s.session?.phase2.goalText ?? "");
  const loaded = useModel("kompetenzmodell");
  const [cockpitOpen, setCockpitOpen] = useState(false);

  return (
    <div className="space-y-6">
      <p className="text-muted">{INTRO_VOLLTEXT}</p>

      {/* Der Zielsatz — durchgehender Bewertungsmaßstab dieser Phase. */}
      {goalText.trim() ? (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-faint">
            Dein Zielsatz — dein Bewertungsmaßstab
          </p>
          <p className="mt-2 font-medium leading-relaxed text-foreground">
            {goalText.trim()}
          </p>
        </div>
      ) : (
        <p className="rounded-lg border border-subtle bg-surface-2 p-3 text-sm text-muted">
          Noch kein Zielsatz aus Phase 2 — er ist der Bewertungsmaßstab dieser
          Phase.
        </p>
      )}

      {/* Kompetenzmodell (10 Elemente, von innen nach außen) */}
      {loaded.status === "loading" || loaded.status === "error" ? (
        <ContentLoadState
          status={loaded.status}
          error={loaded.error}
          onRetry={loaded.retry}
          loadingLabel="Kompetenzmodell wird geladen …"
        />
      ) : loaded.model ? (
        <div className="rounded-xl border border-subtle bg-surface p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Das Kompetenzmodell
          </h3>
          <p className="mt-1 text-xs text-muted">
            Von innen nach außen — dein Startpunkt für die Ressourcenanalyse.
          </p>
          <OnionSketch />
          <table className="mt-2 w-full text-sm">
            <caption className="sr-only">
              Die zehn Elemente des Kompetenzmodells
            </caption>
            <tbody>
              {loaded.model.terms.map((term) => (
                <tr key={term.id} className="border-t border-subtle">
                  <th
                    scope="row"
                    className="py-2 pr-3 text-left align-top font-medium text-foreground"
                  >
                    {term.label}
                  </th>
                  <td className="py-2 text-muted">{term.hint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Cockpit preview */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-subtle bg-surface-2 p-4">
        <p className="text-sm text-muted">
          Dein Ressourcen-Cockpit füllt sich in den nächsten Schritten — du
          findest es jederzeit in den Werkzeugen.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCockpitOpen(true)}
        >
          <LayoutDashboard />
          Cockpit ansehen
        </Button>
      </div>

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext
      />

      <RessourcenCockpitOverlay
        open={cockpitOpen}
        onClose={() => setCockpitOpen(false)}
      />
    </div>
  );
}
