import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { Consequence } from "@/features/session/types";
import { cn } from "@/lib/utils";

/**
 * Phase 2, Step 2.4 — Zielfolgen. Imagining the goal as reached: what changes
 * for the people around you, how they'd notice and whether they read it as
 * tailwind or headwind. Generic roles only (no real names). No AI here.
 */
export function Step4Zielfolgen({ nav }: { nav: PhaseNavigation }) {
  const consequences = useSessionStore(
    (s) => s.session?.phase2.consequences ?? [],
  );
  const clusters = useSessionStore((s) => s.session?.phase1.clusters ?? []);
  const patch = useSessionStore((s) => s.patch);

  function setConsequences(next: Consequence[]) {
    patch((s) => ({ ...s, phase2: { ...s.phase2, consequences: next } }));
  }

  function addConsequence() {
    setConsequences([
      ...consequences,
      {
        id: crypto.randomUUID(),
        perspective: "",
        recognition: "",
        valuation: "",
        tailwind: true,
      },
    ]);
  }

  function updateConsequence(id: string, partial: Partial<Consequence>) {
    setConsequences(
      consequences.map((c) => (c.id === id ? { ...c, ...partial } : c)),
    );
  }

  function deleteConsequence(id: string) {
    setConsequences(consequences.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div className="space-y-5">
        <p className="text-muted">
          Stell dir vor, du hast dein Ziel erreicht. Was ändert sich für dein
          Umfeld? Woran würde es das erkennen — und wie bewertet es das:
          Rückenwind oder Gegenwind?
        </p>

        <div className="space-y-4">
          {consequences.map((c) => (
            <div
              key={c.id}
              className="space-y-3 rounded-xl border border-subtle bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <label
                    htmlFor={`persp-${c.id}`}
                    className="block text-sm font-medium text-foreground"
                  >
                    Perspektive
                  </label>
                  <input
                    id={`persp-${c.id}`}
                    type="text"
                    value={c.perspective}
                    onChange={(event) =>
                      updateConsequence(c.id, {
                        perspective: event.target.value,
                      })
                    }
                    placeholder="z. B. mein Team"
                    className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => deleteConsequence(c.id)}
                  aria-label="Zielfolge löschen"
                  title="Löschen"
                  className="mt-7 flex size-8 shrink-0 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor={`recog-${c.id}`}
                  className="block text-sm font-medium text-foreground"
                >
                  Woran erkennbar
                </label>
                <textarea
                  id={`recog-${c.id}`}
                  value={c.recognition}
                  rows={2}
                  onChange={(event) =>
                    updateConsequence(c.id, { recognition: event.target.value })
                  }
                  placeholder="Woran würde es das merken?"
                  className="w-full resize-y rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor={`val-${c.id}`}
                  className="block text-sm font-medium text-foreground"
                >
                  Bewertung
                </label>
                <textarea
                  id={`val-${c.id}`}
                  value={c.valuation}
                  rows={2}
                  onChange={(event) =>
                    updateConsequence(c.id, { valuation: event.target.value })
                  }
                  placeholder="Wie bewertet es diese Veränderung?"
                  className="w-full resize-y rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </div>

              <div className="flex flex-wrap items-end justify-between gap-3">
                {/* Tailwind / headwind toggle */}
                <div
                  role="group"
                  aria-label="Rückenwind oder Gegenwind"
                  className="inline-flex overflow-hidden rounded-lg border border-subtle"
                >
                  <button
                    type="button"
                    aria-pressed={c.tailwind === true}
                    onClick={() => updateConsequence(c.id, { tailwind: true })}
                    className={cn(
                      "px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
                      c.tailwind === true
                        ? "bg-green-600 text-white"
                        : "bg-surface text-muted hover:text-foreground",
                    )}
                  >
                    Rückenwind
                  </button>
                  <button
                    type="button"
                    aria-pressed={c.tailwind === false}
                    onClick={() => updateConsequence(c.id, { tailwind: false })}
                    className={cn(
                      "px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
                      c.tailwind === false
                        ? "bg-amber-600 text-white"
                        : "bg-surface text-muted hover:text-foreground",
                    )}
                  >
                    Gegenwind
                  </button>
                </div>

                {/* Optional cluster reference */}
                {clusters.length > 0 ? (
                  <div className="space-y-1">
                    <label
                      htmlFor={`cl-${c.id}`}
                      className="block text-xs text-muted"
                    >
                      Bezug (optional)
                    </label>
                    <select
                      id={`cl-${c.id}`}
                      value={c.clusterId ?? ""}
                      onChange={(event) =>
                        updateConsequence(c.id, {
                          clusterId: event.target.value || undefined,
                        })
                      }
                      className="rounded-lg border border-subtle bg-surface px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <option value="">kein Bezug</option>
                      {clusters.map((cluster, index) => (
                        <option key={cluster.id} value={cluster.id}>
                          {cluster.name.trim() || `Cluster ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addConsequence}>
            <Plus />
            Zielfolge
          </Button>
        </div>

        <NoPersonalDataHint example="mein Team" />

        {/* Closing reflection */}
        <div className="rounded-xl border border-subtle bg-surface-2 p-4">
          <p className="text-sm font-medium text-foreground">
            Ist dein Ziel dann noch dein Ziel?
          </p>
          <p className="mt-1 text-sm text-muted">
            Wenn die Folgen dein Ziel relativieren, geh zurück und schärfe es
            nach.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => nav.goTo(2, 1)}
          >
            Ziel anpassen
          </Button>
        </div>
      </div>

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext
      />
    </div>
  );
}
