import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Step1Gefuehl } from "@/features/phases/phase1/Step1Gefuehl";
import { Step2Zusammenhaenge } from "@/features/phases/phase1/Step2Zusammenhaenge";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";

/**
 * Phase 1 — IST verstehen. Steps 1.1 (Gefühl) and 1.2 (Zusammenhänge) are built;
 * steps 1.3 and 1.4 are placeholders (next prompt). The last step has no forward
 * yet, so Phase 1 cannot be completed and Phase 2 stays locked.
 */
export function Phase1View({ nav }: { nav: PhaseNavigation }) {
  if (nav.stepIndex === 0) return <Step1Gefuehl nav={nav} />;
  if (nav.stepIndex === 1) return <Step2Zusammenhaenge nav={nav} />;

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
