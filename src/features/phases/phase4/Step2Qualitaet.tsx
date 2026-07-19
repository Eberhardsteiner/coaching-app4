import { Lightbulb } from "lucide-react";

import { InfoCallout } from "@/components/method/InfoCallout";
import { useSessionStore } from "@/features/session/sessionStore";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import type {
  Cluster,
  Measure,
  MeasureQuality,
} from "@/features/session/types";
import { cn } from "@/lib/utils";

/** Die vier Kriterien wirksamer Maßnahmen (Methodik). */
const CRITERIA: {
  key: keyof MeasureQuality;
  label: string;
  /** Kurzlabel für die Status-Badge-Reihe je Maßnahme (VIS-2). */
  short: string;
  hint?: string;
}[] = [
  { key: "zielbeitrag", label: "Zahlt in mein Ziel ein", short: "Ziel" },
  {
    key: "ressourcenbasiert",
    label: "Beruht auf meinen gewählten Ressourcen",
    short: "Ressourcen",
  },
  { key: "ichSatz", label: "Ganzer Ich-Satz", short: "Ich-Satz" },
  {
    key: "neu",
    label: "Neu",
    short: "Neu",
    hint: "Falls nicht gänzlich neu, dann zumindest qualitativ oder quantitativ neu.",
  },
];

/**
 * Die Vier-Kriterien-Badge-Reihe einer Maßnahme (VIS-2): je Kriterium ein
 * kleines Status-Badge — grün = ja, amber = bewusst nein, neutral = offen.
 * Reine Anzeige; geprüft wird über die ja/nein-Schalter darunter.
 */
function QualityBadges({ quality }: { quality?: MeasureQuality }) {
  return (
    <span aria-hidden className="flex flex-wrap gap-1">
      {CRITERIA.map((criterion) => {
        const value = quality?.[criterion.key];
        return (
          <span
            key={criterion.key}
            className={cn(
              "rounded-full px-2 py-0.5 text-[0.65rem] font-medium",
              value === true
                ? "bg-green-400/20 text-green-800"
                : value === false
                  ? "bg-amber-100/60 text-amber-900"
                  : "bg-surface-2 text-faint",
            )}
          >
            {criterion.short}
            {value === true ? " ✓" : value === false ? " ✗" : ""}
          </span>
        );
      })}
    </span>
  );
}

function clusterName(cluster: Cluster, index: number): string {
  return cluster.name.trim() || `Cluster ${index + 1}`;
}

/** One yes/no check (three-state: undefined = ungeprüft; click active clears). */
function QualityCheck({
  value,
  onChange,
  ariaContext,
}: {
  value?: boolean;
  onChange: (next: boolean | undefined) => void;
  ariaContext: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaContext}
      className="inline-flex shrink-0 overflow-hidden rounded-lg border border-subtle"
    >
      <button
        type="button"
        aria-pressed={value === true}
        onClick={() => onChange(value === true ? undefined : true)}
        className={cn(
          "px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
          value === true
            ? "bg-green-600 text-white"
            : "bg-surface text-muted hover:text-foreground",
        )}
      >
        ja
      </button>
      <button
        type="button"
        aria-pressed={value === false}
        onClick={() => onChange(value === false ? undefined : false)}
        className={cn(
          "border-l border-subtle px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
          value === false
            ? "bg-amber-600 text-white"
            : "bg-surface text-muted hover:text-foreground",
        )}
      >
        nein
      </button>
    </div>
  );
}

/**
 * Phase 4, Step 4.2 — Qualitätsprüfung (MP4, neu). Every measure of every
 * cluster (grouped, guided-pass order) gets the four quality checks
 * (→ measure.quality; undefined = unchecked, false = deliberately no). The
 * measures stay inline-editable (sharpen without switching steps); a denied
 * criterion shows a calm nudge. Gate (weich-streng): every measure is fully
 * CHECKED — all four answered, not necessarily with yes.
 */
