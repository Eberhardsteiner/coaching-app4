import {
  Check,
  ChevronDown,
  Gift,
  LayoutDashboard,
  Plus,
  Telescope,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { BeispielPaar } from "@/components/method/BeispielPaar";
import { InfoCallout } from "@/components/method/InfoCallout";
import { MiniFlow } from "@/components/method/MiniFlow";
import { Button } from "@/components/ui/button";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { collectSortableResources } from "@/features/phases/phase3/resourceFields";
import { RessourcenCockpitOverlay } from "@/features/phases/phase3/RessourcenCockpit";
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

/** Ressourcen-Minimum je Cluster (Gate) und Maßnahmen-Obergrenze (Methodik). */
export const MIN_RESOURCES = 3;
export const MAX_MEASURES = 4;

/** Wirkindikator-Rahmung (Methodik-Vorlage, wortgetreu, gekürzt). */
const WIRKINDIKATOR_TEXT =
  "Du erinnerst dich: Bei den Folgen deines Ziels hast du beschrieben, was du aus Sicht dieses Clusters beispielhaft tun kannst, sobald du am Ziel angekommen bist. Orientiere dich bei deinen Maßnahmen in erster Linie an deinem übergeordneten Ziel — und stelle sicher, dass sie dazu beitragen, dass du diese Handlung erfolgreich umsetzen kannst. Dein neues Verhalten ist ein ‚Wirkindikator‘ dafür, dass du dein Ziel erreicht hast.";

/** Ressourcen-Anleitung (Methodik-Vorlage, wortgetreu, gekürzt). */
const RESSOURCEN_TEXT =
  "Suche aus deinem Ressourcen-Cockpit die hilfreichen Ressourcen heraus, die zu diesem Cluster passen. Achte darauf, dass deine starken förderlichen Motive und Persönlichkeitseigenschaften vorkommen. Nach oben gibt es keine Beschränkung — mindestens 3–5 müssen es sein, damit du die Ressourcen kombinieren kannst.";

/** Die vier Qualitäten wirksamer Maßnahmen (Merkkarte). */
const QUALITIES_CARD =
  "Jede Maßnahme: ein ganzer Ich-Satz mit konkreter Handlung · ressourcenbasiert · ins Ziel einzahlend · neu.";

function clusterName(cluster: Cluster, index: number): string {
  return cluster.name.trim() || `Cluster ${index + 1}`;
}

/** Cluster-side valuation badge (labels/colours as in Phase 2.4). */
function valuationBadge(valuation: string): {
  label: string;
  className: string;
} | null {
  if (valuation === "gut")
    return { label: "Gut", className: "bg-green-600/10 text-green-600" };
  if (valuation === "schlecht")
    return { label: "Schlecht", className: "bg-amber-600/10 text-amber-600" };
  if (valuation === "neutral")
    return { label: "Neutral", className: "bg-muted/10 text-muted" };
  return null;
}

/**
 * Phase 4, Step 4.1 — Maßnahmen je Cluster: the guided cluster pass (core
 * theme first, then by weight; pinning pattern from MP3 — any edit pins its
 * cluster so the derived active cluster never jumps mid-input). The active
 * cluster follows the method's Cluster-Arbeitsblatt (MP4-REV): header with
 * name + Wert (weight, consistent with 2.4); two columns on wide screens —
 * LEFT the context mirrored read-only from phase2.consequences (the two 2.4
 * questions with recognition + valuation badge, OKR aside; missing → calm
 * fallback linking back to 2.4), RIGHT the capture: förderliche resource
 * palette (incl. personalityTraits; min. 3 with counter + cockpit button)
 * and 1–4 measures as whole Ich-Sätze. The plan of a cluster is
 * created on first edit (no ghost plans). recognitionSignal is legacy — no
 * longer collected, existing values shown read-only. Gate: EVERY cluster has
 * ≥3 resources and ≥1 measure. No AI here.
 */
export function Step1Massnahmen({ nav }: { nav: PhaseNavigation }) {
  const branch = useSessionStore((s) => s.session?.meta.branch);
  const clusters = useSessionStore((s) => s.session?.phase1.clusters ?? []);
  const consequences = useSessionStore(
    (s) => s.session?.phase2.consequences ?? [],
  );
  const goalText = useSessionStore((s) => s.session?.phase2.goalText ?? "");
  const plans = useSessionStore((s) => s.session?.phase4.plans ?? []);
  const phase3 = useSessionStore((s) => s.session?.phase3);
  const patch = useSessionStore((s) => s.patch);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cockpitOpen, setCockpitOpen] = useState(false);

  // Förderliche Ressourcen (id-referenced) + a text lookup for display.
  const resById = new Map<string, ResourceItem>(
    phase3
      ? collectSortableResources(phase3).map((entry) => [
          entry.item.id,
          entry.item,
        ])
      : [],
  );
  const foerderliche = phase3
    ? collectSortableResources(phase3)
        .filter((entry) => entry.item.polarity === "foerderlich")
        .map((entry) => ({ id: entry.item.id, text: entry.item.text }))
    : [];
  const foerderlichIds = new Set(foerderliche.map((r) => r.id));
  const resourceText = (id: string): string =>
    resById.get(id)?.text || "(entfernt)";
  /**
   * Counter/gate only count selections that still resolve to a currently
   * förderliche resource — stale ids (resource deleted or re-rated in Phase 3)
   * render no chip and must not satisfy the min-3 gate invisibly.
   */
  const validResourceCount = (plan: ClusterPlan | undefined) =>
    (plan?.resourcesUsed ?? []).filter((id) => foerderlichIds.has(id)).length;

  // Core theme first, then descending by weight (guided-pass order).
  const sorted = [...clusters].sort(
    (a, b) =>
      Number(b.isCore ?? false) - Number(a.isCore ?? false) ||
      (b.weight ?? 0) - (a.weight ?? 0),
  );

  const planOf = (clusterId: string) =>
    plans.find((p) => p.clusterId === clusterId);

  const isComplete = (clusterId: string) => {
    const plan = planOf(clusterId);
    return Boolean(
      plan &&
      validResourceCount(plan) >= MIN_RESOURCES &&
      plan.measures.some((m) => m.text.trim()),
    );
  };

  /**
   * Upsert the plan of a cluster (created on first edit — no ghost plans) and
   * pin the cluster so the derived active cluster doesn't jump mid-input.
   */
  function withPlan(
    clusterId: string,
    updater: (plan: ClusterPlan) => ClusterPlan,
  ) {
    setSelectedId(clusterId);
    patch((s) => {
      const existing = s.phase4.plans.find((p) => p.clusterId === clusterId);
      const base: ClusterPlan = existing ?? {
        clusterId,
        resourcesUsed: [],
        measures: [],
      };
      const next = updater(base);
      return {
        ...s,
        phase4: {
          ...s.phase4,
          plans: existing
            ? s.phase4.plans.map((p) => (p.clusterId === clusterId ? next : p))
            : [...s.phase4.plans, next],
        },
      };
    });
  }

  function toggleResource(clusterId: string, resId: string) {
    withPlan(clusterId, (p) => {
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
    withPlan(clusterId, (p) =>
      p.measures.length >= MAX_MEASURES
        ? p
        : {
            ...p,
            measures: [...p.measures, { id: crypto.randomUUID(), text: "" }],
          },
    );
  }

  function updateMeasure(
    clusterId: string,
    measureId: string,
    partial: Partial<Measure>,
  ) {
    withPlan(clusterId, (p) => ({
      ...p,
      measures: p.measures.map((m) =>
        m.id === measureId ? { ...m, ...partial } : m,
      ),
    }));
  }

  function deleteMeasure(clusterId: string, measureId: string) {
    withPlan(clusterId, (p) => ({
      ...p,
      measures: p.measures.filter((m) => m.id !== measureId),
    }));
  }

  // Exceptional: no clusters at all.
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

  const active =
    sorted.find((c) => c.id === selectedId) ??
    sorted.find((c) => !isComplete(c.id)) ??
    sorted[0];
  const activeIndex = sorted.findIndex((c) => c.id === active.id);
  const activeName = clusterName(active, activeIndex);
  const activePlan = planOf(active.id);
  const activeConsequence = consequences.find((c) => c.clusterId === active.id);
  const badge = activeConsequence
    ? valuationBadge(activeConsequence.valuation)
    : null;
  const resourceCount = validResourceCount(activePlan);
  const measures = activePlan?.measures ?? [];
  const doneCount = sorted.filter((c) => isComplete(c.id)).length;
  const canNext = doneCount === sorted.length;

  return (
    <div className="space-y-6">
      {/* Zielsatz — stets vor Augen */}
      {goalText.trim() ? (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-faint">
            Dein Zielsatz
          </p>
          <p className="mt-2 font-medium leading-relaxed text-foreground">
            {goalText.trim()}
          </p>
        </div>
      ) : null}

      {/* Merkkarte: die vier Qualitäten wirksamer Maßnahmen */}
      <p className="rounded-lg border border-subtle bg-surface-2 px-3 py-2 text-sm text-muted">
        <span className="font-medium text-foreground">Merk dir:</span>{" "}
        {QUALITIES_CARD}
      </p>

      {/* Das Vorgehen je Cluster als Kette (VIS-2). */}
      <MiniFlow
        ariaLabel="Vorgehen je Cluster"
        steps={[
          { label: "Ressourcen wählen", detail: "mindestens 3" },
          { label: "kombinieren", detail: "Ressourcen zusammen denken" },
          { label: "Ich-Satz-Maßnahmen", detail: "3–4 je Cluster" },
        ]}
      />

      {/* Cluster-Navigation */}
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
                  ({cluster.weight})
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
                {done ? " — vollständig" : " — offen"}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-faint">
        {doneCount} von {sorted.length} Clustern vollständig.
      </p>

      {/* Aktives Cluster — Arbeitsblatt-Kopf: Name · Wert (konsistent zu 2.4) */}
      <div className="space-y-5 rounded-xl border border-subtle bg-surface p-4">
        <h3 className="text-sm font-semibold text-foreground">
          {activeName}
          {active.weight != null ? (
            <span className="ml-1.5 text-xs font-normal text-muted">
              · Wert ({active.weight})
            </span>
          ) : null}
        </h3>

        {/* Arbeitsblatt-Layout: Kontext aus Phase 2 links, Erfassung rechts. */}
        <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
          {/* Links — die zwei Fragen aus 2.4, read-only gespiegelt */}
          <div>
            {activeConsequence && activeConsequence.recognition.trim() ? (
              <div className="space-y-3 rounded-lg border border-accent/30 bg-accent/5 p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-faint">
                  <Telescope
                    className="size-4 shrink-0 text-accent"
                    aria-hidden
                  />
                  Dein Wirkindikator aus Phase 2
                </p>
                <p className="text-xs text-muted">{WIRKINDIKATOR_TEXT}</p>
                <div className="space-y-1">
                  <p className="text-xs text-muted">
                    An welcher konkreten Handlung von dir erkennt „{activeName}
                    “, dass du dein Ziel erreicht hast?
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {activeConsequence.recognition.trim()}
                  </p>
                </div>
                {badge ? (
                  <div className="space-y-1">
                    <p className="text-xs text-muted">
                      Wie findet das dein „{activeName}“?
                    </p>
                    <span
                      className={cn(
                        "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                        badge.className,
                      )}
                    >
                      {badge.label}
                    </span>
                  </div>
                ) : null}
                <details className="group">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-accent">
                    <ChevronDown
                      className="size-3.5 motion-safe:transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                    Für OKR-Kenner
                  </summary>
                  <p className="mt-1.5 text-xs text-muted">
                    Falls du mit OKRs vertraut bist: Dein Verhalten pro Cluster
                    beschreibt einen Key Result, dein Zielsatz ist das
                    Objective.
                  </p>
                </details>
              </div>
            ) : (
              <div className="rounded-lg border border-subtle bg-surface-2 p-3">
                <p className="text-sm text-muted">
                  Für dieses Cluster ist noch keine Zielfolge aus Phase 2
                  beschrieben — sie ist dein Wirkindikator für die Maßnahmen.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => nav.goTo(2, 3)}
                >
                  Zu den Folgen deines Ziels
                </Button>
              </div>
            )}
          </div>

          {/* Rechts — Erfassung: Eingesetzte Ressourcen + Maßnahmen */}
          <div className="space-y-5">
            {/* Eingesetzte Ressourcen */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  Eingesetzte Ressourcen
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCockpitOpen(true)}
                >
                  <LayoutDashboard />
                  Cockpit öffnen
                </Button>
              </div>
              <p className="text-xs text-muted">{RESSOURCEN_TEXT}</p>
              {foerderliche.length === 0 ? (
                <p className="text-xs text-faint">
                  Keine als förderlich markierten Ressourcen. Du kannst trotzdem
                  Maßnahmen formulieren — oder in Phase 3 deine Ressourcen als
                  förderlich werten.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {foerderliche.map((res) => {
                    const selected =
                      activePlan?.resourcesUsed.includes(res.id) ?? false;
                    return (
                      <button
                        key={res.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleResource(active.id, res.id)}
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
              <p
                className={cn(
                  "text-xs",
                  resourceCount >= MIN_RESOURCES
                    ? "text-green-600"
                    : "text-faint",
                )}
              >
                {resourceCount} gewählt (mind. {MIN_RESOURCES})
              </p>
            </div>

            {/* Maßnahmen (max. 4) */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                Deine Maßnahmen (max. {MAX_MEASURES})
              </p>
              <p className="text-xs text-muted">
                Lass aus den gewählten Ressourcen konkrete Handlungen entstehen
                — je konkreter du formulierst, desto wahrscheinlicher setzt du
                um.
              </p>

              {/* Kurzregel-Chips (VIS-2). */}
              <ul
                aria-label="Regeln für wirksame Maßnahmen"
                className="flex flex-wrap gap-1.5"
              >
                {[
                  "ganzer Ich-Satz",
                  "Verhalten, kein Gefühl",
                  "keine Verneinung — was tue ich stattdessen?",
                ].map((rule) => (
                  <li
                    key={rule}
                    className="rounded-full border border-subtle bg-surface-2 px-2.5 py-1 text-xs text-muted"
                  >
                    {rule}
                  </li>
                ))}
              </ul>

              {/* Ich-Satz-Coaching als Beispiel-Paar (VIS-2). */}
              <BeispielPaar
                bad="‚Ich bin fröhlich, wenn ich in die Arbeit gehe‘"
                badWhy="ein Gefühl — keine Handlung"
                good="‚Ich begrüße täglich meine Kollegen freundlich und frage sie, wie ich sie unterstützen kann‘"
                goodWhy="konkretes, wahrnehmbares Verhalten"
              />

              {/* Belohnung — freundlicher Mini-Callout (VIS-2). */}
              <InfoCallout
                icon={<Gift className="size-4" />}
                title="Nicht vergessen"
              >
                Du darfst dich hier auch für deine Mühen im{" "}
                {branch === "coached" ? "Coaching" : "Selbstcoaching"} belohnen!
              </InfoCallout>

              {measures.map((measure, index) => (
                <div
                  key={measure.id}
                  className="space-y-2 rounded-lg border border-subtle bg-background p-3"
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
                      onClick={() => deleteMeasure(active.id, measure.id)}
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
                      updateMeasure(active.id, measure.id, {
                        text: event.target.value,
                      })
                    }
                    placeholder="Ich …"
                    className="w-full resize-y rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor={`measure-res-${measure.id}`}
                      className="block text-xs text-muted"
                    >
                      Basiert auf Ressource (optional)
                    </label>
                    <select
                      id={`measure-res-${measure.id}`}
                      value={measure.basedOnResource ?? ""}
                      onChange={(event) =>
                        updateMeasure(active.id, measure.id, {
                          basedOnResource: event.target.value || undefined,
                        })
                      }
                      className="w-full max-w-xs rounded-lg border border-subtle bg-surface px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <option value="">— keine —</option>
                      {(activePlan?.resourcesUsed ?? []).map((rid) => (
                        <option key={rid} value={rid}>
                          {resourceText(rid)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {measure.recognitionSignal?.trim() ? (
                    <p className="text-xs text-faint">
                      Erkennungssignal (früher erfasst):{" "}
                      {measure.recognitionSignal.trim()}
                    </p>
                  ) : null}
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                disabled={measures.length >= MAX_MEASURES}
                onClick={() => addMeasure(active.id)}
              >
                <Plus />
                Maßnahme
              </Button>
              {measures.length >= MAX_MEASURES ? (
                <p className="text-xs text-faint">
                  Maximal {MAX_MEASURES} Maßnahmen — beschränke dich auf 3–4.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {!canNext ? (
        <p className="text-xs text-faint">
          „Weiter“ öffnet sich, wenn jedes Cluster mindestens {MIN_RESOURCES}{" "}
          gewählte Ressourcen und eine Maßnahme hat.
        </p>
      ) : null}

      <NoPersonalDataHint />

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext={canNext}
      />

      <RessourcenCockpitOverlay
        open={cockpitOpen}
        onClose={() => setCockpitOpen(false)}
      />
    </div>
  );
}
