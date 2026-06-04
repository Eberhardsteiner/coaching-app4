import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";

/**
 * Reusable "Folgt" placeholder for a not-yet-built step inside an otherwise
 * partially-built phase. Allows back navigation and forward only when this is
 * not the last step — so a phase with placeholder tail steps cannot be completed
 * yet (the next phase stays locked).
 */
export function StepPlaceholder({ nav }: { nav: PhaseNavigation }) {
  return (
    <div>
      <div className="rounded-xl border border-dashed border-subtle bg-surface p-10 text-center">
        <p className="font-serif text-xl text-foreground">Folgt</p>
        <p className="mt-2 text-sm text-muted">
          Dieser Schritt wird im nächsten Paket gebaut.
        </p>
      </div>
      <div className="mt-8 flex items-center justify-between gap-3 border-t border-subtle pt-5">
        <Button
          variant="ghost"
          onClick={nav.goPrevStep}
          disabled={!nav.canGoBack}
        >
          <ArrowLeft />
          Zurück
        </Button>
        {!nav.isLastStep ? (
          <Button onClick={nav.advance}>
            Weiter
            <ArrowRight />
          </Button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
