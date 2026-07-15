import { ChevronDown, Info, Search } from "lucide-react";

import { CloudSymbol } from "@/components/icons/PhaseSymbols";
import { BeispielPaar } from "@/components/method/BeispielPaar";
import { SkalaBar } from "@/components/method/SkalaBar";
import { CoachCardBoard } from "@/features/cards/CoachCardBoard";
import { normalizeClusters } from "@/features/cards/clusters";
import { GefuehlsAnker } from "@/features/phases/phase1/GefuehlsAnker";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { Card, Cluster } from "@/features/session/types";

const NO_CLUSTERS: Cluster[] = [];

/** Short hint chips for clustering (`why` = kleine Begründungs-Zweitzeile). */
const CHIPS: { text: string; why?: string }[] = [
  {
    text: "Höchstens 5 Cluster",
    why: "Du entwickelst später deinen Handlungsplan entlang der Cluster — mehr als 5 wird dort zu viel.",
  },
  { text: "Überschrift: 1 Begriff, konkret — keine Lösungen" },
  { text: "Nicht zu Verschiedenes in ein Cluster mischen" },
];

/** Beispiele für gute Cluster-Überschriften (MP1-REV, Paket G). */
const HEADING_EXAMPLES = ["Team", "Chefin", "Ich", "Prozesse"];

/** Kernsatz der Bewertung — der Rest wandert aufklappbar in den Callout. */
const EVAL_CORE =
  "Wo drückt der Schuh am meisten? Dieses Cluster bekommt die 10 — die übrigen 1–9, jeder Wert nur einmal.";

const EVAL_DETAIL =
  "Vergib die 10 auch dann, wenn du glaubst, du könntest daran nichts ändern: Es geht nicht ums Lösen, sondern darum, welches Cluster am meisten zu deinem Gefühl beiträgt. Die Abstände zwischen den Werten sind Schmerz-Abstände.";

/**
 * Die Schmerzskala als BEDIENELEMENT (VIS-2): jede benannte Cluster-Zeile ist
 * eine SkalaBar — Werte werden direkt auf der Skala geklickt (belegte Werte
 * sichtbar gesperrt, Klick auf den eigenen Wert entfernt ihn). Bewertete
 * Zeilen sortiert nach Wert, das 10er-Cluster als Kernthema markiert
 * (Wolken-Symbol, ist-Ton); unbewertete liegen in der Ablage „noch ohne
 * Wert" darunter. Das Oval-Dropdown ist dafür zum reinen Wert-Badge geworden.
 */
