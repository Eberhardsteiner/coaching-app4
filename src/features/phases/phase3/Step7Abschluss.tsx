import { PhaseCheck } from "@/features/phases/PhaseCheck";
import {
  coreThemeLabel,
  useCoreTheme,
} from "@/features/phases/phase2/useCoreTheme";
import { countPolarities } from "@/features/phases/phase3/resourceFields";
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
 * Phase 3, Step 3.7 — Abschluss & Check. The shared four-part check bound to
 * phase3.check + a short summary (core theme, förderlich/hinderlich counts).
 * "Phase abschließen" advances from the last step → completes Phase 3 → unlocks
 * and navigates to Phase 4.
 */
export function Step7Abschluss({ nav }: { nav: PhaseNavigation }) {
  const check = useSessionStore((s) => s.session?.phase3.check) ?? EMPTY_CHECK;
  const phase3 = useSessionStore((s) => s.session?.phase3);
  const patch = useSessionStore((s) => s.patch);
  const core = useCoreTheme();
  const label = coreThemeLabel(core);

  const counts = phase3
    ? countPolarities(phase3)
    : { foerderlich: 0, hinderlich: 0, offen: 0, total: 0 };

  function setCheck(next: PhaseCheckValue) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, check: next } }));
  }

  return (
    <div className="space-y-5">
      <p className="text-muted">
        Du hast deine Ressourcen gesammelt und sortiert. Halte kurz fest, was du
        mitnimmst — dann geht es zum Handlungsplan.
      </p>

      <p className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm text-foreground">
        Kernthema: <span className="font-semibold">{label}</span> ·{" "}
        {counts.foerderlich} förderliche, {counts.hinderlich} hinderliche
        Ressourcen
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
