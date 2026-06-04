import { Phase0View } from "@/features/phases/phase0/Phase0View";
import { Phase1View } from "@/features/phases/phase1/Phase1View";
import { PlaceholderPhase } from "@/features/phases/PlaceholderPhase";
import { usePhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";

/**
 * Renders the current phase step in the stage: a generic step header (phase
 * name + "Schritt X von Y" + anmoderation) followed by the phase body. Replaces
 * the old SessionView placeholder.
 */
export function PhaseContainer() {
  const session = useSessionStore((s) => s.session);
  const nav = usePhaseNavigation();

  if (!session) return null;

  const { phaseDef, stepIndex, stepCount } = nav;
  const stepDef = phaseDef.steps[stepIndex];

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-faint">
          {phaseDef.title}
        </p>
        <h2 className="mt-1 font-serif text-2xl text-foreground sm:text-3xl">
          {stepDef.title}
        </h2>
        <p className="mt-1 text-xs text-muted">
          Schritt {stepIndex + 1} von {stepCount}
        </p>
        {stepDef.intro ? (
          <p className="mt-3 text-muted">{stepDef.intro}</p>
        ) : null}
      </header>

      <div className="flex-1">
        {phaseDef.id === 0 ? (
          <Phase0View nav={nav} />
        ) : phaseDef.id === 1 ? (
          <Phase1View nav={nav} />
        ) : (
          <PlaceholderPhase nav={nav} />
        )}
      </div>
    </div>
  );
}
