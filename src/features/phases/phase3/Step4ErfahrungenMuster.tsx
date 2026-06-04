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
 * Phase 3, Step 3.4 — Erfahrungen & Muster. Two lists: outer resources /
 * experiences (→ phase3.experiential) and past behaviour to drop
 * (→ phase3.pastPatterns). No AI here.
 */
export function Step4ErfahrungenMuster({ nav }: { nav: PhaseNavigation }) {
  const experiential = useSessionStore(
    (s) => s.session?.phase3.experiential ?? [],
  );
  const pastPatterns = useSessionStore(
    (s) => s.session?.phase3.pastPatterns ?? [],
  );
  const patch = useSessionStore((s) => s.patch);
  const core = useCoreTheme();
  const label = coreThemeLabel(core);

  function setExperiential(next: ResourceItem[]) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, experiential: next } }));
  }

  function setPastPatterns(next: ResourceItem[]) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, pastPatterns: next } }));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-muted">
          Welche Erfahrungen, Kenntnisse oder äußeren Ressourcen (Menschen,
          Mittel, Gelerntes) kannst du für dein Ziel „{label}“ nutzen?
        </p>
        <ResourceListEditor
          items={experiential}
          onItemsChange={setExperiential}
          addLabel="Erfahrung / Ressource"
          placeholder="z. B. Erfahrung aus einem früheren Projekt"
          itemLabel="Erfahrung / Ressource"
          emptyHint="Noch nichts erfasst."
        />
      </div>

      <div className="space-y-2 border-t border-subtle pt-5">
        <p className="text-muted">
          Was hast du bisher versucht, das dir nicht geholfen hat — und das du
          so nicht mehr tun willst?
        </p>
        <ResourceListEditor
          items={pastPatterns}
          onItemsChange={setPastPatterns}
          addLabel="Verhalten"
          placeholder="z. B. alles allein machen wollen"
          itemLabel="Verhalten"
          emptyHint="Noch nichts erfasst."
        />
      </div>

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
