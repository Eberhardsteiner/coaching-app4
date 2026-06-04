import { Button } from "@/components/ui/button";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import {
  coreThemeLabel,
  useCoreTheme,
} from "@/features/phases/phase2/useCoreTheme";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";

/**
 * Phase 2, Step 2.1 — Wunsch & Vision. Free text describing the desired state
 * (not the path) in relation to Phase 1's core theme. No AI here.
 */
export function Step1Vision({ nav }: { nav: PhaseNavigation }) {
  const vision = useSessionStore((s) => s.session?.phase2.vision ?? "");
  const patch = useSessionStore((s) => s.patch);
  const core = useCoreTheme();

  function setVision(value: string) {
    patch((s) => ({ ...s, phase2: { ...s.phase2, vision: value } }));
  }

  // Exceptional: no core theme (gating should prevent this).
  if (!core) {
    return (
      <div>
        <div className="rounded-xl border border-subtle bg-surface-2 p-5">
          <p className="text-sm text-foreground">
            Für diese Phase fehlt dein Kernthema aus Phase 1. Geh kurz zurück
            und lege dort ein gewichtetes Cluster als Kernthema fest.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => nav.goToPhase(1)}
          >
            Zurück zu Phase 1
          </Button>
        </div>
      </div>
    );
  }

  const label = coreThemeLabel(core);

  return (
    <div>
      <div className="space-y-5">
        <p className="text-muted">
          Was strebst du an — in Bezug auf dein Kernthema „{label}“? Beschreibe
          den gewünschten Zustand, nicht den Weg dorthin.
        </p>

        <div className="space-y-2">
          <label
            htmlFor="phase2-vision"
            className="block text-sm font-medium text-foreground"
          >
            Dein Wunsch
          </label>
          <textarea
            id="phase2-vision"
            value={vision}
            rows={4}
            onChange={(event) => setVision(event.target.value)}
            placeholder="Wenn alles gut läuft, dann …"
            className="w-full resize-y rounded-lg border border-subtle bg-surface px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <NoPersonalDataHint />
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
