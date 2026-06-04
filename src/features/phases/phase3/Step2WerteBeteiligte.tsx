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

/**
 * Phase 3, Step 3.2 — Werte der Beteiligten. A list of the values/interests of
 * the (generic) people around the core theme → phase3.othersValues. No names.
 */
export function Step2WerteBeteiligte({ nav }: { nav: PhaseNavigation }) {
  const othersValues = useSessionStore(
    (s) => s.session?.phase3.othersValues ?? [],
  );
  const patch = useSessionStore((s) => s.patch);
  const core = useCoreTheme();
  const label = coreThemeLabel(core);

  function setOthersValues(next: ResourceItem[]) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, othersValues: next } }));
  }

  return (
    <div className="space-y-5">
      <p className="text-muted">
        Welche Werte und Interessen haben die Menschen rund um dein Kernthema „
        {label}“? Was ist ihnen wichtig?
      </p>

      <ResourceListEditor
        items={othersValues}
        onItemsChange={setOthersValues}
        addLabel="Wert / Interesse"
        placeholder="z. B. mein Team: Verlässlichkeit"
        itemLabel="Wert / Interesse"
        emptyHint="Noch nichts erfasst."
      />

      <NoPersonalDataHint example="mein Team" />

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext
      />
    </div>
  );
}
