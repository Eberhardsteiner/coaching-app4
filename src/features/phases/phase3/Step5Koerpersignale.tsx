import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { ResourceListEditor } from "@/features/phases/phase3/ResourceListEditor";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { ResourceItem } from "@/features/session/types";

/**
 * Phase 3, Step 3.5 — Körpersignale. A calm, non-pathologising list of bodily
 * signals that show what feels coherent or not (→ phase3.somaticMarkers). It is
 * about perception, not symptoms. No AI here.
 */
export function Step5Koerpersignale({ nav }: { nav: PhaseNavigation }) {
  const somaticMarkers = useSessionStore(
    (s) => s.session?.phase3.somaticMarkers ?? [],
  );
  const patch = useSessionStore((s) => s.patch);

  function setSomaticMarkers(next: ResourceItem[]) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, somaticMarkers: next } }));
  }

  return (
    <div className="space-y-5">
      <p className="text-muted">
        Manchmal zeigt der Körper, was sich stimmig oder unstimmig anfühlt.
        Welche Körpersignale nimmst du wahr, wenn du an dein Ziel denkst?
      </p>

      <ResourceListEditor
        items={somaticMarkers}
        onItemsChange={setSomaticMarkers}
        addLabel="Körpersignal"
        placeholder="z. B. ruhiger Atem, wenn ich daran denke"
        itemLabel="Körpersignal"
        emptyHint="Noch nichts erfasst."
      />

      <NoPersonalDataHint />

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext
      />
    </div>
  );
}
