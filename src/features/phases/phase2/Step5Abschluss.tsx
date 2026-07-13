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
 * Phase 2, Step 2.5 — Abschluss & Check. The method's closing text (the
 * coordinates of the journey are set, insights go onto the Erkenntnisboard),
 * the assembled mantra as a calm card, then the shared four-part phase check
 * bound to phase2.check. "Phase abschließen" completes Phase 2 → unlocks and
 * navigates to Phase 3.
 */
export function Step5Abschluss({ nav }: { nav: PhaseNavigation }) {
  const check = useSessionStore((s) => s.session?.phase2.check) ?? EMPTY_CHECK;
  const goalText = useSessionStore((s) => s.session?.phase2.goalText ?? "");
  const patch = useSessionStore((s) => s.patch);

  function setCheck(next: PhaseCheckValue) {
    patch((s) => ({ ...s, phase2: { ...s.phase2, check: next } }));
  }

  return (
    <div className="space-y-5">
      <p className="text-muted">
        Du hast nun die wichtigen{" "}
        <strong className="font-semibold text-foreground">
          Koordinaten für deine Veränderungsreise
        </strong>{" "}
        bestimmt. Du weißt, wo du stehst, und du weißt, wo du hin möchtest. Du
        bist dir über dein{" "}
        <strong className="font-semibold text-foreground">
          Veränderungsziel
        </strong>{" "}
        sicher, denn du hast dir seine Folgen klar gemacht und ihnen zugestimmt.
        Wenn du Erkenntnisse aus deiner bisherigen Reflexion haben solltest,
        dann notiere sie dir bitte auf deinem{" "}
        <strong className="font-semibold text-foreground">
          Erkenntnisboard
        </strong>{" "}
        <span className="text-sm text-faint">(Notizbuch rechts)</span>.
        Vergegenwärtige dir bitte nochmal die Schritte, wie du zu deinem
        Ergebnis gekommen bist, bevor du mit Phase 3 weitermachst – der
        Identifikation deiner{" "}
        <strong className="font-semibold text-foreground">Ressourcen</strong>,
        die du auf dem Weg zu deinem Ziel brauchen wirst.
      </p>

      {goalText.trim() ? (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-faint">
            Dein Zielsatz
          </p>
          <p className="mt-2 font-medium leading-relaxed text-foreground">
            {goalText.trim()}
          </p>
        </div>
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
