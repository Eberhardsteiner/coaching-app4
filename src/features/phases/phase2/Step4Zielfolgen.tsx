import { Check, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { Cluster, Consequence } from "@/features/session/types";
import { cn } from "@/lib/utils";

/** The three cluster-side valuations (data contract; empty = unanswered). */
type Valuation = "gut" | "schlecht" | "neutral";

const VALUATIONS: { value: Valuation; label: string; activeClass: string }[] = [
  { value: "gut", label: "Gut", activeClass: "bg-green-600 text-white" },
  {
    value: "schlecht",
    label: "Schlecht",
    activeClass: "bg-amber-600 text-white",
  },
  { value: "neutral", label: "Neutral", activeClass: "bg-muted text-white" },
];

function isValuation(value: string): value is Valuation {
  return value === "gut" || value === "schlecht" || value === "neutral";
}

/** Derive `tailwind` from the valuation (contract: gut→true, schlecht→false). */
function tailwindFor(valuation: string): boolean | undefined {
  if (valuation === "gut") return true;
  if (valuation === "schlecht") return false;
  return undefined;
}

/** Display name for a cluster (clusters may be left unnamed). */
function clusterName(cluster: Cluster, index: number): string {
  return cluster.name.trim() || `Cluster ${index + 1}`;
}

/**
 * Phase 2, Step 2.4 — Folgen meines Ziels. A guided pass through ALL Phase-1
 * clusters (core theme first, then by weight): per cluster ONE consequence
 * (linked via clusterId, perspective = cluster name) with the method's guiding
 * question (a concrete ACTION, phrased in the 3rd person, no negations,
 * observable behaviour) and the cluster-side valuation gut/schlecht/neutral.
 * Forward is gated on every cluster having recognition + valuation. Legacy
 * free consequences without a (matching) clusterId stay visible below as
 * "Weitere Perspektiven" — editable and deletable, nothing is thrown away.
 */
export function Step4Zielfolgen({ nav }: { nav: PhaseNavigation }) {
  const consequences = useSessionStore(
    (s) => s.session?.phase2.consequences ?? [],
  );
  const clusters = useSessionStore((s) => s.session?.phase1.clusters ?? []);
  const patch = useSessionStore((s) => s.patch);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Core theme first, then descending by weight (10 = "drückt am meisten").
  const sorted = [...clusters].sort(
    (a, b) =>
      Number(b.isCore ?? false) - Number(a.isCore ?? false) ||
      (b.weight ?? 0) - (a.weight ?? 0),
  );

  const byCluster = new Map(
    consequences
      .filter((c) => c.clusterId)
      .map((c) => [c.clusterId as string, c]),
  );

  function isComplete(clusterId: string): boolean {
    const c = byCluster.get(clusterId);
    return Boolean(
      c && c.recognition.trim().length > 0 && isValuation(c.valuation),
    );
  }

  // Legacy entries from old sessions: no clusterId, or one that no longer
  // matches an existing cluster. Shown below, never silently dropped.
  const legacy = consequences.filter(
    (c) => !c.clusterId || !clusters.some((cl) => cl.id === c.clusterId),
  );

  /**
   * Upsert THE consequence of a cluster (created on first input, so no empty
   * ghost entries are persisted from merely clicking through). Keeps
   * `perspective` in sync with the cluster name and derives `tailwind`.
   */
  function upsertForCluster(
    cluster: Cluster,
    index: number,
    partial: Partial<Consequence>,
  ) {
    // Pin the cluster being edited — otherwise the derived "first incomplete"
    // active cluster would jump away the moment this one becomes complete.
    setSelectedId(cluster.id);
    patch((s) => {
      const list = s.phase2.consequences;
      const existing = list.find((c) => c.clusterId === cluster.id);
      const merged: Consequence = existing
        ? { ...existing, ...partial, perspective: clusterName(cluster, index) }
        : {
            id: crypto.randomUUID(),
            clusterId: cluster.id,
            perspective: clusterName(cluster, index),
            recognition: "",
            valuation: "",
            ...partial,
          };
      const next: Consequence = {
        ...merged,
        tailwind: tailwindFor(merged.valuation),
      };
      return {
        ...s,
        phase2: {
          ...s.phase2,
          consequences: existing
            ? list.map((c) => (c.id === existing.id ? next : c))
            : [...list, next],
        },
      };
    });
  }

  function updateLegacy(id: string, partial: Partial<Consequence>) {
    patch((s) => ({
      ...s,
      phase2: {
        ...s.phase2,
        consequences: s.phase2.consequences.map((c) =>
          c.id === id ? { ...c, ...partial } : c,
        ),
      },
    }));
  }

  function deleteLegacy(id: string) {
    patch((s) => ({
      ...s,
      phase2: {
        ...s.phase2,
        consequences: s.phase2.consequences.filter((c) => c.id !== id),
      },
    }));
  }

  // Exceptional: no clusters at all (analogous to 2.1's missing core theme).
  if (sorted.length === 0) {
    return (
      <div>
        <div className="rounded-xl border border-subtle bg-surface-2 p-5">
          <p className="text-sm text-foreground">
            Für diesen Schritt fehlen deine Cluster aus Phase 1. Geh kurz zurück
            und bilde dort deine Cluster.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => nav.goToPhase(1)}
          >
            Zurück zu Phase 1
          </Button>
        </div>
      </div>
    );
  }

  // Active cluster: explicit choice, else the first incomplete, else the first.
  const active =
    sorted.find((c) => c.id === selectedId) ??
    sorted.find((c) => !isComplete(c.id)) ??
    sorted[0];
  const activeIndex = sorted.findIndex((c) => c.id === active.id);
  const activeName = clusterName(active, activeIndex);
  const activeConsequence = byCluster.get(active.id);
  const doneCount = sorted.filter((c) => isComplete(c.id)).length;
  const canNext = doneCount === sorted.length;

  return (
    <div>
      <div className="space-y-6">
        {/* Anmoderation (Methodik-Vorlage, wortgetreu — zwei Absätze) */}
        <p className="text-muted">
          Hast du schon einmal bemerkt, dass Veränderungen, die wir persönlich
          großartig finden, in unserem Umfeld manchmal nicht auf Gegenliebe
          stoßen? Andererseits wünschen sich vielleicht unsere Nächsten, dass
          wir uns verändern und würden uns dabei liebend gern unterstützen. Für
          deinen Weg zum Ziel kann es entscheidend sein zu berücksichtigen,
          woher du{" "}
          <strong className="font-semibold text-foreground">Rückenwind</strong>{" "}
          und woher{" "}
          <strong className="font-semibold text-foreground">Gegenwind</strong>{" "}
          zu erwarten hast. Nun geht es darum, dass du herausfindest, welche
          Auswirkungen dein Ziel auf dein Umfeld hat und wie die Beteiligten
          dazu stehen. Dann kannst du für dich überprüfen, ob du zu deinem Ziel
          stehen kannst. Und später kannst du bei deinen Maßnahmen die
          Einstellungen deines Umfelds gezielt berücksichtigen.{" "}
          <strong className="font-semibold text-foreground">
            Bitte gehe dabei durch alle deine Cluster.
          </strong>
        </p>
        <p className="text-muted">
          Stelle dir bitte vor, du hast dein Ziel erreicht. Ganz gleich, wie du
          es geschafft hast, dein Ziel ist Realität. Du kannst dich nun anders
          verhalten als Stand heute. Dass du dein Ziel erreicht hast, ist nicht
          nur ein Gefühl, sondern zeigt sich an deinem{" "}
          <strong className="font-semibold text-foreground">
            veränderten Verhalten
          </strong>{" "}
          in deinem Kontext. Betrachte dich nun aus der Perspektive, mit den
          Augen deiner Cluster. „An welchem konkreten Verhalten von dir erkennt
          dein Cluster (z. B. die Personen darin), dass du dein Ziel erreicht
          hast?“ Was kannst du dann tun, was du heute noch nicht machen kannst?
        </p>

        {/* F2 — Cluster-Navigation (Kernthema zuerst, dann nach Gewicht) */}
        <div
          role="group"
          aria-label="Cluster auswählen"
          className="flex flex-wrap gap-2"
        >
          {sorted.map((cluster, index) => {
            const done = isComplete(cluster.id);
            const isActive = cluster.id === active.id;
            return (
              <button
                key={cluster.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setSelectedId(cluster.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  isActive
                    ? "border-accent bg-accent text-white"
                    : "border-subtle bg-surface text-muted hover:text-foreground",
                )}
              >
                {done ? (
                  <Check className="size-3.5" aria-hidden />
                ) : (
                  <span
                    aria-hidden
                    className={cn(
                      "size-2 rounded-full border",
                      isActive ? "border-white/70" : "border-faint",
                    )}
                  />
                )}
                <span>{clusterName(cluster, index)}</span>
                {cluster.weight != null ? (
                  <span
                    className={cn(
                      "text-xs",
                      isActive ? "text-white/70" : "text-faint",
                    )}
                  >
                    · {cluster.weight}
                  </span>
                ) : null}
                {cluster.isCore ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[0.65rem] font-medium uppercase tracking-wide",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-accent/10 text-accent",
                    )}
                  >
                    Kernthema
                  </span>
                ) : null}
                <span className="sr-only">
                  {done ? " — ausgefüllt" : " — offen"}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-faint">
          {doneCount} von {sorted.length} Clustern beantwortet.
        </p>

        {/* The active cluster's consequence */}
        <div className="space-y-4 rounded-xl border border-subtle bg-surface p-4">
          {/* Kopfzeile wie im Vorlage-Arbeitsblatt: „Cluster ___ Wert (___)“ */}
          <h3 className="flex flex-wrap items-baseline gap-2 text-sm font-semibold text-foreground">
            Cluster: {activeName}
            {active.weight != null ? (
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                Wert ({active.weight})
              </span>
            ) : null}
          </h3>
          <div className="space-y-1.5">
            <label
              htmlFor="zielfolge-recognition"
              className="block text-sm font-medium text-foreground"
            >
              An welcher konkreten{" "}
              <strong className="font-semibold">Handlung</strong> von dir
              erkennt „{activeName}“, dass du dein Ziel erreicht hast?
            </label>
            <textarea
              id="zielfolge-recognition"
              value={activeConsequence?.recognition ?? ""}
              rows={3}
              onChange={(event) =>
                upsertForCluster(active, activeIndex, {
                  recognition: event.target.value,
                })
              }
              placeholder="z. B. Peter geht nach 8 Stunden Arbeitszeit nach Hause."
              className="w-full resize-y rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          {/* Formulierungs-Hinweis (Methodik-Vorlage, wortgetreu) */}
          <p className="rounded-lg border border-subtle bg-surface-2 p-3 text-xs text-muted">
            Damit der Perspektivwechsel deutlich wird, sprich bitte von dir in
            der{" "}
            <strong className="font-semibold text-foreground">3. Person</strong>
            , also nicht „Ich gehe …“, sondern z. B. „Peter geht …“.
          </p>

          {/* Bewertung aus Cluster-Sicht (Hinweis wortgetreu) */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Überlege anschließend, wie dein Cluster wohl deine neuen
              Verhaltensweisen bewerten wird: gut – schlecht – neutral?
            </p>
            <div
              role="group"
              aria-label={`Bewertung aus Sicht von ${activeName}`}
              className="inline-flex overflow-hidden rounded-lg border border-subtle"
            >
              {VALUATIONS.map((option) => {
                const isSet = activeConsequence?.valuation === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSet}
                    onClick={() =>
                      upsertForCluster(active, activeIndex, {
                        valuation: option.value,
                      })
                    }
                    className={cn(
                      "px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
                      isSet
                        ? option.activeClass
                        : "bg-surface text-muted hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-faint">
            Zuletzt überprüfe nochmal, ob das, was du beschrieben hast, a)
            wirklich die{" "}
            <strong className="font-medium text-muted">
              Sichtweise deiner Cluster
            </strong>{" "}
            wiedergibt und b) wirklich ein{" "}
            <strong className="font-medium text-muted">
              beobachtbares Verhalten
            </strong>{" "}
            ist. Bitte verwende keine Verneinungen. Beispiel: Anstelle von
            „Peter geht nicht mehr als Letzter aus dem Büro nach Hause“ → „Peter
            geht nach 8 Stunden Arbeitszeit nach Hause.“
          </p>
        </div>

        <NoPersonalDataHint />

        {/* Legacy free consequences from old sessions — nothing is thrown away. */}
        {legacy.length > 0 ? (
          <div className="space-y-3 border-t border-subtle pt-5">
            <p className="text-sm font-medium text-foreground">
              Weitere Perspektiven
            </p>
            <p className="text-xs text-muted">
              Diese Einträge stammen aus einer früheren Bearbeitung ohne
              Cluster-Bezug. Du kannst sie weiter bearbeiten oder löschen.
            </p>
            {legacy.map((c) => (
              <div
                key={c.id}
                className="space-y-3 rounded-xl border border-subtle bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <label
                      htmlFor={`legacy-persp-${c.id}`}
                      className="block text-sm font-medium text-foreground"
                    >
                      Perspektive
                    </label>
                    <input
                      id={`legacy-persp-${c.id}`}
                      type="text"
                      value={c.perspective}
                      onChange={(event) =>
                        updateLegacy(c.id, { perspective: event.target.value })
                      }
                      placeholder="z. B. mein Team"
                      className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteLegacy(c.id)}
                    aria-label="Eintrag löschen"
                    title="Löschen"
                    className="mt-7 flex size-8 shrink-0 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor={`legacy-recog-${c.id}`}
                    className="block text-sm font-medium text-foreground"
                  >
                    Woran erkennbar
                  </label>
                  <textarea
                    id={`legacy-recog-${c.id}`}
                    value={c.recognition}
                    rows={2}
                    onChange={(event) =>
                      updateLegacy(c.id, { recognition: event.target.value })
                    }
                    className="w-full resize-y rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor={`legacy-val-${c.id}`}
                    className="block text-sm font-medium text-foreground"
                  >
                    Bewertung
                  </label>
                  <textarea
                    id={`legacy-val-${c.id}`}
                    value={c.valuation}
                    rows={2}
                    onChange={(event) =>
                      updateLegacy(c.id, { valuation: event.target.value })
                    }
                    className="w-full resize-y rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* F3 — Mini-Übersicht + Reflexion */}
        <div className="rounded-xl border border-subtle bg-surface-2 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-faint">
            Überblick
          </p>
          <ul className="mt-2 space-y-1">
            {sorted.map((cluster, index) => {
              const c = byCluster.get(cluster.id);
              const valuation =
                c && isValuation(c.valuation) ? c.valuation : null;
              return (
                <li
                  key={cluster.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 truncate text-foreground">
                    {clusterName(cluster, index)}
                    {cluster.isCore ? (
                      <span className="text-faint"> (Kernthema)</span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                      valuation === "gut" && "bg-green-600/10 text-green-600",
                      valuation === "schlecht" &&
                        "bg-amber-600/10 text-amber-600",
                      valuation === "neutral" && "bg-muted/10 text-muted",
                      !valuation && "bg-surface text-faint",
                    )}
                  >
                    {valuation === "gut"
                      ? "Gut"
                      : valuation === "schlecht"
                        ? "Schlecht"
                        : valuation === "neutral"
                          ? "Neutral"
                          : "offen"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

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

        {!canNext ? (
          <p className="text-xs text-faint">
            „Weiter“ öffnet sich, wenn du für jedes Cluster eine Handlung
            beschrieben und eine Bewertung gesetzt hast.
          </p>
        ) : null}
      </div>

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext={canNext}
      />
    </div>
  );
}