function Schmerzskala({
  clusters,
  onWeightChange,
}: {
  clusters: Cluster[];
  onWeightChange: (clusterId: string, weight: number | undefined) => void;
}) {
  if (clusters.length === 0) return null;

  // ALLE Cluster (auch noch unbenannte) — sonst wäre ein unbenanntes Cluster
  // mit Gewicht weder sichtbar noch sperrte es seinen Wert (Eindeutigkeit!).
  const rated = clusters
    .filter((c) => c.weight != null)
    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
  const unrated = clusters.filter((c) => c.weight == null);
  const takenFor = (cluster: Cluster) =>
    new Set(
      clusters
        .filter((c) => c.id !== cluster.id && c.weight != null)
        .map((c) => c.weight as number),
    );
  const labelOf = (cluster: Cluster) =>
    cluster.name.trim() || `Cluster ${clusters.indexOf(cluster) + 1}`;

  const row = (cluster: Cluster) => {
    const isCore = Boolean(cluster.isCore) && cluster.weight != null;
    return (
      <li key={cluster.id}>
        <SkalaBar
          label={labelOf(cluster)}
          value={cluster.weight}
          onSelect={(weight) => onWeightChange(cluster.id, weight)}
          taken={takenFor(cluster)}
          tone={isCore ? "ist" : "calm"}
          leadingIcon={
            isCore ? <CloudSymbol className="size-4 shrink-0 text-ist" /> : null
          }
          trailing={
            isCore ? (
              <span className="shrink-0 text-xs font-medium text-ist">
                Kernthema
              </span>
            ) : null
          }
        />
      </li>
    );
  };

  return (
    <div className="space-y-3">
      {/* Beschriftete Enden der Skala */}
      <div
        aria-hidden
        className="flex items-baseline justify-between gap-2 pl-28 text-xs text-faint sm:pl-36"
      >
        <span>1 — schmerzt am wenigsten</span>
        <span className="text-right">
          10 — hier drückt der Schuh am meisten
        </span>
      </div>

      <ul aria-label="Schmerzskala deiner Cluster" className="space-y-2">
        {rated.map(row)}
      </ul>

      {unrated.length > 0 ? (
        <div className="rounded-lg border border-dashed border-subtle p-2.5">
          <p className="text-xs font-medium text-faint">Noch ohne Wert</p>
          <ul aria-label="Cluster noch ohne Wert" className="mt-1.5 space-y-2">
            {unrated.map(row)}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Phase 1, Step 1.4 — Clustern & gewichten. The Schritt-3 cards stay on the same
 * free field, unchanged (Card component, stage colours, positions). The board is
 * the cluster mode (ClusterBoard): blue oval cluster cards on the field, into
 * which the colour cards are dragged/assigned (snap under the oval); each cluster
 * gets a unique weight 1–10. `card.clusterId` is the source of truth; cardIds +
 * isCore are derived via normalizeClusters on every change. Forward is gated
 * until at least one cluster is named.
 */
export function Step4Clustern({ nav }: { nav: PhaseNavigation }) {
  const cards = useSessionStore((s) => s.session?.phase1.cards ?? []);
  const clusters =
    useSessionStore((s) => s.session?.phase1.clusters) ?? NO_CLUSTERS;
  const istWord = useSessionStore((s) => s.session?.phase1.istWord ?? "");
  const patch = useSessionStore((s) => s.patch);

  function setCards(next: Card[]) {
    patch((s) => ({
      ...s,
      phase1: {
        ...s.phase1,
        cards: next,
        clusters: normalizeClusters(next, s.phase1.clusters),
      },
    }));
  }

  function setClusters(next: Cluster[]) {
    patch((s) => ({
      ...s,
      phase1: {
        ...s.phase1,
        clusters: normalizeClusters(s.phase1.cards, next),
      },
    }));
  }

  function setIstWord(text: string) {
    patch((s) => ({ ...s, phase1: { ...s.phase1, istWord: text } }));
  }

  const namedClusters = clusters.filter((c) => c.name.trim() !== "");
  const canNext = namedClusters.length >= 1;

  return (
    <div className="space-y-5">
      {/* Gefühls-Anker aus 1.1 — der Bezugspunkt der Bewertung. */}
      <GefuehlsAnker />

      {/* Compact, collapsible instructions so the whiteboard gets the most space. */}
      <details className="group" open>
        <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-foreground">
          <ChevronDown
            className="size-4 text-muted motion-safe:transition-transform group-open:rotate-180"
            aria-hidden
          />
          Anleitung
        </summary>
        <div className="mt-3 space-y-4">
          {/* Einleitung */}
          <p className="text-muted">
            Du hast deine Ist-Situation ausführlich erfasst — eine starke
            Grundlage. Jetzt gibst du ihr eine bearbeitbare Struktur.
          </p>

          {/* Callout: Zuerst prüfen */}
          <div className="rounded-xl border border-subtle bg-surface-2 p-4">
            <p className="flex items-start gap-2 text-sm font-semibold text-foreground">
              <Search
                className="mt-0.5 size-4 shrink-0 text-accent"
                aria-hidden
              />
              Zuerst prüfen: Beschreibt jede Karte wirklich die Ist-Situation?
            </p>
            <p className="mt-1.5 text-sm text-muted">
              Manchmal schleicht sich eine Lösung oder Maßnahme ein. Geh kurz
              über deine Karten — und wenn eine nicht beschreibt, wie es gerade
              ist, formuliere den tatsächlichen Zustand.
            </p>

            {/* Vorher / Nachher (Baukasten) */}
            <div className="mt-3">
              <BeispielPaar
                bad="„Zeitmanagement“"
                badWhy="ein Schlagwort, keine Beschreibung"
                good="„Ich nehme mir mehr vor, als ich schaffe“"
                goodWhy="oder: „Ich versinke im operativen Geschäft“ — so ist es gerade wirklich"
              />
            </div>
          </div>

          {/* Hinweis-Chips + Beispiele für gute Überschriften */}
          <ul className="flex flex-wrap gap-2">
            {CHIPS.map((chip) => (
              <li
                key={chip.text}
                title={chip.why}
                className="max-w-72 rounded-2xl border border-subtle bg-surface px-3 py-1 text-xs text-muted"
              >
                {chip.text}
                {chip.why ? (
                  <span className="block text-[0.65rem] leading-snug text-faint">
                    {chip.why}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
          <p className="flex flex-wrap items-center gap-1.5 text-xs text-faint">
            Gute Überschriften — konkrete Personen oder Gruppen, ein
            „Ich“-Cluster, Abstraktes:
            {HEADING_EXAMPLES.map((example) => (
              <span
                key={example}
                className="rounded-full border border-dashed border-subtle bg-surface px-2 py-0.5 text-xs text-muted"
              >
                {example}
              </span>
            ))}
          </p>
        </div>
      </details>

      {/* Bewerten direkt auf der Schmerzskala — sichtbar, sobald es Cluster gibt. */}
      {clusters.length >= 1 ? (
        <div className="rounded-xl border border-subtle bg-surface-2 p-4">
          <p className="flex items-start gap-2 text-sm font-semibold text-foreground">
            <Info
              className="mt-0.5 size-4 shrink-0 text-blue-600"
              aria-hidden
            />
            Cluster bewerten — klick den Wert direkt auf der Skala an
          </p>
          <p className="mt-1 text-sm text-muted">{EVAL_CORE}</p>
          <details className="group mt-1">
            <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-accent">
              <ChevronDown
                className="size-3.5 motion-safe:transition-transform group-open:rotate-180"
                aria-hidden
              />
              Worauf es bei der 10 ankommt
            </summary>
            <p className="mt-1 text-sm text-muted">{EVAL_DETAIL}</p>
          </details>
          <div className="mt-3">
            <Schmerzskala
              clusters={clusters}
              onWeightChange={(clusterId, weight) =>
                setClusters(
                  clusters.map((c) =>
                    c.id === clusterId ? { ...c, weight } : c,
                  ),
                )
              }
            />
          </div>
        </div>
      ) : null}

      <CoachCardBoard
        cards={cards}
        onCardsChange={setCards}
        clusters={clusters}
        onClustersChange={setClusters}
        anchorCard={{ text: istWord, onTextChange: setIstWord }}
      />

      {!canNext ? (
        <p className="text-xs text-faint">
          Lege mindestens ein benanntes Cluster an, um fortzufahren.
        </p>
      ) : null}

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext={canNext}
      />
    </div>
  );
}
