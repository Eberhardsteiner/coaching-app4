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
 * Phase 1, Step 1.5 — Abschluss & Check. The unified four-part phase check
 * (optional, no hard block) plus a short summary of the core theme. "Phase
 * abschließen" advances from the last step, which completes Phase 1 (adds it to
 * completedPhases) and moves on to Phase 2.
 */
export function Step5Abschluss({ nav }: { nav: PhaseNavigation }) {
  const check = useSessionStore((s) => s.session?.phase1.check) ?? EMPTY_CHECK;
  const clusters = useSessionStore((s) => s.session?.phase1.clusters ?? []);
  const patch = useSessionStore((s) => s.patch);

  const core = clusters.find((c) => c.isCore);
  const coreName = core?.name.trim();

  function setCheck(next: PhaseCheckValue) {
    patch((s) => ({ ...s, phase1: { ...s.phase1, check: next } }));
  }

  return (
    <div className="space-y-5">
      <p className="text-muted">
        Du hast deine Situation sortiert und gewichtet. Halte kurz fest, was du
        mitnimmst — dann geht es zur Zielphase.
      </p>

      {core ? (
        <p className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm text-foreground">
          Dein Kernthema:{" "}
          <span className="font-semibold">
            {coreName || "dein stärkstes Cluster (noch ohne Namen)"}
          </span>
        </p>
      ) : null}

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
