import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";

/**
 * Phase 5, Step 5.2 — Erkenntnisse. Free-text takeaways (→ phase5.insights) plus
 * the calm, strengthening core message that the process is learnable and
 * repeatable (no dependency). No AI here.
 */
export function Step2Erkenntnisse({ nav }: { nav: PhaseNavigation }) {
  const insights = useSessionStore((s) => s.session?.phase5.insights ?? "");
  const patch = useSessionStore((s) => s.patch);

  function setInsights(value: string) {
    patch((s) => ({ ...s, phase5: { ...s.phase5, insights: value } }));
  }

  return (
    <div className="space-y-5">
      <p className="text-muted">Was nimmst du aus diesem Prozess mit?</p>

      <div className="space-y-2">
        <label
          htmlFor="phase5-insights"
          className="block text-sm font-medium text-foreground"
        >
          Deine Erkenntnisse
        </label>
        <textarea
          id="phase5-insights"
          value={insights}
          rows={4}
          onChange={(event) => setInsights(event.target.value)}
          placeholder="Was hat sich verändert? Was möchtest du dir merken?"
          className="w-full resize-y rounded-lg border border-subtle bg-surface px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <NoPersonalDataHint />
      </div>

      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm text-foreground">
        Dieser Prozess ist erlernbar und wiederholbar — du kannst ihn jederzeit
        selbst wieder gehen.
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
