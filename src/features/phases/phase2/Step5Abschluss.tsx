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
 * Phase 2, Step 2.5 — Abschluss & Check. The shared four-part phase check
 * (optional) bound to phase2.check. "Phase abschließen" advances from the last
 * step → completes Phase 2 → unlocks and navigates to Phase 3.
 */
export function Step5Abschluss({ nav }: { nav: PhaseNavigation }) {
  const check = useSessionStore((s) => s.session?.phase2.check) ?? EMPTY_CHECK;
  const patch = useSessionStore((s) => s.patch);

  function setCheck(next: PhaseCheckValue) {
    patch((s) => ({ ...s, phase2: { ...s.phase2, check: next } }));
  }

  return (
    <div className="space-y-5">
      <p className="text-muted">
        Du hast ein tragfähiges Ziel formuliert. Halte kurz fest, was du
        mitnimmst — dann geht es zu deinen Ressourcen.
      </p>

      <PhaseCheck value={check} onChange={setCheck} />

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext
        nextLabel="Phase abschließen"
      />
    </div>
  );
}