export function Step2Qualitaet({ nav }: { nav: PhaseNavigation }) {
  const clusters = useSessionStore((s) => s.session?.phase1.clusters ?? []);
  const plans = useSessionStore((s) => s.session?.phase4.plans ?? []);
  const patch = useSessionStore((s) => s.patch);

  const sorted = [...clusters].sort(
    (a, b) =>
      Number(b.isCore ?? false) - Number(a.isCore ?? false) ||
      (b.weight ?? 0) - (a.weight ?? 0),
  );

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

  function setQuality(
    clusterId: string,
    measure: Measure,
    key: keyof MeasureQuality,
    value: boolean | undefined,
  ) {
    updateMeasure(clusterId, measure.id, {
      quality: { ...measure.quality, [key]: value },
    });
  }

  // Groups in guided-pass order. Deliberately UNFILTERED by text: a measure
  // being emptied mid-edit must not unmount its textarea under the cursor.
  // Empty rows are visible (placeholder) but don't count as review material.
  const groups = sorted
    .map((cluster, index) => ({
      cluster,
      name: clusterName(cluster, index),
      measures: plans.find((p) => p.clusterId === cluster.id)?.measures ?? [],
    }))
    .filter((g) => g.measures.length > 0);
  // Legacy plans whose cluster no longer exists — still review material.
  const orphanMeasures = plans
    .filter((p) => !clusters.some((c) => c.id === p.clusterId))
    .flatMap((p) =>
      p.measures.map((m) => ({ clusterId: p.clusterId, measure: m })),
    );

  const allMeasures = [
    ...groups.flatMap((g) =>
      g.measures.map((m) => ({ clusterId: g.cluster.id, measure: m })),
    ),
    ...orphanMeasures,
  ].filter((e) => e.measure.text.trim());
  const isChecked = (m: Measure) =>
    CRITERIA.every((c) => m.quality?.[c.key] !== undefined);
  const checkedCount = allMeasures.filter((e) => isChecked(e.measure)).length;
  const canNext = allMeasures.length > 0 && checkedCount === allMeasures.length;

  return (
    <div className="space-y-6">
      <p className="text-muted">
        Wenn du mit deinen Maßnahmen fertig bist, überprüfe sie bitte alle noch
        einmal nach den Kriterien für wirksame Maßnahmen.
      </p>

      {/* Fehlende Ressourcen? — Callout, Beispiel aufklappbar (VIS-2). */}
      <InfoCallout
        icon={<Lightbulb className="size-4" />}
        title="Fehlende Ressourcen?"
        tone="neutral"
        detail={
          <p>
            Beispiel: Du hast erkannt, dir fehlt Führungswissen — dann landet
            das möglicherweise als ‚Ich bewerbe mich in der Personalabteilung um
            Teilnahme an einem Führungstraining ab dem nächsten Quartal‘ in
            deinem Handlungsplan.
          </p>
        }
        detailLabel="Beispiel ansehen"
      >
        Hast du fehlende, aber erforderliche Ressourcen in Maßnahmen übersetzt?
      </InfoCallout>

      {allMeasures.length === 0 ? (
        <p className="rounded-lg border border-dashed border-subtle bg-surface p-6 text-center text-sm text-faint">
          Noch keine Maßnahmen — geh einen Schritt zurück und formuliere sie.
        </p>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <section
              key={group.cluster.id}
              aria-label={group.name}
              className="space-y-3"
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                {group.name}
                {group.cluster.isCore ? (
                  <span className="rounded-full bg-accent/10 px-1.5 text-[0.65rem] font-medium uppercase tracking-wide text-accent">
                    Kernthema
                  </span>
                ) : null}
              </h3>
              {group.measures.map((measure) => {
                const denied = CRITERIA.some(
                  (c) => measure.quality?.[c.key] === false,
                );
                return (
                  <div
                    key={measure.id}
                    className="space-y-3 rounded-xl border border-subtle bg-surface p-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label
                          htmlFor={`q-measure-${measure.id}`}
                          className="block text-xs font-medium text-faint"
                        >
                          Maßnahme (hier direkt nachschärfen)
                        </label>
                        <QualityBadges quality={measure.quality} />
                      </div>
                      <textarea
                        id={`q-measure-${measure.id}`}
                        value={measure.text}
                        rows={2}
                        onChange={(event) =>
                          updateMeasure(group.cluster.id, measure.id, {
                            text: event.target.value,
                          })
                        }
                        className="w-full resize-y rounded-lg border border-subtle bg-background px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      />
                    </div>
                    <ul className="space-y-2">
                      {CRITERIA.map((criterion) => (
                        <li
                          key={criterion.key}
                          className="flex flex-wrap items-center justify-between gap-2"
                        >
                          <span className="min-w-0 text-sm text-foreground">
                            {criterion.label}
                            {criterion.hint ? (
                              <span className="block text-xs text-faint">
                                {criterion.hint}
                              </span>
                            ) : null}
                          </span>
                          <QualityCheck
                            value={measure.quality?.[criterion.key]}
                            onChange={(next) =>
                              setQuality(
                                group.cluster.id,
                                measure,
                                criterion.key,
                                next,
                              )
                            }
                            ariaContext={`${criterion.label} für Maßnahme „${measure.text.slice(0, 40)}“`}
                          />
                        </li>
                      ))}
                    </ul>
                    {denied ? (
                      <p className="rounded-lg border border-amber-600/30 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                        Ein Kriterium ist noch nicht erfüllt — formuliere die
                        Maßnahme nach oder passe sie an, bis sie trägt.
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </section>
          ))}

          {orphanMeasures.length > 0 ? (
            <section aria-label="Weitere Maßnahmen" className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Weitere Maßnahmen
              </h3>
              <p className="text-sm text-muted">
                Diese Maßnahmen stammen aus einem Plan ohne (aktuelles) Cluster.
              </p>
              {orphanMeasures.map(({ clusterId, measure }) => (
                <div
                  key={measure.id}
                  className="space-y-3 rounded-xl border border-subtle bg-surface p-4"
                >
                  <QualityBadges quality={measure.quality} />
                  <textarea
                    aria-label="Maßnahme"
                    value={measure.text}
                    rows={2}
                    onChange={(event) =>
                      updateMeasure(clusterId, measure.id, {
                        text: event.target.value,
                      })
                    }
                    className="w-full resize-y rounded-lg border border-subtle bg-background px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                  <ul className="space-y-2">
                    {CRITERIA.map((criterion) => (
                      <li
                        key={criterion.key}
                        className="flex flex-wrap items-center justify-between gap-2"
                      >
                        <span className="min-w-0 text-sm text-foreground">
                          {criterion.label}
                        </span>
                        <QualityCheck
                          value={measure.quality?.[criterion.key]}
                          onChange={(next) =>
                            setQuality(clusterId, measure, criterion.key, next)
                          }
                          ariaContext={`${criterion.label} für Maßnahme „${measure.text.slice(0, 40)}“`}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ) : null}
        </div>
      )}

      <p className="text-sm text-faint">
        {checkedCount} von {allMeasures.length} Maßnahmen geprüft.
        {!canNext
          ? " „Weiter“ öffnet sich, wenn jede Maßnahme vollständig geprüft ist — ja oder bewusst nein."
          : ""}
      </p>

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
