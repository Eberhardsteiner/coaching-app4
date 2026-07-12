import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { ResourceListEditor } from "@/features/phases/phase3/ResourceListEditor";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { Measure, ResourceItem } from "@/features/session/types";

/** Stable empty default — preMortem is optional (legacy). */
const NO_ITEMS: ResourceItem[] = [];

/** One row of the Maßnahmenplan: a measure with its cluster name. */
type PlanRow = { clusterId: string; clusterName: string; measure: Measure };

type UpdateMeasure = (
  clusterId: string,
  measureId: string,
  partial: Partial<Measure>,
) => void;

/** „Bis wann" — date input bound to measure.dueDate. */
function DueField({
  row,
  onUpdate,
}: {
  row: PlanRow;
  onUpdate: UpdateMeasure;
}) {
  return (
    <input
      type="date"
      aria-label={`Bis wann: ${row.measure.text.slice(0, 40)}`}
      value={row.measure.dueDate ?? ""}
      onChange={(event) =>
        onUpdate(row.clusterId, row.measure.id, {
          dueDate: event.target.value || undefined,
        })
      }
      className="w-full rounded-lg border border-subtle bg-surface px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    />
  );
}

/** „Mögliche Hindernisse" — textarea bound to measure.obstacles. */
function ObstaclesField({
  row,
  onUpdate,
}: {
  row: PlanRow;
  onUpdate: UpdateMeasure;
}) {
  return (
    <textarea
      aria-label={`Mögliche Hindernisse: ${row.measure.text.slice(0, 40)}`}
      value={row.measure.obstacles ?? ""}
      rows={2}
      onChange={(event) =>
        onUpdate(row.clusterId, row.measure.id, {
          obstacles: event.target.value,
        })
      }
      placeholder="Was kann dazwischenkommen?"
      className="w-full resize-y rounded-lg border border-subtle bg-surface px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    />
  );
}

/** „Ressourcen & Alternativen" (Plan B) — textarea bound to alternatives. */
function AlternativesField({
  row,
  onUpdate,
}: {
  row: PlanRow;
  onUpdate: UpdateMeasure;
}) {
  return (
    <textarea
      aria-label={`Ressourcen & Alternativen: ${row.measure.text.slice(0, 40)}`}
      value={row.measure.alternatives ?? ""}
      rows={2}
      onChange={(event) =>
        onUpdate(row.clusterId, row.measure.id, {
          alternatives: event.target.value,
        })
      }
      placeholder="Plan B — aus deinen Ressourcen"
      className="w-full resize-y rounded-lg border border-subtle bg-surface px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    />
  );
}

/**
 * Phase 4, Step 4.3 — Maßnahmenplan (MP4, neu). The template's table:
 * Handlungsfeld (Cluster) | Maßnahme | Bis wann | Mögliche Hindernisse |
 * Ressourcen & Alternativen (Plan B). Cluster + measure are read-only (from
 * 4.1/4.2); dueDate/obstacles/alternatives are edited here (additive Measure
 * fields). Responsive: a real table on md+, stacked cards below. Legacy
 * preMortem entries stay visible below (editable/deletable) with a hint to
 * carry them over. No gate — Termine/Plan B sind empfohlen, nicht erzwungen.
 */
