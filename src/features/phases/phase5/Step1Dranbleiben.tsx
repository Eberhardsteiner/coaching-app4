import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { collectSortableResources } from "@/features/phases/phase3/resourceFields";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { ResourceItem, Strategy } from "@/features/session/types";

/**
 * Phase 5, Step 5.1 — Dranbleiben. Per resource a concrete "stay-on-track"
 * strategy (→ phase5.strategies). The resource field offers the förderliche /
 * Phase-4-used resources as suggestions (datalist) but stores the readable
 * **text** in `Strategy.resource` (good for the later summary/PDF). No AI here.
 */
export function Step1Dranbleiben({ nav }: { nav: PhaseNavigation }) {
  const strategies = useSessionStore((s) => s.session?.phase5.strategies ?? []);
  const plans = useSessionStore((s) => s.session?.phase4.plans ?? []);
  const phase3 = useSessionStore((s) => s.session?.phase3);
  const patch = useSessionStore((s) => s.patch);

  // Suggested resource texts: Phase-4-used first, then remaining förderliche.
  const resById = new Map<string, ResourceItem>(
    phase3
      ? collectSortableResources(phase3).map((e) => [e.item.id, e.item])
      : [],
  );
  const usedTexts = plans
    .flatMap((p) => p.resourcesUsed)
    .map((id) => resById.get(id)?.text)
    .filter((t): t is string => Boolean(t && t.trim()));
  const foerderlicheTexts = phase3
    ? collectSortableResources(phase3)
        .filter((e) => e.item.polarity === "foerderlich")
        .map((e) => e.item.text)
        .filter((t) => t.trim())
    : [];
  const suggestions = [...new Set([...usedTexts, ...foerderlicheTexts])];

  function setStrategies(next: Strategy[]) {
    patch((s) => ({ ...s, phase5: { ...s.phase5, strategies: next } }));
  }

  function addStrategy() {
    setStrategies([
      ...strategies,
      { id: crypto.randomUUID(), resource: "", concreteStrategy: "" },
    ]);
  }

  function updateStrategy(id: string, partial: Partial<Strategy>) {
    setStrategies(
      strategies.map((s) => (s.id === id ? { ...s, ...partial } : s)),
    );
  }

  function deleteStrategy(id: string) {
    setStrategies(strategies.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-5">
      <p className="text-muted">
        Wie bleibst du dran? Ab jetzt bist du selbst dein Controller. Leg für
        deine wichtigsten Ressourcen fest, wie du sie weiter nutzt — und woran
        du erkennst, ob du auf Kurs bist.
      </p>

      {strategies.length === 0 ? (
        <p className="text-xs text-faint">
          Noch keine Strategie angelegt — leg eine erste an.
        </p>
      ) : null}

      <div className="space-y-4">
        {strategies.map((strategy, index) => (
          <div
            key={strategy.id}
            className="space-y-3 rounded-xl border border-subtle bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-1.5">
                <label
                  htmlFor={`strategy-res-${strategy.id}`}
                  className="block text-sm font-medium text-foreground"
                >
                  Ressource
                </label>
                <input
                  id={`strategy-res-${strategy.id}`}
                  type="text"
                  list="phase5-resource-suggestions"
                  value={strategy.resource}
                  onChange={(event) =>
                    updateStrategy(strategy.id, {
                      resource: event.target.value,
                    })
                  }
                  placeholder="z. B. Freiheit"
                  className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </div>
              <button
                type="button"
                onClick={() => deleteStrategy(strategy.id)}
                aria-label={`Strategie ${index + 1} löschen`}
                title="Löschen"
                className="mt-7 flex size-8 shrink-0 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor={`strategy-how-${strategy.id}`}
                className="block text-sm font-medium text-foreground"
              >
                Strategie
              </label>
              <textarea
                id={`strategy-how-${strategy.id}`}
                value={strategy.concreteStrategy}
                rows={2}
                onChange={(event) =>
                  updateStrategy(strategy.id, {
                    concreteStrategy: event.target.value,
                  })
                }
                placeholder="Wie nutzt du diese Ressource konkret weiter, und woran prüfst du, ob es wirkt?"
                className="w-full resize-y rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
          </div>
        ))}

        <datalist id="phase5-resource-suggestions">
          {suggestions.map((text) => (
            <option key={text} value={text} />
          ))}
        </datalist>

        <Button variant="outline" size="sm" onClick={addStrategy}>
          <Plus />
          Strategie
        </Button>
      </div>

      <p className="rounded-lg border border-subtle bg-surface-2 p-3 text-sm text-muted">
        Wenn du vom Kurs abkommst, nutze deine Ressourcen einfach erneut.
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
