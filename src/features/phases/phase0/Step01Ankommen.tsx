import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";

/** Phase 0, Step 0.1 — Ankommen & Erwartungen (informative; "Weiter" is free). */
export function Step01Ankommen({ nav }: { nav: PhaseNavigation }) {
  return (
    <div>
      <div className="space-y-4">
        <p className="text-muted">
          In den nächsten Phasen schaust du strukturiert auf ein eigenes Thema —
          von deiner heutigen Situation über ein selbstgewähltes Ziel zu
          konkreten Schritten. Du bestimmst Tempo und Inhalt.
        </p>
        <div className="rounded-lg border border-subtle bg-surface p-4">
          <p className="text-sm font-medium text-foreground">
            Was es von dir braucht
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            <li>Offenheit für neue Blickwinkel</li>
            <li>Ehrlichkeit mit dir selbst</li>
            <li>etwas Zeit und Ruhe</li>
          </ul>
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