export function Step3Plan({ nav }: { nav: PhaseNavigation }) {
  const clusters = useSessionStore((s) => s.session?.phase1.clusters ?? []);
  const plans = useSessionStore((s) => s.session?.phase4.plans ?? []);
  const preMortem =
    useSessionStore((s) => s.session?.phase4.preMortem) ?? NO_ITEMS;
  const patch = useSessionStore((s) => s.patch);

  const sorted = [...clusters].sort(
    (a, b) =>
      Number(b.isCore ?? false) - Number(a.isCore ?? false) ||
      (b.weight ?? 0) - (a.weight ?? 0),
  );

  const rows: PlanRow[] = [
    ...sorted.flatMap((cluster, index) =>
      (plans.find((p) => p.clusterId === cluster.id)?.measures ?? [])
        .filter((m) => m.text.trim())
        .map((measure) => ({
          clusterId: cluster.id,
          clusterName: cluster.name.trim() || `Cluster ${index + 1}`,
          measure,
        })),
    ),
    // Legacy plans whose cluster no longer exists.
    ...plans
      .filter((p) => !clusters.some((c) => c.id === p.clusterId))
      .flatMap((p) =>
        p.measures
          .filter((m) => m.text.trim())
          .map((measure) => ({
            clusterId: p.clusterId,
            clusterName: "Weitere",
            measure,
          })),
      ),
  ];

  function updateMeasure(
    clusterId: string,
    measureId: string,
    partial: Partial<Measure>,
  ) {
    patch((s) => ({
      ...s,
      phase4: {
        ...s.phase4,
        plans: s.phase4.plans.map((p) =>
          p.clusterId === clusterId
            ? {
                ...p,
                measures: p.measures.map((m) =>
                  m.id === measureId ? { ...m, ...partial } : m,
                ),
              }
            : p,
        ),
      },
    }));
  }

  function setPreMortem(next: ResourceItem[]) {
    patch((s) => ({ ...s, phase4: { ...s.phase4, preMortem: next } }));
  }

  return (
    <div className="space-y-6">
      <p className="text-muted">
        Trag deine gewählten Maßnahmen der besseren Übersicht halber in eine
        Tabelle ein. Falls dir etwas einfällt, was deinem Plan in die Quere
        kommen kann, überlege dir schon einmal einen Plan B. Ressourcenbasiert,
        versteht sich!
      </p>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-subtle bg-surface p-6 text-center text-sm text-faint">
          Noch keine Maßnahmen — geh zurück zu Schritt 4.1 und formuliere sie.
        </p>
      ) : (
        <>
          {/* md+: die Tabelle der Vorlage */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">
                Maßnahmenplan: Handlungsfeld, Maßnahme, Bis wann, mögliche
                Hindernisse, Ressourcen und Alternativen
              </caption>
              <thead>
                <tr className="border-b border-subtle text-left">
                  <th className="py-2 pr-3 font-medium text-foreground">
                    Handlungsfeld
                  </th>
                  <th className="py-2 pr-3 font-medium text-foreground">
                    Maßnahme
                  </th>
                  <th className="w-36 py-2 pr-3 font-medium text-foreground">
                    Bis wann
                  </th>
                  <th className="w-1/5 py-2 pr-3 font-medium text-foreground">
                    Mögliche Hindernisse
                  </th>
                  <th className="w-1/5 py-2 font-medium text-foreground">
                    Ressourcen &amp; Alternativen
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.measure.id}
                    className="border-b border-subtle align-top"
                  >
                    <td className="py-2.5 pr-3 text-muted">
                      {row.clusterName}
                    </td>
                    <td className="py-2.5 pr-3 text-foreground">
                      {row.measure.text.trim()}
                    </td>
                    <td className="py-2.5 pr-3">
                      <DueField row={row} onUpdate={updateMeasure} />
                    </td>
                    <td className="py-2.5 pr-3">
                      <ObstaclesField row={row} onUpdate={updateMeasure} />
                    </td>
                    <td className="py-2.5">
                      <AlternativesField row={row} onUpdate={updateMeasure} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* schmale Screens: Karten statt Tabellenzeilen */}
          <div className="space-y-3 md:hidden">
            {rows.map((row) => (
              <div
                key={row.measure.id}
                className="space-y-2 rounded-xl border border-subtle bg-surface p-4"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-faint">
                  {row.clusterName}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {row.measure.text.trim()}
                </p>
                <div className="space-y-1">
                  <p className="text-xs text-muted">Bis wann</p>
                  <DueField row={row} onUpdate={updateMeasure} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted">Mögliche Hindernisse</p>
                  <ObstaclesField row={row} onUpdate={updateMeasure} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted">
                    Ressourcen &amp; Alternativen
                  </p>
                  <AlternativesField row={row} onUpdate={updateMeasure} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Legacy preMortem — nothing is thrown away. */}
      {preMortem.length > 0 ? (
        <div className="space-y-2 border-t border-subtle pt-5">
          <p className="text-sm font-medium text-foreground">
            Frühere Hindernis-Notizen
          </p>
          <p className="text-xs text-muted">
            Diese Notizen stammen aus einer früheren Bearbeitung. Übertrage sie
            am besten in die Spalte „Mögliche Hindernisse“ deiner Tabelle — dann
            kannst du sie hier löschen.
          </p>
          <ResourceListEditor
            items={preMortem}
            onItemsChange={setPreMortem}
            addLabel="Notiz"
            itemLabel="Notiz"
            hideAdd
          />
        </div>
      ) : null}

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
