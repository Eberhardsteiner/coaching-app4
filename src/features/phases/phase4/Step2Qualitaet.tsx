import { Lightbulb } from "lucide-react";

import { InfoCallout } from "@/components/method/InfoCallout";
import { useSessionStore } from "@/features/session/sessionStore";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { JaNeinCheck } from "@/features/phases/phase4/JaNeinCheck";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import type {
  Cluster,
  ClusterPlan,
  Measure,
  MeasureQuality,
} from "@/features/session/types";
import { cn } from "@/lib/utils";

/** Die vier Kriterien wirksamer Maßnahmen (Methodik). */
const CRITERIA: {
  key: keyof MeasureQuality;
  label: string;
  /** Kurzlabel für die Status-Badge-Reihe je Cluster (VIS-2). */
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
 * Die Vier-Kriterien-Badge-Reihe eines Clusters (VIS-2): je Kriterium ein
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

/**
 * Phase 4, Step 4.2 — Qualitätsprüfung. F4: the four criteria are checked
 * once per cluster (→ ClusterPlan.quality; undefined = unchecked, false =
 * deliberately no), no longer per measure. The measures of the cluster stay
 * inline-editable above the check (sharpen without switching steps); a denied
 * criterion shows a calm nudge. No gate: „Weiter“ always works (rule 7).
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
    key: keyof MeasureQuality,
    value: boolean | undefined,
  ) {
    patch((s) => ({
      ...s,
      phase4: {
        ...s.phase4,
        plans: s.phase4.plans.map((p) =>
          p.clusterId === clusterId
            ? { ...p, quality: { ...p.quality, [key]: value } }
            : p,
        ),
      },
    }));
  }

  // Groups in guided-pass order. Deliberately UNFILTERED by text: a measure
  // being emptied mid-edit must not unmount its textarea under the cursor.
  const groups: { plan: ClusterPlan; name: string; isCore: boolean }[] = [
    ...sorted.flatMap((cluster, index) => {
      const plan = plans.find((p) => p.clusterId === cluster.id);
      return plan && plan.measures.length > 0
        ? [
            {
              plan,
              name: clusterName(cluster, index),
              isCore: Boolean(cluster.isCore),
            },
          ]
        : [];
    }),
    // Legacy plans whose cluster no longer exists — still review material.
    ...plans
      .filter(
        (p) =>
          p.measures.length > 0 && !clusters.some((c) => c.id === p.clusterId),
      )
      .map((plan) => ({ plan, name: "Weitere Maßnahmen", isCore: false })),
  ];
  const hasMeasures = groups.some((g) =>
    g.plan.measures.some((m) => m.text.trim()),
  );
  const isChecked = (plan: ClusterPlan) =>
    CRITERIA.every((c) => plan.quality?.[c.key] !== undefined);
  const checkedCount = groups.filter((g) => isChecked(g.plan)).length;

  return (
    <div className="space-y-6">
      <p className="text-muted">
        Wenn du mit deinen Maßnahmen fertig bist, überprüfe sie bitte je Cluster
        noch einmal nach den Kriterien für wirksame Maßnahmen.
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

      {!hasMeasures ? (
        <p className="rounded-lg border border-dashed border-subtle bg-surface p-6 text-center text-sm text-faint">
          Noch keine Maßnahmen — geh einen Schritt zurück und formuliere sie.
        </p>
      ) : (
        <div className="space-y-5">
          {groups.map(({ plan, name, isCore }) => {
            const denied = CRITERIA.some(
              (c) => plan.quality?.[c.key] === false,
            );
            return (
              <section
                key={plan.clusterId}
                aria-label={name}
                className="space-y-3 rounded-xl border border-subtle bg-surface p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    {name}
                    {isCore ? (
                      <span className="rounded-full bg-accent/10 px-1.5 text-[0.65rem] font-medium uppercase tracking-wide text-accent">
                        Kernthema
                      </span>
                    ) : null}
                  </h3>
                  <QualityBadges quality={plan.quality} />
                </div>
                <div className="space-y-2">
                  {plan.measures.map((measure, index) => (
                    <div key={measure.id} className="space-y-1">
                      <label
                        htmlFor={`q-measure-${measure.id}`}
                        className="block text-xs font-medium text-faint"
                      >
                        Maßnahme {index + 1} (hier direkt nachschärfen)
                      </label>
                      <textarea
                        id={`q-measure-${measure.id}`}
                        value={measure.text}
                        rows={2}
                        onChange={(event) =>
                          updateMeasure(plan.clusterId, measure.id, {
                            text: event.target.value,
                          })
                        }
                        className="w-full resize-y rounded-lg border border-subtle bg-background px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-t border-subtle pt-3">
                  <p className="text-sm font-medium text-foreground">
                    Treffen die Kriterien auf die Maßnahmen dieses Clusters zu?
                  </p>
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
                        <JaNeinCheck
                          value={plan.quality?.[criterion.key]}
                          onChange={(next) =>
                            setQuality(plan.clusterId, criterion.key, next)
                          }
                          ariaContext={`${criterion.label}: ${name}`}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
                {denied ? (
                  <p className="rounded-lg border border-amber-600/30 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    Ein Kriterium ist noch nicht erfüllt — formuliere die
                    Maßnahmen nach oder passe sie an, bis sie tragen.
                  </p>
                ) : null}
              </section>
            );
          })}
        </div>
      )}

      {hasMeasures ? (
        <p className="text-sm text-faint">
          {checkedCount} von {groups.length} Clustern geprüft.
        </p>
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
