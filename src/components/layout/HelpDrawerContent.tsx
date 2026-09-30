import { CircleHelp } from "lucide-react";

import { ContactCard } from "@/components/ContactCard";
import { Button } from "@/components/ui/button";
import { ContentLoadState } from "@/features/content/ContentLoadState";
import {
  useSchrittHilfen,
  type SchrittHilfe,
} from "@/features/content/schrittHilfe";
import { getPhaseDef } from "@/features/phases/phaseConfig";
import { SafetyNotice } from "@/features/safety/SafetyNotice";
import { useSessionStore } from "@/features/session/sessionStore";

type HelpDrawerContentProps = {
  /** Opens the general Bedienungshilfe (same as the „?“ in the top bar). */
  onOpenBedienhilfe: () => void;
};

/** Teil 2.2: die fünf Abschnitte jedes Hilfetexts in fester Reihenfolge. */
const ABSCHNITTE: { feld: keyof SchrittHilfe; titel: string }[] = [
  { feld: "worum", titel: "Worum es geht" },
  { feld: "eintragen", titel: "Was du einträgst" },
  { feld: "beispiel", titel: "Beispiel" },
  { feld: "fehler", titel: "Typische Fehler" },
  { feld: "weiter", titel: "Wie es weitergeht" },
];

/** Hilfe, sobald alle Phasen abgeschlossen sind. */
const HILFE_ABGESCHLOSSEN =
  "Du hast alle Phasen abgeschlossen. Über die Phasenleiste oben kannst du jede Phase noch einmal ansehen. Die Zusammenfassung findest du in der Schublade „Zielsatz“.";

/**
 * Teil 2.1/2.2: die Hilfe zum aktuellen Schritt aus
 * public/content/hilfe-schritte.json. Fehlt ein Eintrag oder lädt die Datei
 * nicht, steht die Kurzbeschreibung des Schritts aus phaseConfig da.
 */
function StepHelp() {
  const progress = useSessionStore((s) => s.session?.progress);
  const loaded = useSchrittHilfen();
  if (!progress) return null;

  // Nach dem Abschluss steht in Phase 5 zusätzlich ein Hinweis, die Hilfe
  // zum angezeigten Schritt bleibt in jeder Phase erreichbar.
  const abgeschlossen =
    progress.completedPhases.includes(5) && progress.phase === 5;

  const phaseDef = getPhaseDef(progress.phase);
  const index = Math.min(Math.max(progress.step, 0), phaseDef.steps.length - 1);
  const step = phaseDef.steps[index];
  const eintrag = loaded.hilfen?.[step.id];
  // Ein Eintrag ohne jeden Text (z. B. Tippfehler im Feldnamen) zählt nicht.
  const hilfe =
    eintrag && ABSCHNITTE.some(({ feld }) => eintrag[feld]) ? eintrag : null;

  return (
    <section aria-label="Hilfe zu diesem Schritt" className="space-y-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-faint">
          Hilfe zu diesem Schritt
        </p>
        <p className="mt-0.5 font-medium text-foreground">
          {step.id} {step.title}
        </p>
        <p className="text-xs text-faint">{phaseDef.title}</p>
      </div>
      {abgeschlossen ? (
        <p className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-muted">
          {HILFE_ABGESCHLOSSEN}
        </p>
      ) : null}
      {loaded.status === "loading" ? (
        <ContentLoadState
          status="loading"
          onRetry={loaded.retry}
          loadingLabel="Hilfe wird geladen …"
        />
      ) : hilfe ? (
        ABSCHNITTE.filter(({ feld }) => hilfe[feld]).map(({ feld, titel }) => (
          <div key={feld} className="space-y-0.5">
            <h3 className="text-sm font-semibold text-foreground">{titel}</h3>
            <p className="text-sm text-muted">{hilfe[feld]}</p>
          </div>
        ))
      ) : (
        <>
          {step.intro ? (
            <p className="text-sm text-muted">{step.intro}</p>
          ) : null}
          {loaded.status === "error" ? (
            <ContentLoadState
              status="error"
              error={loaded.error}
              onRetry={loaded.retry}
            />
          ) : null}
        </>
      )}
    </section>
  );
}

/**
 * Content of the Hilfe drawer (rail „Hilfe“, Teil 2.1): the help for the
 * current step first, then the way to the general Bedienungshilfe, the
 * reusable SafetyNotice (kept permanently reachable) and the contact card.
 */
export function HelpDrawerContent({
  onOpenBedienhilfe,
}: HelpDrawerContentProps) {
  return (
    <div className="space-y-5">
      <StepHelp />

      <Button variant="outline" size="sm" onClick={onOpenBedienhilfe}>
        <CircleHelp />
        Bedienungshilfe zur App
      </Button>

      <div className="border-t border-subtle pt-4">
        <SafetyNotice />
      </div>

      <ContactCard />
    </div>
  );
}
