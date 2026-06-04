import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";

/**
 * Placeholder body for phases 1–5 (built in later prompts). Offers only a way
 * back — there is no forward, since future phases aren't unlocked yet.
 */
export function PlaceholderPhase({ nav }: { nav: PhaseNavigation }) {
  return (
    <div>
      <div className="rounded-xl border border-dashed border-subtle bg-surface p-10 text-center">
        <p className="font-serif text-xl text-foreground">Inhalt folgt</p>
        <p className="mt-2 text-sm text-muted">
          Diese Phase wird in einem der nächsten Schritte gebaut.
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
        <span />
      </div>
    </div>
  );
}
