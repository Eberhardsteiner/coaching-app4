import { ArrowDownToLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";

/**
 * Phase 5, Step 5.2 — Erkenntnisse. Free-text takeaways (→ phase5.insights)
 * plus a read-only card with the Erkenntnisboard (session.notebook): one click
 * appends the notebook text to the insights WITHOUT clearing the notebook.
 * The calm core message (learnable, repeatable) stays. No AI here.
 */
export function Step2Erkenntnisse({ nav }: { nav: PhaseNavigation }) {
  const insights = useSessionStore((s) => s.session?.phase5.insights ?? "");
  const notebook = useSessionStore((s) => s.session?.notebook ?? "");
  const patch = useSessionStore((s) => s.patch);

  function setInsights(value: string) {
    patch((s) => ({ ...s, phase5: { ...s.phase5, insights: value } }));
  }

  const notebookText = notebook.trim();
  const alreadyTaken =
    notebookText.length > 0 && insights.includes(notebookText);

  /** Append the notebook to the insights (the notebook itself stays). */
  function takeNotebook() {
    if (!notebookText || alreadyTaken) return;
    setInsights(
      insights.trim() ? `${insights.trim()}\n\n${notebookText}` : notebookText,
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-muted">
        Sammle hier die wichtigsten Erkenntnisse deiner Reise — auch aus deinem
        Erkenntnisboard.
      </p>

      {notebookText ? (
        <div className="space-y-2 rounded-xl border border-subtle bg-surface-2 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-faint">
            Dein Erkenntnisboard
          </p>
          <p className="whitespace-pre-wrap text-sm text-muted">
            {notebookText}
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={alreadyTaken}
            onClick={takeNotebook}
          >
            <ArrowDownToLine />
            {alreadyTaken ? "Übernommen" : "In die Erkenntnisse übernehmen"}
          </Button>
        </div>
      ) : null}

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
          rows={6}
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
