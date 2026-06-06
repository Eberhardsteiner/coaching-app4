import { useState } from "react";

import { Phase0View } from "@/features/phases/phase0/Phase0View";
import { Phase1View } from "@/features/phases/phase1/Phase1View";
import { Phase2View } from "@/features/phases/phase2/Phase2View";
import { Phase3View } from "@/features/phases/phase3/Phase3View";
import { Phase4View } from "@/features/phases/phase4/Phase4View";
import { Phase5View } from "@/features/phases/phase5/Phase5View";
import { SessionComplete } from "@/features/phases/phase5/SessionComplete";
import { PhaseStart } from "@/features/phases/PhaseStart";
import { getPhaseStart } from "@/features/phases/phaseStarts";
import { PlaceholderPhase } from "@/features/phases/PlaceholderPhase";
import { usePhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { usePhaseStartGate } from "@/features/phases/usePhaseStartGate";
import { useSessionStore } from "@/features/session/sessionStore";
import type { PhaseId } from "@/features/session/types";

const LAST_PHASE: PhaseId = 5;

/**
 * Renders the current phase step in the stage: a generic step header (phase
 * name + "Schritt X von Y" + anmoderation) followed by the phase body. Once the
 * whole 5+1 process is complete, the stage shows the calm session-complete view
 * instead (unless the user chose to re-open Phase 5).
 */
export function PhaseContainer() {
  const session = useSessionStore((s) => s.session);
  const patch = useSessionStore((s) => s.patch);
  const nav = usePhaseNavigation();
  const [reviewing, setReviewing] = useState(false);

  // Phase opening screen (once per phase, before the work steps). Only phases
  // with registered start content show one; the kv-backed gate prevents loops.
  const startContent = getPhaseStart(nav.phaseDef.id);
  const onStartScreen = startContent !== undefined && nav.stepIndex === 0;
  const { seen: startSeen, markSeen: markStartSeen } = usePhaseStartGate(
    nav.phaseDef.id,
    onStartScreen,
  );

  if (!session) return null;

  const isComplete = session.progress.completedPhases.includes(LAST_PHASE);

  /** Mark Phase 5 (and thus the whole process) complete. */
  function completeSession() {
    patch((s) => ({
      ...s,
      progress: {
        ...s.progress,
        completedPhases: s.progress.completedPhases.includes(LAST_PHASE)
          ? s.progress.completedPhases
          : [...s.progress.completedPhases, LAST_PHASE].sort((a, b) => a - b),
      },
    }));
    setReviewing(false);
  }

  // Session complete + on the last phase → calm completion view (no step header).
  if (isComplete && nav.progress.phase === LAST_PHASE && !reviewing) {
    return (
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
        <SessionComplete onReview={() => setReviewing(true)} />
      </div>
    );
  }

  // Editorial phase opening screen — shown once when entering the phase.
  if (onStartScreen && startContent && startSeen !== true) {
    if (startSeen === null) {
      // kv read in flight — render an empty stage briefly to avoid a flash.
      return <div className="h-full w-full" aria-hidden />;
    }
    return (
      <PhaseStart
        {...startContent}
        onStart={markStartSeen}
        onBack={nav.canGoBack ? nav.goPrevStep : undefined}
      />
    );
  }

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
        ) : phaseDef.id === 2 ? (
          <Phase2View nav={nav} />
        ) : phaseDef.id === 3 ? (
          <Phase3View nav={nav} />
        ) : phaseDef.id === 4 ? (
          <Phase4View nav={nav} />
        ) : phaseDef.id === 5 ? (
          <Phase5View nav={nav} onComplete={completeSession} />
        ) : (
          <PlaceholderPhase nav={nav} />
        )}
      </div>
    </div>
  );
}
