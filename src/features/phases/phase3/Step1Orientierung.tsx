import { ChevronDown, LayoutDashboard } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ContentLoadState } from "@/features/content/ContentLoadState";
import { useModel } from "@/features/content/useModel";
import { KompetenzZwiebel } from "@/features/phases/phase3/KompetenzZwiebel";
import { RessourcenCockpitOverlay } from "@/features/phases/phase3/RessourcenCockpit";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";

/**
 * Anmoderation — sichtbar (VOICE-1, Methodik-Wortlaut), K1: zwei Absätze;
 * die zwei Kern-Anweisungen stehen darunter als abgesetzte Merkzeilen.
 */
const INTRO_ABSAETZE = [
  "Im Coaching sind Ressourcen immer zuallererst deine inneren Ressourcen — alles, was du an Fähigkeiten und Kompetenzen in dir trägst. Aber auch die Motive und Werte, die dich als Persönlichkeit ausmachen und deinen inneren Kompass steuern.",
  "Als Orientierungshilfe findest du hier unser Kompetenzmodell, das der Ressourcenanalyse zugrunde liegt. Sieh es dir einmal an.",
];

/**
 * Phase 3, Step 3.1 — Orientierung. The method's competence model as the
 * interactive onion graphic (K2 — elements loaded from kompetenzmodell.json
 * so the content layer stays the single source for model wording; the former
 * table survives as the collapsible text alternative) plus the goal sentence
 * as Bewertungsmaßstab and a preview pointer to the cockpit.
 */
export function Step1Orientierung({ nav }: { nav: PhaseNavigation }) {
  const goalText = useSessionStore((s) => s.session?.phase2.goalText ?? "");
  const loaded = useModel("kompetenzmodell");
  const [cockpitOpen, setCockpitOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="max-w-prose space-y-2 text-muted">
        {INTRO_ABSAETZE.map((absatz) => (
          <p key={absatz}>{absatz}</p>
        ))}
        <p className="font-medium text-foreground">
          <strong className="font-semibold">
            Du beginnst von innen nach außen.
          </strong>
        </p>
        <p className="font-medium text-foreground">
          <strong className="font-semibold">
            Bitte halte deinen Zielsatz bereit
          </strong>{" "}
          — du brauchst ihn als Bewertungsmaßstab.
        </p>
      </div>

      {/* Der Zielsatz — durchgehender Bewertungsmaßstab dieser Phase. */}
      {goalText.trim() ? (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-faint">
            Dein Zielsatz — dein Bewertungsmaßstab
          </p>
          <p className="mt-2 font-medium leading-relaxed break-words text-foreground">
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
          <p className="mt-1 text-sm text-muted">
            Von innen nach außen — dein Startpunkt für die Ressourcenanalyse.
            Tippe ein Element an, um seine Beschreibung zu sehen.
          </p>
          <div className="mt-3">
            <KompetenzZwiebel terms={loaded.model.terms} />
          </div>

          {/* Text-Alternative: alle Elemente als Liste (die frühere Tabelle). */}
          <details className="group mt-3">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-accent">
              <ChevronDown
                className="size-3.5 motion-safe:transition-transform group-open:rotate-180"
                aria-hidden
              />
              Alle Elemente als Liste
            </summary>
            <table className="mt-2 w-full table-fixed text-sm">
              <caption className="sr-only">
                Die zehn Elemente des Kompetenzmodells
              </caption>
              <tbody>
                {loaded.model.terms.map((term) => (
                  <tr key={term.id} className="border-t border-subtle">
                    <th
                      scope="row"
                      className="break-words py-2 pr-3 text-left align-top font-medium text-foreground"
                    >
                      {term.label}
                    </th>
                    <td className="break-words py-2 text-muted">{term.hint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
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
