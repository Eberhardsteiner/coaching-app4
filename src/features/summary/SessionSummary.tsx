import type { ReactNode } from "react";

import { BRANDING } from "@/config/branding";
import { PHASES } from "@/features/phases/phaseConfig";
import { collectSortableResources } from "@/features/phases/phase3/resourceFields";
import type { PhaseCheck, Session } from "@/features/session/types";

/** Format an ISO datetime's date part as a German date, timezone-safe. */
function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return y && m && d ? `${d}.${m}.${y}` : iso;
}

/** A summary section — heading + body; rendered only when it has content. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="summary-section space-y-2">
      <h2 className="font-serif text-lg text-foreground">{title}</h2>
      {children}
    </section>
  );
}

const CHECK_LABELS: [keyof PhaseCheck, string][] = [
  ["result", "Ergebnis"],
  ["process", "Prozess"],
  ["insight", "Erkenntnis"],
  ["transfer", "Transfer"],
];

/**
 * Read-only, name-free summary across all phases, rendered straight from the
 * session model. Robust against missing fields: empty sections are omitted.
 * Persona-independent colours (foreground/muted; pink only for IST) so it prints
 * neutrally. No store access — the parent passes the session.
 */
export function SessionSummary({ session }: { session: Session }) {
  const { meta, phase0, phase1, phase2, phase3, phase4, phase5 } = session;

  // Kernthema + clusters
  const coreCluster = phase1.clusters.find((c) => c.isCore);
  const coreLabel = coreCluster?.name.trim() || "dein Kernthema";
  const otherClusters = phase1.clusters.filter((c) => !c.isCore);
  const clustersSorted = [...phase1.clusters].sort(
    (a, b) => Number(b.isCore ?? false) - Number(a.isCore ?? false),
  );

  // Ressourcen (Phase 3) + id→text resolution for Phase-4 references
  const sortable = collectSortableResources(phase3);
  const resById = new Map(sortable.map((e) => [e.item.id, e.item]));
  const resText = (id: string) => resById.get(id)?.text.trim() || "—";
  const foerderliche = sortable
    .filter((e) => e.item.polarity === "foerderlich")
    .map((e) => e.item.text.trim())
    .filter(Boolean);
  const hinderliche = sortable
    .filter((e) => e.item.polarity === "hinderlich")
    .map((e) => e.item.text.trim())
    .filter(Boolean);

  // Ziel
  const hasGoal = Boolean(phase2.goalText.trim() || phase2.datum);
  const goalDatum = phase2.datum ? formatDate(phase2.datum) : "—";
  const goalText = phase2.goalText.trim() || "—";

  // Handlungsplan
  const plansByCluster = new Map(phase4.plans.map((p) => [p.clusterId, p]));
  const planClusters = clustersSorted.filter((cluster) => {
    const plan = plansByCluster.get(cluster.id);
    return plan && plan.measures.length > 0;
  });
  const preMortem = (phase4.preMortem ?? [])
    .map((i) => i.text.trim())
    .filter(Boolean);

  // Dranbleiben
  const strategies = phase5.strategies.filter(
    (s) => s.resource.trim() || s.concreteStrategy.trim(),
  );

  // Reflexionen (non-empty check fields per phase)
  const reflexionen = (
    [
      [PHASES[1].title, phase1.check],
      [PHASES[2].title, phase2.check],
      [PHASES[3].title, phase3.check],
      [PHASES[4].title, phase4.check],
      [PHASES[5].title, phase5.check],
    ] as const
  )
    .map(([title, check]) => ({
      title,
      fields: CHECK_LABELS.filter(([key]) => check[key].trim()).map(
        ([key, label]) => ({ label, value: check[key].trim() }),
      ),
    }))
    .filter((entry) => entry.fields.length > 0);

  return (
    <article className="space-y-8">
      {/* Head */}
      <header className="summary-section space-y-1 border-b border-subtle pb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-faint">
          {BRANDING.appName}
        </p>
        <h1 className="font-serif text-2xl text-foreground">Zusammenfassung</h1>
        <p className="text-sm text-muted">{formatDate(meta.createdAt)}</p>
      </header>

      {/* Dein Thema */}
      {phase0.topicSketch.trim() || phase1.istWord.trim() ? (
        <Section title="Dein Thema">
          {phase0.topicSketch.trim() ? (
            <p className="text-foreground">{phase0.topicSketch.trim()}</p>
          ) : null}
          {phase1.istWord.trim() ? (
            <p className="inline-flex flex-wrap items-center gap-2 rounded-lg border border-ist/40 bg-pink-50 px-3 py-1.5 text-sm">
              <span className="text-[0.65rem] font-medium uppercase tracking-wide text-ist">
                IST
              </span>
              <span className="font-medium text-pink-900">
                {phase1.istWord.trim()}
              </span>
              {typeof phase1.istBurden === "number" ? (
                <span className="text-pink-900/70">
                  · Belastung {phase1.istBurden}/10
                </span>
              ) : null}
            </p>
          ) : null}
        </Section>
      ) : null}

      {/* Dein Kernthema */}
      {coreCluster ? (
        <Section title="Dein Kernthema">
          <p className="font-medium text-foreground">{coreLabel}</p>
          {otherClusters.length > 0 ? (
            <ul className="ml-4 list-disc text-sm text-muted">
              {otherClusters.map((c) => (
                <li key={c.id}>
                  {c.name.trim() || "Cluster"} · Gewicht {c.weight}
                </li>
              ))}
            </ul>
          ) : null}
        </Section>
      ) : null}

      {/* Dein Ziel */}
      {hasGoal ? (
        <Section title="Dein Ziel">
          <p className="text-foreground">
            Ab dem {goalDatum} werde ich {goalText} in Bezug auf {coreLabel}{" "}
            erreicht haben.
          </p>
        </Section>
      ) : null}

      {/* Deine Ressourcen */}
      {foerderliche.length > 0 || hinderliche.length > 0 ? (
        <Section title="Deine Ressourcen">
          {foerderliche.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-foreground">Förderlich</p>
              <ul className="ml-4 list-disc text-foreground">
                {foerderliche.map((text, i) => (
                  <li key={`f-${i}-${text}`}>{text}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {hinderliche.length > 0 ? (
            <div className="mt-2">
              <p className="text-sm font-medium text-foreground">Hinderlich</p>
              <ul className="ml-4 list-disc text-muted">
                {hinderliche.map((text, i) => (
                  <li key={`h-${i}-${text}`}>{text}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </Section>
      ) : null}

      {/* Dein Handlungsplan */}
      {planClusters.length > 0 ? (
        <Section title="Dein Handlungsplan">
          <div className="space-y-3">
            {planClusters.map((cluster) => {
              const plan = plansByCluster.get(cluster.id);
              if (!plan) return null;
              return (
                <div key={cluster.id}>
                  <p className="text-sm font-medium text-foreground">
                    {cluster.name.trim() || "Cluster"}
                    {cluster.isCore ? " (Kernthema)" : ""}
                  </p>
                  <ul className="ml-4 list-disc space-y-1 text-foreground">
                    {plan.measures.map((m) => (
                      <li key={m.id}>
                        {m.text.trim() || "—"}
                        {m.basedOnResource ? (
                          <span className="text-muted">
                            {" "}
                            — Ressource: {resText(m.basedOnResource)}
                          </span>
                        ) : null}
                        {m.recognitionSignal?.trim() ? (
                          <span className="text-muted">
                            {" "}
                            — Signal: {m.recognitionSignal.trim()}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          {preMortem.length > 0 ? (
            <div className="mt-3">
              <p className="text-sm font-medium text-foreground">
                Mögliche Hindernisse
              </p>
              <ul className="ml-4 list-disc text-muted">
                {preMortem.map((text, i) => (
                  <li key={`pm-${i}-${text}`}>{text}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </Section>
      ) : null}

      {/* Dranbleiben */}
      {strategies.length > 0 ? (
        <Section title="Dranbleiben">
          <ul className="space-y-2">
            {strategies.map((s) => (
              <li key={s.id}>
                <p className="text-sm font-medium text-foreground">
                  {s.resource.trim() || "—"}
                </p>
                {s.concreteStrategy.trim() ? (
                  <p className="text-sm text-muted">
                    {s.concreteStrategy.trim()}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Erkenntnisse */}
      {phase5.insights.trim() ? (
        <Section title="Erkenntnisse">
          <p className="text-foreground">{phase5.insights.trim()}</p>
        </Section>
      ) : null}

      {/* Reflexionen */}
      {reflexionen.length > 0 ? (
        <Section title="Reflexionen">
          <div className="space-y-3">
            {reflexionen.map((entry) => (
              <div key={entry.title}>
                <p className="text-sm font-medium text-foreground">
                  {entry.title}
                </p>
                <ul className="text-sm text-muted">
                  {entry.fields.map((field) => (
                    <li key={field.label}>
                      <span className="text-foreground">{field.label}:</span>{" "}
                      {field.value}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Footer (§9.0 spirit) */}
      <footer className="summary-section border-t border-subtle pt-4">
        <p className="text-xs text-faint">
          Diese Zusammenfassung enthält deine Eingaben und bleibt bei dir.
        </p>
      </footer>
    </article>
  );
}
