import { ContentLoadState } from "@/features/content/ContentLoadState";
import { useModel } from "@/features/content/useModel";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { ResourceHarvest } from "@/features/phases/phase3/ResourceHarvest";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { ResourceItem } from "@/features/session/types";

/** Anmoderation (Methodik-Vorlage, wortgetreu, leicht gekürzt). */
const INTRO =
  "Beginne mit deinen Begabungen — den Intelligenzarten. Die psychologische Forschung weiß, dass wir über genetisch bestimmte grundlegende Begabungen verfügen. Sie bestimmen, welche Aufgaben uns immer schon leichtfallen und welche eher schwer. Identifiziere mit Hilfe der Beschreibungen, welche Intelligenzarten dich besonders kennzeichnen — womit du dich leicht tust. Üblicherweise spiegelt sich das in Teilen auch in der Berufswahl.";

/**
 * Phase 3, Step 3.2 — Meine Intelligenzen. The nine kinds from the template
 * (intelligenzarten.json), taken into phase3.intelligences and rated in place:
 * hilft oder hindert — in Bezug auf das Ziel. Soft step (no gate).
 */
export function Step2Intelligenzen({ nav }: { nav: PhaseNavigation }) {
  const intelligences = useSessionStore(
    (s) => s.session?.phase3.intelligences ?? [],
  );
  const patch = useSessionStore((s) => s.patch);
  const loaded = useModel("intelligenzarten");

  function setIntelligences(next: ResourceItem[]) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, intelligences: next } }));
  }

  return (
    <div className="space-y-6">
      <p className="text-muted">{INTRO}</p>

      {loaded.status === "loading" || loaded.status === "error" ? (
        <ContentLoadState
          status={loaded.status}
          error={loaded.error}
          onRetry={loaded.retry}
          loadingLabel="Intelligenzarten werden geladen …"
        />
      ) : loaded.model ? (
        <ResourceHarvest
          terms={loaded.model.terms}
          items={intelligences}
          onItemsChange={setIntelligences}
          polarityQuestion="Hilft oder hindert dich diese Intelligenz auf dem Weg zu deinem Ziel?"
          ownLabel="Eigene Ergänzung"
          ownPlaceholder="z. B. eine weitere Begabung"
        />
      ) : null}

      <p className="text-sm text-muted">
        Intelligenzen, die mit deinem Ziel nicht in Beziehung stehen, kannst du
        weglassen.
      </p>

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
