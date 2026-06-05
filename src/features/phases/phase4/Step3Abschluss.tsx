import { PhaseCheck } from "@/features/phases/PhaseCheck";
import {
  coreThemeLabel,
  useCoreTheme,
} from "@/features/phases/phase2/useCoreTheme";
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
 * Phase 4, Step 4.3 — Abschluss & Check. The shared four-part check bound to
 * phase4.check + a short summary (core theme, total measure count). "Phase
 * abschließen" advances from the last step → completes Phase 4 → unlocks and
 * navigates to Phase 5.
 */
export function Step3Abschluss({ nav }: { nav: PhaseNavigation }) {
  const check = useSessionStore((s) => s.session?.phase4.check) ?? EMPTY_CHECK;
  const plans = useSessionStore((s) => s.session?.phase4.plans ?? []);
  const patch = useSessionStore((s) => s.patch);
  const core = useCoreTheme();
  const label = coreThemeLabel(core);

  const measureCount = plans.reduce((sum, p) => sum + p.measures.length, 0);

  function setCheck(next: PhaseCheckValue) {
    patch((s) => ({ ...s, phase4: { ...s.phase4, check: next } }));
  }

  return (
    <div className="space-y-5">
      <p className="text-muted">
        Du hast einen Plan. Halte kurz fest, was du mitnimmst — dann geht es um
        die Nachhaltigkeit.
      </p>

      <p className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm text-foreground">
        Kernthema: <span className="font-semibold">{label}</span> ·{" "}
        {measureCount} {measureCount === 1 ? "Maßnahme" : "Maßnahmen"}
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
