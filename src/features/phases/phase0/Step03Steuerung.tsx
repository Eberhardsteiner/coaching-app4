import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";

/** Phase 0, Step 0.3 — Wer steuert was (informative; "Weiter" is free). */
export function Step03Steuerung({ nav }: { nav: PhaseNavigation }) {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-subtle bg-surface p-4">
          <p className="font-medium text-foreground">
            Du steuerst und entscheidest
          </p>
          <p className="mt-1 text-sm text-muted">
            Du wählst dein Thema und deine Ziele und triffst die Entscheidungen
            — du trägst die Ergebnisverantwortung.
          </p>
        </div>
        <div className="rounded-lg border border-subtle bg-surface p-4">
          <p className="font-medium text-foreground">
            Die App hält die Struktur
          </p>
          <p className="mt-1 text-sm text-muted">
            Sie führt durch die Phasen und stellt Fragen — sie trägt die
            Prozessverantwortung und gibt keine Ratschläge.
          </p>
        </div>
      </div>

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext
      />
    </div>
  );
}
