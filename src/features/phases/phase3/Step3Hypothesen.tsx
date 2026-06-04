import { KiImpuls } from "@/features/ai/KiImpuls";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import {
  coreThemeLabel,
  useCoreTheme,
} from "@/features/phases/phase2/useCoreTheme";
import { ResourceListEditor } from "@/features/phases/phase3/ResourceListEditor";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { ResourceItem } from "@/features/session/types";

/** Assemble the socratic, advice-free impulse prompt from the session. */
function buildPrompt(coreLabel: string, goalText: string): string {
  const goal = goalText.trim() || "(noch offen)";
  return (
    `Ich arbeite an einem persönlichen Ziel und möchte eigene Ressourcen ` +
    `entdecken. Mein Kernthema: «${coreLabel}». Mein Ziel: «${goal}». Bitte ` +
    `stelle mir 5–7 offene, wertfreie Fragen, die mir helfen, eigene Stärken, ` +
    `Erfahrungen und Unterstützungsquellen für dieses Ziel zu erkennen. Gib ` +
    `mir keine Ratschläge und keine Lösungen — nur Fragen. Antworte auf Deutsch.`
  );
}

/**
 * Phase 3, Step 3.3 — Hypothesen & Impulse. The first AI touchpoint. In the
 * `self` branch the reusable KiImpuls block generates a copy-only socratic
 * prompt; in the `coached` branch the coach guides this and the same list just
 * captures what emerges. Both write phase3.hypotheses. No API call here.
 */
export function Step3Hypothesen({ nav }: { nav: PhaseNavigation }) {
  const branch = useSessionStore((s) => s.session?.meta.branch);
  const goalText = useSessionStore((s) => s.session?.phase2.goalText ?? "");
  const hypotheses = useSessionStore((s) => s.session?.phase3.hypotheses ?? []);
  const patch = useSessionStore((s) => s.patch);
  const core = useCoreTheme();
  const label = coreThemeLabel(core);

  function setHypotheses(next: ResourceItem[]) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, hypotheses: next } }));
  }

  return (
    <div className="space-y-5">
      <p className="text-muted">
        Manchmal helfen gute Fragen, eigene Ressourcen zu entdecken. Hol dir
        Impulse — und bring zurück, was dich weiterbringt.
      </p>

      {branch === "coached" ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-subtle bg-surface-2 p-4 text-sm text-foreground">
            Diesen Schritt begleitet dein Coach. Halte hier fest, welche Impulse
            und Hypothesen dabei entstehen.
          </div>
          <ResourceListEditor
            items={hypotheses}
            onItemsChange={setHypotheses}
            addLabel="Hypothese / Impuls"
            placeholder="eine Hypothese, eine Ressource …"
            itemLabel="Hypothese / Impuls"
            emptyHint="Noch nichts erfasst."
          />
          <NoPersonalDataHint />
        </div>
      ) : (
        <KiImpuls
          promptText={buildPrompt(label, goalText)}
          items={hypotheses}
          onItemsChange={setHypotheses}
          captureLabel="Hypothese / Impuls"
        />
      )}

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext
      />
    </div>
  );
}
