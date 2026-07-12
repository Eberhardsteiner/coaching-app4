import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import {
  coreThemeLabel,
  useCoreTheme,
} from "@/features/phases/phase2/useCoreTheme";
import { collectSortableResources } from "@/features/phases/phase3/resourceFields";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type {
  Cluster,
  ClusterPlan,
  Measure,
  ResourceItem,
} from "@/features/session/types";
import { cn } from "@/lib/utils";

/** A förderliche resource offered for a plan. */
type Foerderlich = { id: string; text: string };

/**
 * Phase 4, Step 4.1 — Maßnahmen. Per cluster (core theme first + highlighted)
 * the user builds a ClusterPlan: picks förderliche Phase-3 resources
 * (referenced by ResourceItem **id** in `resourcesUsed`) and derives concrete
 * Ich-Satz measures, each optionally based on one of those resources plus a
 * recognition signal. Forward is gated on ≥1 measure in the core plan. No AI.
 */
export function Step1Massnahmen({ nav }: { nav: PhaseNavigation }) {
  const clusters = useSessionStore((s) => s.session?.phase1.clusters ?? []);
  const plans = useSessionStore((s) => s.session?.phase4.plans ?? []);
  const phase3 = useSessionStore((s) => s.session?.phase3);
  const patch = useSessionStore((s) => s.patch);
  const core = useCoreTheme();
  const label = coreThemeLabel(core);

  // Förderliche Ressourcen (id-referenced) + a text lookup for display.
  const resById = new Map<string, ResourceItem>(
    phase3
      ? collectSortableResources(phase3).map((entry) => [
          entry.item.id,
          entry.item,
        ])
      : [],
  );
  const foerderliche: Foerderlich[] = phase3
    ? collectSortableResources(phase3)
        .filter((entry) => entry.item.polarity === "foerderlich")
        .map((entry) => ({ id: entry.item.id, text: entry.item.text }))
    : [];
  const resourceText = (id: string): string =>
    resById.get(id)?.text || "(entfernt)";

  // Core cluster first, then the rest in original order (stable sort).
  const sortedClusters = [...clusters].sort(
    (a, b) => Number(b.isCore ?? false) - Number(a.isCore ?? false),
  );

  function createPlan(clusterId: string) {
    patch((s) => {
      if (s.phase4.plans.some((p) => p.clusterId === clusterId)) return s;
      const plan: ClusterPlan = { clusterId, resourcesUsed: [], measures: [] };
      return {
        ...s,
        phase4: { ...s.phase4, plans: [...s.phase4.plans, plan] },
      };
    });
  }

  function deletePlan(clusterId: string) {
    patch((s) => ({
      ...s,
      phase4: {
        ...s.phase4,
        plans: s.phase4.plans.filter((p) => p.clusterId !== clusterId),
      },
    }));
  }

  function updatePlan(
    clusterId: string,
    updater: (p: ClusterPlan) => ClusterPlan,
  ) {
    patch((s) => ({
      ...s,
      phase4: {
        ...s.phase4,
        plans: s.phase4.plans.map((p) =>
          p.clusterId === clusterId ? updater(p) : p,
        ),
      },
    }));
  }

  function toggleResource(clusterId: string, resId: string) {
    updatePlan(clusterId, (p) => {
      const has = p.resourcesUsed.includes(resId);
      return {
        ...p,
        resourcesUsed: has
          ? p.resourcesUsed.filter((r) => r !== resId)
          : [...p.resourcesUsed, resId],
        // Removing a resource clears measures that referenced it.
        measures: has
          ? p.measures.map((m) =>
              m.basedOnResource === resId
                ? { ...m, basedOnResource: undefined }
                : m,
            )
          : p.measures,
      };
    });
  }

  function addMeasure(clusterId: string) {
    updatePlan(clusterId, (p) => ({
      ...p,
      measures: [...p.measures, { id: crypto.randomUUID(), text: "" }],
    }));
  }

  function updateMeasure(
    clusterId: string,
    measureId: string,
    partial: Partial<Measure>,
  ) {
    updatePlan(clusterId, (p) => ({
      ...p,
      measures: p.measures.map((m) =>
        m.id === measureId ? { ...m, ...partial } : m,
      ),
    }));
  }

  function deleteMeasure(clusterId: string, measureId: string) {
    updatePlan(clusterId, (p) => ({
      ...p,
      measures: p.measures.filter((m) => m.id !== measureId),
    }));
  }

  const coreCluster = clusters.find((c) => c.isCore);
  const corePlan = coreCluster
    ? plans.find((p) => p.clusterId === coreCluster.id)
    : undefined;
  const canNext = Boolean(corePlan?.measures.some((m) => m.text.trim() !== ""));

  return (
    <div className="space-y-6">
      <p className="text-muted">
        Wie kommst du vom Ziel ins Tun? Wähle für dein Kernthema „{label}“
        förderliche Ressourcen und mach daraus konkrete Schritte — formuliert
        als Ich-Sätze.
      </p>

      {sortedClusters.length === 0 ? (
        <p className="text-sm text-faint">
          Keine Cluster aus Phase 1 vorhanden.
        </p>
      ) : (
        <div className="space-y-4">
          {sortedClusters.map((cluster) => (
            <ClusterPlanCard
              key={cluster.id}
              cluster={cluster}
              plan={plans.find((p) => p.clusterId === cluster.id)}
              foerderliche={foerderliche}
              resourceText={resourceText}
              onCreate={() => createPlan(cluster.id)}
              onDelete={() => deletePlan(cluster.id)}
              onToggleResource={(resId) => toggleResource(cluster.id, resId)}
              onAddMeasure={() => addMeasure(cluster.id)}
              onUpdateMeasure={(mId, partial) =>
                updateMeasure(cluster.id, mId, partial)
              }
              onDeleteMeasure={(mId) => deleteMeasure(cluster.id, mId)}
            />
          ))}
        </div>
      )}

      {!canNext ? (
        <p className="text-xs text-faint">
          Lege im Kernthema-Plan mindestens eine Maßnahme an, um fortzufahren.
        </p>
      ) : null}

      <NoPersonalDataHint />

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext={canNext}
      />
    </div>
  );
}

