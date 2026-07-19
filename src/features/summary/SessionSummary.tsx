import type { ReactNode } from "react";

import {
  BoatSymbol,
  CloudSymbol,
  FlagSymbol,
  SuitcaseSymbol,
  SunSymbol,
} from "@/components/icons/PhaseSymbols";
import { BRANCH_LABELS } from "@/config/constants";
import { BRANDING } from "@/config/branding";
import { PHASES } from "@/features/phases/phaseConfig";
import { collectSortableResources } from "@/features/phases/phase3/resourceFields";
import type {
  PhaseCheck,
  ResourceItem,
  Session,
} from "@/features/session/types";

/** Format an ISO datetime's date part as a German date, timezone-safe. */
function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return y && m && d ? `${d}.${m}.${y}` : iso;
}

/** A summary sub-section — heading + body; rendered only when it has content. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="summary-section space-y-2">
      <h3 className="font-serif text-base text-foreground">{title}</h3>
      {children}
    </section>
  );
}

/**
 * One phase block of the summary (K3): a phase symbol + numbered heading, then
 * its sub-sections. In print each phase starts on a new page (`.summary-phase`);
 * the symbol colour follows the Rubikon language (Phase 1 = IST-rosa, else the
 * accent). Rendered only when the phase actually has content.
 */
