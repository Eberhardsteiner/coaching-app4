import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ContentLoadState } from "@/features/content/ContentLoadState";
import type { ModelTerm } from "@/features/content/contentTypes";
import { useModel, useModelList } from "@/features/content/useModel";
import {
  coreThemeLabel,
  useCoreTheme,
} from "@/features/phases/phase2/useCoreTheme";
import {
  fieldForModel,
  OWN_RESOURCE_FIELDS,
  OWN_RESOURCE_LABEL,
  type OwnResourceField,
} from "@/features/phases/phase3/resourceFields";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import { cn } from "@/lib/utils";

/** Stable empty default — selectedModels is optional, so the selector must not
 *  return a fresh array each render (would loop useSyncExternalStore). */
const NO_MODELS: string[] = [];

/**
 * Phase 3, Step 3.1 — Eigene Ressourcen. Offer the resource models
 * (`listModels('resource')`, reusing the Phase-1/Step-3 pattern, multi-use via
 * `phase3.selectedModels`). Taking a term creates a ResourceItem routed into the
 * mapped field (see resourceFields.ts). No AI here.
 */
export function Step1EigeneRessourcen({ nav }: { nav: PhaseNavigation }) {
  const selectedModels =
    useSessionStore((s) => s.session?.phase3.selectedModels) ?? NO_MODELS;
  const motives = useSessionStore((s) => s.session?.phase3.motives ?? []);
  const values = useSessionStore((s) => s.session?.phase3.values ?? []);
  const intelligences = useSessionStore(
    (s) => s.session?.phase3.intelligences ?? [],
  );
  const innerResources = useSessionStore(
    (s) => s.session?.phase3.innerResources ?? [],
  );
  const patch = useSessionStore((s) => s.patch);
  const core = useCoreTheme();
  const label = coreThemeLabel(core);

  const byField: Record<OwnResourceField, typeof motives> = {
    motives,
    values,
    intelligences,
    innerResources,
  };

  const [openModelId, setOpenModelId] = useState<string | null>(null);
  const list = useModelList("resource");
  const loaded = useModel(openModelId ?? undefined);

  function openModel(id: string) {
    setOpenModelId(id);
    if (!selectedModels.includes(id)) {
      patch((s) => ({
        ...s,
        phase3: {
          ...s.phase3,
          selectedModels: [...(s.phase3.selectedModels ?? []), id],
        },
      }));
    }
  }

  function addResource(field: OwnResourceField, term: ModelTerm) {
    patch((s) => {
      const next = { ...s.phase3 };
      if (next[field].some((item) => item.text === term.label)) return s;
      next[field] = [
        ...next[field],
        { id: crypto.randomUUID(), text: term.label },
      ];
      return { ...s, phase3: next };
    });
  }

  function removeResource(field: OwnResourceField, id: string) {
    patch((s) => {
      const next = { ...s.phase3 };
      next[field] = next[field].filter((item) => item.id !== id);
      return { ...s, phase3: next };
    });
  }

  const openField = openModelId ? fieldForModel(openModelId) : null;
  const isTaken = (term: ModelTerm) =>
    openField
      ? byField[openField].some((item) => item.text === term.label)
      : false;

  const collected = OWN_RESOURCE_FIELDS.flatMap((field) =>
    byField[field].map((item) => ({ field, item })),
  );

  return (
    <div className="space-y-6">
      <p className="text-muted">
        Welche eigenen Stärken, Werte und Fähigkeiten kannst du für dein Ziel „
        {label}“ nutzen? Geh ein Modell durch und sammle, was zu dir passt.
      </p>

      {/* Resource model selection (multi-use) */}
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
            const open = model.id === openModelId;
            const used = selectedModels.includes(model.id);
            return (
              <button
                key={model.id}
                type="button"
                aria-pressed={open}
                onClick={() => openModel(model.id)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  open
                    ? "border-accent bg-accent/5"
                    : "border-subtle bg-surface hover:bg-surface-2",
                )}
              >
                <span className="font-medium text-foreground">
                  {model.name}
                </span>
                {used ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
                    <Check className="size-3" />
                    genutzt
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>

      {/* Open model: intro + terms */}
      {openModelId ? (
        loaded.status === "loading" || loaded.status === "error" ? (
          <ContentLoadState
            status={loaded.status}
            error={loaded.error}
            onRetry={loaded.retry}
            loadingLabel="Modell wird geladen …"
          />
        ) : loaded.model ? (
          <div className="space-y-3">
            <p className="text-muted">{loaded.model.intro}</p>
            {loaded.model.terms.length > 0 ? (
              <ul className="space-y-2">
                {loaded.model.terms.map((term) => {
                  const taken = isTaken(term);
                  return (
                    <li
                      key={term.id}
                      className="flex flex-col gap-2 rounded-lg border border-subtle bg-surface p-3 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {term.label}
                        </p>
                        {term.hint ? (
                          <p className="mt-0.5 text-sm text-muted">
                            {term.hint}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        variant={taken ? "ghost" : "outline"}
                        size="sm"
                        className="shrink-0"
                        disabled={taken || !openField}
                        onClick={() =>
                          openField ? addResource(openField, term) : undefined
                        }
                      >
                        {taken ? <Check /> : <Plus />}
                        {taken ? "Übernommen" : "Als Ressource"}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-faint">
                Für dieses Modell sind noch keine Begriffe hinterlegt.
              </p>
            )}
          </div>
        ) : null
      ) : (
        <p className="text-xs text-faint">
          Wähle ein Modell, um seine Begriffe als Ressourcen zu prüfen.
        </p>
      )}

      {/* Collected resources */}
      {collected.length > 0 ? (
        <div className="space-y-2 border-t border-subtle pt-5">
          <p className="text-sm font-medium text-foreground">
            Gesammelte Ressourcen ({collected.length})
          </p>
          <ul className="space-y-1.5">
            {collected.map(({ field, item }) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-subtle bg-surface px-3 py-2"
              >
                <span className="min-w-0 text-sm text-foreground">
                  <span className="truncate">{item.text}</span>
                  <span className="ml-2 text-xs text-faint">
                    {OWN_RESOURCE_LABEL[field]}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeResource(field, item.id)}
                  aria-label={`„${item.text}“ entfernen`}
                  title="Entfernen"
                  className="flex size-7 shrink-0 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
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
