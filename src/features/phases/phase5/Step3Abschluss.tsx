import { PhaseCheck } from "@/features/phases/PhaseCheck";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { PhaseCheck as PhaseCheckValue } from "@/features/session/types";

const EMPTY_CHECK: PhaseCheckValue = {
  result: "",
  process: "",
  insight: "",
  transfer: "",
};

/**
 * Phase 5, Step 5.3 — Abschluss & Check. The shared four-part check bound to
 * phase5.check. "Sitzung abschließen" (via onComplete) marks Phase 5 complete —
 * this is the last phase, so the container then shows the completion view.
 */
export function Step3Abschluss({
  nav,
  onComplete,
}: {
  nav: PhaseNavigation;
  onComplete: () => void;
}) {
  const check = useSessionStore((s) => s.session?.phase5.check) ?? EMPTY_CHECK;
  const patch = useSessionStore((s) => s.patch);

  function setCheck(next: PhaseCheckValue) {
    patch((s) => ({ ...s, phase5: { ...s.phase5, check: next } }));
  }

  return (
    <div className="space-y-5">
      <p className="text-muted">
        Du hast den ganzen Weg gemacht — von deiner Situation über ein Ziel und
        deine Ressourcen bis zu konkreten Schritten und einer Strategie,
        dranzubleiben. Halte fest, was du mitnimmst.
      </p>

      <PhaseCheck value={check} onChange={setCheck} />

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={onComplete}
        canNext
        nextLabel="Sitzung abschließen"
      />
    </div>
  );
}