function PhaseGroup({
  n,
  title,
  symbol,
  ist = false,
  children,
}: {
  n: number;
  title: string;
  symbol: ReactNode;
  ist?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="summary-phase space-y-4">
      <div className="summary-keep flex items-center gap-2.5 border-b border-subtle pb-2">
        <span className={ist ? "text-ist" : "text-accent"}>{symbol}</span>
        <h2 className="font-serif text-xl text-foreground">
          <span className="text-faint">{n} · </span>
          {title}
        </h2>
      </div>
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

  // Ressourcen (Phase 3, MP3-Cockpit-Gliederung) + id→text for Phase 4 refs
  const sortable = collectSortableResources(phase3);
  const resById = new Map(sortable.map((e) => [e.item.id, e.item]));
  const resText = (id: string) => resById.get(id)?.text.trim() || "—";
  const polarityMark = (item: ResourceItem): string =>
    item.polarity === "foerderlich"
      ? " (förderlich)"
      : item.polarity === "hinderlich"
        ? " (hinderlich)"
        : "";
  const listWithPolarity = (items: ResourceItem[]): string =>
    items
      .filter((i) => i.text.trim())
      .map((i) => `${i.text.trim()}${polarityMark(i)}`)
      .join(" · ");
  const personalityTraits = phase3.personalityTraits ?? [];
  const ownResourceRows = (
    [
      ["Intelligenzen", phase3.intelligences],
      ["Motive", phase3.motives],
      ["Persönlichkeitseigenschaften", personalityTraits],
    ] as const
  )
    .map(([label, items]) => ({ label, text: listWithPolarity(items) }))
    .filter((row) => row.text);
  // P8c: Mehrfach-Markierung je Wert — categories mit category-Fallback.
  const valueCats = (i: ResourceItem): string[] =>
    i.categories ?? (i.category ? [i.category] : []);
  const valueColumns = (
    [
      ["mensch", "Als Mensch"],
      ["funktion", "In meiner Funktion"],
      ["ziel", "Für mein Ziel"],
    ] as const
  )
    .map(([category, label]) => ({
      label,
      text: listWithPolarity(
        phase3.values.filter((i) => valueCats(i).includes(category)),
      ),
    }))
    .filter((row) => row.text);
  const valueLegacyText = listWithPolarity(
    phase3.values.filter(
      (i) =>
        !valueCats(i).some((c) => ["mensch", "funktion", "ziel"].includes(c)),
    ),
  );
  // P9: mehrere Personen je Cluster — Werte mit Personen-Zuordnung ausgeben.
  const personNameById = new Map(
    phase3.othersValues
      .filter((i) => i.category === "wer")
      .map((i) => [i.id, i.text.trim()]),
  );
  const othersGroups = clustersSorted
    .map((cluster) => {
      const entries = phase3.othersValues.filter(
        (i) => i.clusterId === cluster.id,
      );
      return {
        id: cluster.id,
        name: cluster.name.trim() || "Cluster",
        wer: entries
          .filter((i) => i.category === "wer")
          .map((i) => i.text.trim())
          .filter(Boolean)
          .join(", "),
        werte: entries
          .filter((i) => !i.category && i.text.trim())
          .map((i) => {
            const person = i.personRef
              ? personNameById.get(i.personRef)
              : undefined;
            return person ? `${person}: ${i.text.trim()}` : i.text.trim();
          }),
      };
    })
    .filter((g) => g.wer || g.werte.length > 0);
  const othersLegacy = phase3.othersValues
    .filter(
      (i) =>
        !i.category &&
        i.text.trim() &&
        (!i.clusterId || !phase1.clusters.some((c) => c.id === i.clusterId)),
    )
    .map((i) => i.text.trim());
  const othersInsight = (phase3.othersValuesInsight ?? "").trim();
  const modelResources = phase3.hypotheses.filter((i) => i.text.trim());
  const erfahrungenText = listWithPolarity(
    phase3.experiential.filter((i) => i.category !== "aussen"),
  );
  const aussenText = listWithPolarity(
    phase3.experiential.filter((i) => i.category === "aussen"),
  );
  const innerText = listWithPolarity(phase3.innerResources);
  const markerText = phase3.somaticMarkers
    .filter((i) => i.text.trim())
    .map((i) => i.text.trim())
    .join(" · ");
  const dontRows = (phase3.dontPattern ?? []).filter(
    (d) => d.resources.trim() || d.behavior.trim() || d.effect.trim(),
  );
  const pastText = phase3.pastPatterns
    .filter((i) => i.text.trim())
    .map((i) => i.text.trim())
    .join(" · ");
  const hasPhase3 =
    ownResourceRows.length > 0 ||
    valueColumns.length > 0 ||
    Boolean(valueLegacyText) ||
    othersGroups.length > 0 ||
    othersLegacy.length > 0 ||
    Boolean(othersInsight) ||
    modelResources.length > 0 ||
    Boolean(erfahrungenText || aussenText || innerText || markerText) ||
    dontRows.length > 0 ||
    Boolean(pastText);

  // Ziel — goalText holds the fully assembled mantra sentence (MP2 contract);
  // old sessions may still carry a free-form goal state text, shown as-is.
  const goalText = phase2.goalText.trim();
  const gefuehl = (phase2.gefuehl ?? "").trim();
  const hasGoal = Boolean(goalText || gefuehl || phase2.datum);
  const comp = phase2.components;
  const fulfilledChecks = (
    [
      ["kontextbezug", "Bezug zum Kernthema"],
      ["terminiert", "Terminiert"],
      ["adressat", "Adressat"],
      ["futurII", "Futur II"],
    ] as const
  )
    .filter(([key]) => Boolean(comp[key]))
    .map(([, label]) => label);
  const hasCriteria =
    comp.emotionalAttraktiv > 0 ||
    comp.selbstErreichbar > 0 ||
    fulfilledChecks.length > 0;

  // Zielfolgen — one per cluster (guided pass) plus legacy free perspectives.
  const goalValuationLabel = (value: string): string =>
    value === "gut"
      ? "Gut"
      : value === "schlecht"
        ? "Schlecht"
        : value === "neutral"
          ? "Neutral"
          : value.trim();
  const consequenceRows = phase2.consequences
    .filter((c) => c.recognition.trim() || c.valuation.trim())
    .map((c) => {
      const cluster = c.clusterId
        ? phase1.clusters.find((cl) => cl.id === c.clusterId)
        : undefined;
      return {
        id: c.id,
        name: cluster?.name.trim() || c.perspective.trim() || "Perspektive",
        isCore: Boolean(cluster?.isCore),
        recognition: c.recognition.trim(),
        valuation: goalValuationLabel(c.valuation),
      };
    });

  // Erkenntnisboard (persistent cross-phase notes)
  const notebook = (session.notebook ?? "").trim();

  // Handlungsplan — Maßnahmenplan-Tabelle (MP4): Cluster | Maßnahme |
  // Bis wann | Hindernisse | Alternativen, plus kompakte Qualitäts-Häkchen.
  const measureQualityMark = (m: (typeof phase4.plans)[0]["measures"][0]) => {
    const answers = [
      m.quality?.zielbeitrag,
      m.quality?.ressourcenbasiert,
      m.quality?.ichSatz,
      m.quality?.neu,
    ];
    if (answers.every((a) => a === undefined)) return "";
    const yes = answers.filter((a) => a === true).length;
    return `${yes}/4 ✓`;
  };
  const planRows = [
    ...clustersSorted.flatMap((cluster) =>
      (phase4.plans.find((p) => p.clusterId === cluster.id)?.measures ?? [])
        .filter((m) => m.text.trim())
        .map((m) => ({
          id: m.id,
          cluster: cluster.name.trim() || "Cluster",
          measure: m,
        })),
    ),
    ...phase4.plans
      .filter((p) => !phase1.clusters.some((c) => c.id === p.clusterId))
      .flatMap((p) =>
        p.measures
          .filter((m) => m.text.trim())
          .map((m) => ({ id: m.id, cluster: "Weitere", measure: m })),
      ),
  ];
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

  // Which phase blocks have any content (→ printed as their own page).
  const p1Has = Boolean(
    phase0.topicSketch.trim() || phase1.istWord.trim() || coreCluster,
  );
  const p2Has = hasGoal || consequenceRows.length > 0;
  const p3Has = hasPhase3;
  // preMortem is only rendered inside the planRows section, so it alone does
  // not open the phase (else an empty phase-4 heading would show).
  const p4Has = planRows.length > 0;
  const p5Has = strategies.length > 0 || Boolean(phase5.insights.trim());
  const notesHas = Boolean(notebook) || reflexionen.length > 0;

  return (
    <article className="summary-print space-y-8">
      {/* Deckblatt-Kopf (K3): Methodenname, Titel, Datum/Zweig + Zielsatz-Karte. */}
      <header className="summary-cover summary-section space-y-3 border-b border-subtle pb-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-faint">
            {BRANDING.appName} · {BRANDING.methodLabel}
          </p>
          <h1 className="font-serif text-3xl text-foreground">
            Meine Coaching-Zusammenfassung
          </h1>
          <p className="text-sm text-muted">
            {formatDate(meta.createdAt)} · {BRANCH_LABELS[meta.branch]}
          </p>
        </div>
        {goalText ? (
          <div className="summary-keep rounded-xl border border-accent/30 bg-accent/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-faint">
              Dein Zielsatz
            </p>
            <p className="mt-1.5 font-serif text-lg leading-relaxed break-words text-foreground">
              {goalText}
            </p>
          </div>
        ) : null}
      </header>

      {p1Has ? (
        <PhaseGroup
          n={1}
          title="IST verstehen"
          symbol={<CloudSymbol className="size-6" />}
          ist
        >
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
                      {c.name.trim() || "Cluster"}
                      {c.weight != null ? ` · Gewicht ${c.weight}` : ""}
                    </li>
                  ))}
                </ul>
              ) : null}
            </Section>
          ) : null}
        </PhaseGroup>
      ) : null}

      {p2Has ? (
        <PhaseGroup
          n={2}
          title="Ziel finden"
          symbol={<SunSymbol className="size-6" />}
        >
          {/* Dein Ziel */}
          {hasGoal ? (
            <Section title="Dein Ziel">
              <p className="font-medium text-foreground">{goalText || "—"}</p>
              {gefuehl ? (
                <p className="text-sm text-muted">
                  <span className="text-foreground">Zielgefühl:</span> {gefuehl}
                </p>
              ) : null}
              {hasCriteria ? (
                <ul className="text-sm text-muted">
                  {comp.emotionalAttraktiv > 0 ? (
                    <li>
                      <span className="text-foreground">
                        Emotional attraktiv:
                      </span>{" "}
                      {comp.emotionalAttraktiv}/10
                    </li>
                  ) : null}
                  {comp.selbstErreichbar > 0 ? (
                    <li>
                      <span className="text-foreground">
                        Selbst erreichbar:
                      </span>{" "}
                      {comp.selbstErreichbar}/10
                    </li>
                  ) : null}
                  {fulfilledChecks.length > 0 ? (
                    <li>
                      <span className="text-foreground">Erfüllt:</span>{" "}
                      {fulfilledChecks.join(", ")}
                    </li>
                  ) : null}
                </ul>
              ) : null}
            </Section>
          ) : null}

          {/* Folgen deines Ziels */}
          {consequenceRows.length > 0 ? (
            <Section title="Folgen deines Ziels">
              <ul className="space-y-2">
                {consequenceRows.map((row) => (
                  <li key={row.id}>
                    <p className="text-sm font-medium text-foreground">
                      {row.name}
                      {row.isCore ? (
                        <span className="font-normal text-muted">
                          {" "}
                          (Kernthema)
                        </span>
                      ) : null}
                      {row.valuation ? (
                        <span className="font-normal text-muted">
                          {" "}
                          — {row.valuation}
                        </span>
                      ) : null}
                    </p>
                    {row.recognition ? (
                      <p className="text-sm text-muted">{row.recognition}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </PhaseGroup>
      ) : null}

      {p3Has ? (
        <PhaseGroup
          n={3}
          title="Ressourcen erkennen"
          symbol={<SuitcaseSymbol className="size-6" />}
        >
          {/* Deine Ressourcen — Cockpit-Gliederung (MP3) */}
          {hasPhase3 ? (
            <Section title="Deine Ressourcen">
              <div className="space-y-3 text-sm">
                {ownResourceRows.map((row) => (
                  <p key={row.label} className="text-muted">
                    <span className="font-medium text-foreground">
                      {row.label}:
                    </span>{" "}
                    {row.text}
                  </p>
                ))}
                {valueColumns.length > 0 || valueLegacyText ? (
                  <div>
                    <p className="font-medium text-foreground">Meine Werte</p>
                    <ul className="ml-4 list-disc text-muted">
                      {valueColumns.map((row) => (
                        <li key={row.label}>
                          <span className="text-foreground">{row.label}:</span>{" "}
                          {row.text}
                        </li>
                      ))}
                      {valueLegacyText ? (
                        <li>
                          <span className="text-foreground">Weitere:</span>{" "}
                          {valueLegacyText}
                        </li>
                      ) : null}
                    </ul>
                  </div>
                ) : null}
                {othersGroups.length > 0 || othersLegacy.length > 0 ? (
                  <div>
                    <p className="font-medium text-foreground">
                      Werte der Anderen
                    </p>
                    <ul className="ml-4 list-disc text-muted">
                      {othersGroups.map((group) => (
                        <li key={group.id}>
                          <span className="text-foreground">{group.name}</span>
                          {group.wer ? ` (${group.wer})` : ""}
                          {group.werte.length > 0
                            ? `: ${group.werte.join(" · ")}`
                            : ""}
                        </li>
                      ))}
                      {othersLegacy.length > 0 ? (
                        <li>
                          <span className="text-foreground">Weitere:</span>{" "}
                          {othersLegacy.join(" · ")}
                        </li>
                      ) : null}
                    </ul>
                  </div>
                ) : null}
                {othersInsight ? (
                  <p className="text-muted">
                    <span className="font-medium text-foreground">
                      Erkenntnisse aus dem Werte-Abgleich:
                    </span>{" "}
                    {othersInsight}
                  </p>
                ) : null}
                {modelResources.length > 0 ? (
                  <div>
                    <p className="font-medium text-foreground">
                      Ressourcen aus Modellen
                    </p>
                    <ul className="ml-4 list-disc text-muted">
                      {modelResources.map((i) => (
                        <li key={i.id}>
                          {i.note?.trim() ? (
                            <span className="text-foreground">
                              {i.note.trim()}:{" "}
                            </span>
                          ) : null}
                          {i.text.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {erfahrungenText || aussenText || innerText ? (
                  <div>
                    <p className="font-medium text-foreground">
                      Weitere Ressourcen
                    </p>
                    <ul className="ml-4 list-disc text-muted">
                      {erfahrungenText ? (
                        <li>
                          <span className="text-foreground">Biografie:</span>{" "}
                          {erfahrungenText}
                        </li>
                      ) : null}
                      {aussenText ? (
                        <li>
                          <span className="text-foreground">
                            Fakten des Kontexts / Andere:
                          </span>{" "}
                          {aussenText}
                        </li>
                      ) : null}
                      {innerText ? (
                        <li>
                          <span className="text-foreground">
                            Innere Ressourcen:
                          </span>{" "}
                          {innerText}
                        </li>
                      ) : null}
                    </ul>
                  </div>
                ) : null}
                {markerText ? (
                  <p className="text-muted">
                    <span className="font-medium text-foreground">
                      Körpersignale:
                    </span>{" "}
                    {markerText}
                  </p>
                ) : null}
                {dontRows.length > 0 ? (
                  <div>
                    <p className="font-medium text-ist">
                      Bisheriges Muster — Don’t!
                    </p>
                    <ul className="ml-4 list-disc text-muted">
                      {dontRows.map((d) => (
                        <li key={d.id}>
                          <span className="text-foreground">
                            {d.resources.trim() || "—"}
                          </span>{" "}
                          → {d.behavior.trim() || "—"} →{" "}
                          {d.effect.trim() || "—"}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {pastText ? (
                  <p className="text-muted">
                    <span className="font-medium text-foreground">
                      Frühere Notizen:
                    </span>{" "}
                    {pastText}
                  </p>
                ) : null}
              </div>
            </Section>
          ) : null}
        </PhaseGroup>
      ) : null}

      {p4Has ? (
        <PhaseGroup
          n={4}
          title="Handlungsplan"
          symbol={<BoatSymbol className="size-6" />}
        >
          {/* Dein Handlungsplan — Maßnahmenplan-Tabelle (MP4) */}
          {planRows.length > 0 ? (
            <Section title="Dein Handlungsplan">
              <table className="w-full table-fixed border-collapse text-sm">
                <caption className="sr-only">
                  Maßnahmenplan: Handlungsfeld, Maßnahme, bis wann, mögliche
                  Hindernisse, Ressourcen und Alternativen
                </caption>
                <thead>
                  <tr className="border-b border-subtle text-left">
                    <th className="w-[15%] py-1.5 pr-3 font-medium text-foreground">
                      Handlungsfeld
                    </th>
                    <th className="w-[24%] py-1.5 pr-3 font-medium text-foreground">
                      Maßnahme
                    </th>
                    <th className="w-[13%] py-1.5 pr-3 font-medium text-foreground">
                      Bis wann
                    </th>
                    <th className="w-[24%] py-1.5 pr-3 font-medium text-foreground">
                      Mögliche Hindernisse
                    </th>
                    <th className="w-[24%] py-1.5 font-medium text-foreground">
                      Ressourcen &amp; Alternativen
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {planRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-subtle align-top"
                    >
                      <td className="py-1.5 pr-3 break-words text-muted">
                        {row.cluster}
                      </td>
                      <td className="py-1.5 pr-3 break-words text-foreground">
                        {row.measure.text.trim()}
                        {/* P13: mehrere Ressourcen je Maßnahme (mit
                            Legacy-Einzelwert-Fallback). */}
                        {(() => {
                          const ids =
                            row.measure.basedOnResources ??
                            (row.measure.basedOnResource
                              ? [row.measure.basedOnResource]
                              : []);
                          return ids.length > 0 ? (
                            <span className="block text-xs text-muted">
                              {ids.length === 1 ? "Ressource" : "Ressourcen"}:{" "}
                              {ids.map(resText).join(" · ")}
                            </span>
                          ) : null;
                        })()}
                        {measureQualityMark(row.measure) ? (
                          <span className="block text-xs text-muted">
                            Qualität: {measureQualityMark(row.measure)}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-1.5 pr-3 text-muted">
                        {row.measure.dueDate
                          ? formatDate(row.measure.dueDate)
                          : "—"}
                      </td>
                      <td className="py-1.5 pr-3 break-words text-muted">
                        {row.measure.obstacles?.trim() || "—"}
                      </td>
                      <td className="py-1.5 break-words text-muted">
                        {row.measure.alternatives?.trim() || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preMortem.length > 0 ? (
                <div className="mt-3">
                  <p className="text-sm font-medium text-foreground">
                    Frühere Hindernis-Notizen
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
        </PhaseGroup>
      ) : null}

      {p5Has ? (
        <PhaseGroup
          n={5}
          title="Dranbleiben"
          symbol={<FlagSymbol className="size-6" />}
        >
          {/* Dranbleiben — Vorlage-Tabelle „Eingesetzte Ressource | Konkrete Strategien" */}
          {strategies.length > 0 ? (
            <Section title="Dranbleiben">
              <table className="w-full table-fixed border-collapse text-sm">
                <caption className="sr-only">
                  Dranbleiben: eingesetzte Ressource und konkrete Strategien
                </caption>
                <thead>
                  <tr className="border-b border-subtle text-left">
                    <th className="w-1/3 py-1.5 pr-3 font-medium text-foreground">
                      Eingesetzte Ressource
                    </th>
                    <th className="py-1.5 font-medium text-foreground">
                      Konkrete Strategien
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {strategies.map((s) => (
                    <tr key={s.id} className="border-b border-subtle align-top">
                      <td className="py-1.5 pr-3 break-words text-foreground">
                        {s.resource.trim() || "—"}
                      </td>
                      <td className="py-1.5 break-words text-muted">
                        {s.concreteStrategy.trim() || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          ) : null}

          {/* Erkenntnisse — multi-line (5.2 appends the notebook with "\n\n") */}
          {phase5.insights.trim() ? (
            <Section title="Erkenntnisse">
              <p className="whitespace-pre-wrap text-foreground">
                {phase5.insights.trim()}
              </p>
            </Section>
          ) : null}
        </PhaseGroup>
      ) : null}

      {notesHas ? (
        <section className="summary-phase space-y-4">
          <div className="summary-keep border-b border-subtle pb-2">
            <h2 className="font-serif text-xl text-foreground">
              Notizen &amp; Reflexion
            </h2>
          </div>
          {/* Erkenntnisboard (Notizbuch — über alle Phasen hinweg) */}
          {notebook ? (
            <Section title="Erkenntnisboard">
              <p className="whitespace-pre-wrap text-foreground">{notebook}</p>
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
                          <span className="text-foreground">
                            {field.label}:
                          </span>{" "}
                          {field.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}
        </section>
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
