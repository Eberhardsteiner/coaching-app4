import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { ResourceListEditor } from "@/features/phases/phase3/ResourceListEditor";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { ResourceItem } from "@/features/session/types";

/** Stable empty default — preMortem is optional, so the selector must not
 *  return a fresh array each render (would loop useSyncExternalStore). */
const NO_ITEMS: ResourceItem[] = [];

/**
 * Phase 4, Step 4.2 — Mögliche Hindernisse (pre-mortem). A light, optional
 * reflection (→ phase4.preMortem): possible obstacles + what to do about them
 * now. No hard block. No AI here.
 */
export function Step2Hindernisse({ nav }: { nav: PhaseNavigation }) {
  const preMortem =
    useSessionStore((s) => s.session?.phase4.preMortem) ?? NO_ITEMS;
  const patch = useSessionStore((s) => s.patch);

  function setPreMortem(next: ResourceItem[]) {
    patch((s) => ({ ...s, phase4: { ...s.phase4, preMortem: next } }));
  }

  return (
    <div className="space-y-5">
      <p className="text-muted">
        Stell dir vor, es ist in einem Monat und es hat nicht geklappt — was
        wäre dazwischengekommen? Was kannst du jetzt schon dagegen tun?
      </p>

      <ResourceListEditor
        items={preMortem}
        onItemsChange={setPreMortem}
        addLabel="Hindernis / Gegenmittel"
        placeholder="z. B. Zeitmangel — feste Termine blocken"
        itemLabel="Hindernis / Gegenmittel"
        emptyHint="Optional — du kannst diesen Schritt auch überspringen."
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
