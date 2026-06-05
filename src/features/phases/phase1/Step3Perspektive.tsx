import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CoachCardBoard } from "@/features/cards/CoachCardBoard";
import { DEFAULT_CARD_COLOR } from "@/features/cards/cardColors";
import { ContentLoadState } from "@/features/content/ContentLoadState";
import type { ModelTerm } from "@/features/content/contentTypes";
import { useModel, useModelList } from "@/features/content/useModel";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { Card } from "@/features/session/types";
import { cn } from "@/lib/utils";

/**
 * Phase 1, Step 1.3 — Perspektive wechseln (deductive). Pick one of the IST
 * models, read its terms and add the missing ones as cards to the same board.
 * No AI here. Selecting a model persists phase1.selectedModel; switching models
 * keeps existing cards.
 */
export function Step3Perspektive({ nav }: { nav: PhaseNavigation }) {
  const selectedModel = useSessionStore((s) => s.session?.phase1.selectedModel);
  const cards = useSessionStore((s) => s.session?.phase1.cards ?? []);
  const istWord = useSessionStore((s) => s.session?.phase1.istWord ?? "");
  const patch = useSessionStore((s) => s.patch);

  const list = useModelList("ist");
  const loaded = useModel(selectedModel);

  function selectModel(id: string) {
    patch((s) => ({ ...s, phase1: { ...s.phase1, selectedModel: id } }));
  }

  function setCards(next: Card[]) {
    patch((s) => ({ ...s, phase1: { ...s.phase1, cards: next } }));
  }

  function addTermCard(term: ModelTerm) {
    patch((s) => {
      const offset = (s.phase1.cards.length % 6) * 24;
      const card: Card = {
        id: crypto.randomUUID(),
        text: term.label,
        modelTerm: term.id,
        color: DEFAULT_CARD_COLOR,
        x: 20 + offset,
        y: 110 + offset,
        visibility: "shared",
      };
      return {
        ...s,
        phase1: { ...s.phase1, cards: [...s.phase1.cards, card] },
      };
    });
  }

  return (
    <div className="space-y-6">
      {/* Model selection — free choice, no AI recommendation. */}
      <div
        role="group"
        aria-label="Modell wählen"
        className="grid gap-3 sm:grid-cols-2"
      >
        {list.status === "loading" || list.status === "error" ? (
          <div className="sm:col-span-2">
            <ContentLoadState
              status={list.status}
              error={list.error}
              onRetry={list.retry}
              loadingLabel="Modelle werden geladen …"
            />
          </div>
        ) : (
          list.models.map((model) => {
            const selected = model.id === selectedModel;
            return (
              <button
                key={model.id}
                type="button"
                aria-pressed={selected}
                onClick={() => selectModel(model.id)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  selected
                    ? "border-accent bg-accent/5"
                    : "border-subtle bg-surface hover:bg-surface-2",
                )}
              >
                <p className="font-medium text-foreground">{model.name}</p>
              </button>
            );
          })
        )}
      </div>

      {/* Selected model: intro + (optional) coach note + terms. */}
      {selectedModel ? (
        loaded.status === "loading" || loaded.status === "error" ? (
          <ContentLoadState
            status={loaded.status}
            error={loaded.error}
            onRetry={loaded.retry}
            loadingLabel="Modell wird geladen …"
          />
        ) : loaded.model ? (
          <div className="space-y-4">
            <p className="text-muted">{loaded.model.intro}</p>

            {loaded.model.coachRecommended && loaded.model.coachNote ? (
              <div className="rounded-lg border border-subtle bg-surface-2 p-4 text-sm text-foreground">
                {loaded.model.coachNote}
              </div>
            ) : null}

            {loaded.model.terms.length > 0 ? (
              <ul className="space-y-2">
                {loaded.model.terms.map((term) => (
                  <li
                    key={term.id}
                    className="flex flex-col gap-2 rounded-lg border border-subtle bg-surface p-3 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {term.label}
                      </p>
                      {term.hint ? (
                        <p className="mt-0.5 text-sm text-muted">{term.hint}</p>
                      ) : null}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => addTermCard(term)}
                    >
                      <Plus />
                      Als Karte
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-faint">
                Für dieses Modell sind noch keine Begriffe hinterlegt.
              </p>
            )}
          </div>
        ) : null
      ) : null}

      {/* The shared board — model cards appear next to the inductive ones. */}
      <CoachCardBoard
        cards={cards}
        onCardsChange={setCards}
        anchorCard={{ text: istWord }}
      />

      {!selectedModel ? (
        <p className="text-xs text-faint">
          Tipp: Wähle ein Modell, um seine Begriffe als Linsen zu nutzen. Du
          kannst auch ohne Modell weitergehen.
        </p>
      ) : null}

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext
      />
    </div>
  );
}