type ClusterPlanCardProps = {
  cluster: Cluster;
  plan: ClusterPlan | undefined;
  foerderliche: Foerderlich[];
  resourceText: (id: string) => string;
  onCreate: () => void;
  onDelete: () => void;
  onToggleResource: (resId: string) => void;
  onAddMeasure: () => void;
  onUpdateMeasure: (measureId: string, partial: Partial<Measure>) => void;
  onDeleteMeasure: (measureId: string) => void;
};

/** One cluster's plan: resource palette + Ich-Satz measure editor. */
function ClusterPlanCard({
  cluster,
  plan,
  foerderliche,
  resourceText,
  onCreate,
  onDelete,
  onToggleResource,
  onAddMeasure,
  onUpdateMeasure,
  onDeleteMeasure,
}: ClusterPlanCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        cluster.isCore
          ? "border-accent/40 bg-accent/5"
          : "border-subtle bg-surface",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate font-medium text-foreground">
            {cluster.name.trim() || "Cluster"}
          </p>
          {cluster.isCore ? (
            <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">
              Kernthema
            </span>
          ) : null}
        </div>
        {plan ? (
          <button
            type="button"
            onClick={onDelete}
            aria-label="Plan entfernen"
            title="Plan entfernen"
            className="flex size-7 shrink-0 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Trash2 className="size-4" />
          </button>
        ) : null}
      </div>

      {!plan ? (
        <Button variant="outline" size="sm" className="mt-3" onClick={onCreate}>
          <Plus />
          Maßnahmen planen
        </Button>
      ) : (
        <div className="mt-4 space-y-4">
          {/* Resource palette */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Genutzte Ressourcen
            </p>
            {foerderliche.length === 0 ? (
              <p className="text-xs text-faint">
                Keine als förderlich markierten Ressourcen. Du kannst trotzdem
                Maßnahmen formulieren — oder in Phase 3 deine Ressourcen als
                förderlich werten.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {foerderliche.map((res) => {
                  const selected = plan.resourcesUsed.includes(res.id);
                  return (
                    <button
                      key={res.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onToggleResource(res.id)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        selected
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-subtle bg-surface text-muted hover:text-foreground",
                      )}
                    >
                      {res.text || "—"}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Measures */}
          <div className="space-y-3">
            {plan.measures.map((measure, index) => (
              <div
                key={measure.id}
                className="space-y-2 rounded-lg border border-subtle bg-surface p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <label
                    htmlFor={`measure-${measure.id}`}
                    className="block text-sm font-medium text-foreground"
                  >
                    Maßnahme {index + 1} (Ich-Satz)
                  </label>
                  <button
                    type="button"
                    onClick={() => onDeleteMeasure(measure.id)}
                    aria-label={`Maßnahme ${index + 1} löschen`}
                    title="Löschen"
                    className="flex size-7 shrink-0 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <textarea
                  id={`measure-${measure.id}`}
                  value={measure.text}
                  rows={2}
                  onChange={(event) =>
                    onUpdateMeasure(measure.id, { text: event.target.value })
                  }
                  placeholder="Ich …"
                  className="w-full resize-y rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label
                      htmlFor={`measure-res-${measure.id}`}
                      className="block text-xs text-muted"
                    >
                      Basiert auf Ressource
                    </label>
                    <select
                      id={`measure-res-${measure.id}`}
                      value={measure.basedOnResource ?? ""}
                      onChange={(event) =>
                        onUpdateMeasure(measure.id, {
                          basedOnResource: event.target.value || undefined,
                        })
                      }
                      className="w-full rounded-lg border border-subtle bg-surface px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <option value="">— keine —</option>
                      {plan.resourcesUsed.map((rid) => (
                        <option key={rid} value={rid}>
                          {resourceText(rid)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor={`measure-sig-${measure.id}`}
                      className="block text-xs text-muted"
                    >
                      Erkennungssignal
                    </label>
                    <input
                      id={`measure-sig-${measure.id}`}
                      type="text"
                      value={measure.recognitionSignal ?? ""}
                      onChange={(event) =>
                        onUpdateMeasure(measure.id, {
                          recognitionSignal: event.target.value,
                        })
                      }
                      placeholder="Woran erkennst du, dass du den Schritt getan hast?"
                      className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={onAddMeasure}>
              <Plus />
              Maßnahme
            </Button>
          </div>

          {/* Quality help */}
          <p className="rounded-lg border border-subtle bg-surface-2 p-3 text-xs text-muted">
            Eine gute Maßnahme ist ein ganzer Ich-Satz, stützt sich auf eine
            deiner Ressourcen, zahlt auf dein Ziel ein und ist etwas Neues.
          </p>
        </div>
      )}
    </div>
  );
}
