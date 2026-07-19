import { Search } from "lucide-react";
import type { ReactNode } from "react";

import { CloudSymbol } from "@/components/icons/PhaseSymbols";
import { BeispielPaar } from "@/components/method/BeispielPaar";
import { MiniFlow } from "@/components/method/MiniFlow";
import { SkalaBar } from "@/components/method/SkalaBar";
import { CoachCardBoard } from "@/features/cards/CoachCardBoard";
import { normalizeClusters } from "@/features/cards/clusters";
import { GefuehlsAnker } from "@/features/phases/phase1/GefuehlsAnker";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { Card, Cluster } from "@/features/session/types";

const NO_CLUSTERS: Cluster[] = [];

/**
 * Kompakte Merkzeile (FIX 1.4): nur die Regeln — die Begründungen stehen
 * hörbar in den Coaching-Absätzen der Abschnitte, nicht hier gedoppelt.
 */
const CHIPS = [
  "Höchstens 5 Cluster",
  "Überschrift: 1 Begriff, konkret — keine Lösungen",
  "Nicht zu Verschiedenes in ein Cluster mischen",
];

/** Beispiele für gute Cluster-Überschriften (MP1-REV, Paket G). */
const HEADING_EXAMPLES = ["Team", "Chefin", "Ich", "Prozesse"];

/*
 * Die führenden Coaching-Absätze (FIX 1.4 — verbindliche Wortlaute): die
 * Methodik lebt von der Coaching-Stimme; die Visuals darunter ERGÄNZEN sie.
 */
const EINSTIEG =
  "Du hast deine Ist-Situation ausführlich erfasst und beschrieben — eine hervorragende Voraussetzung dafür, deinem Thema jetzt eine bearbeitbare Struktur zu geben.";

const PRUEFEN =
  "Bevor du loslegst, überprüfe bitte noch einmal, ob in deiner Ist-Darstellung keine „Lösungen“ oder „Maßnahmen“ stecken, sondern wirklich nur die Ist-Situation beschrieben ist. Falls du etwas entdeckst, ersetze es durch die Beschreibung des aktuellen Zustands.";

const ORDNEN: ReactNode = (
  // K1: Einleitung · drei Regel-Bullets mit fetten Grenzen · Schlusssatz —
  // Wortlaut unverändert, nur gesetzt.
  <>
    <p>
      Nun zum Ordnen: Löse deine Karten aus der ursprünglichen Fragelogik und
      gruppiere sie in Themenfelder — deine Cluster.
    </p>
    <ul className="ml-4 list-disc space-y-1.5">
      <li>
        Bilde bitte{" "}
        <strong className="font-semibold text-foreground">
          nicht mehr als 5
        </strong>
        : Du wirst deinen Handlungsplan später entlang der Cluster entwickeln,
        und mehr als 5 entpuppt sich oft als zu viel des Guten.
      </li>
      <li>
        <strong className="font-semibold text-foreground">Differenziere</strong>{" "}
        trotzdem — zu unterschiedliche Dinge in einem Cluster machen den
        späteren Handlungsplan ebenso schwer.
      </li>
      <li>
        Gib jedem Cluster eine passende Überschrift: idealerweise{" "}
        <strong className="font-semibold text-foreground">ein Begriff</strong>,
        konkret,{" "}
        <strong className="font-semibold text-foreground">
          keine Lösungen
        </strong>
        .
      </li>
    </ul>
    <p>
      Je konkreter deine Überschrift, desto leichter geht dir die Arbeit später
      von der Hand.
    </p>
  </>
);

const BEWERTEN: ReactNode = (
  <>
    Wenn alle Karten zugeordnet sind und jedes Cluster eine Überschrift hat,
    folgt die Bewertung: Du suchst dein{" "}
    <strong className="font-semibold text-foreground">Kernproblem</strong>. Da,
    wo der Schuh am meisten drückt, vergib bitte die{" "}
    <strong className="font-semibold text-foreground">10</strong> — auch dann,
    wenn du glaubst, daran gar nichts ändern zu können. Es geht nicht um „Was
    muss ich zuerst lösen?“, sondern nur darum, welches Cluster{" "}
    <strong className="font-semibold text-foreground">
      am meisten zu deinem Gefühl beiträgt
    </strong>
    . Danach vergib den anderen Clustern Werte zwischen 1 und 9. Die Abstände
    sind wie eine Schmerzskala: Den niedrigsten Wert bekommt das Cluster, das am
    wenigsten schmerzt. Jeder Wert nur einmal.
  </>
);

/** Sichtbarer Abschnitts-Kopf: Nummern-Kreis (wie im MiniFlow) + Titel. */
function Abschnitt({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={`${n}. ${title}`} className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-sm font-semibold text-accent"
        >
          {n}
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

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
    <div className="space-y-6">
      {/* Gefühls-Anker aus 1.1 — der Bezugspunkt der Bewertung. */}
      <GefuehlsAnker />

      {/* Einstieg — die führende Coaching-Stimme (FIX 1.4). */}
      <p className="text-muted">{EINSTIEG}</p>

      {/* Der Ablauf des Schritts, sichtbar gegliedert. */}
      <MiniFlow
        ariaLabel="Ablauf dieses Schritts"
        steps={[
          { label: "Prüfen", detail: "keine Lösungen im Ist" },
          { label: "Ordnen", detail: "Karten zu Clustern" },
          { label: "Bewerten", detail: "Kernproblem finden" },
        ]}
      />

      {/* 1 — Prüfen */}
      <Abschnitt n={1} title="Prüfen">
        <p className="text-muted">{PRUEFEN}</p>
        <div className="rounded-xl border border-subtle bg-surface-2 p-4">
          <p className="flex items-start gap-2 text-sm font-semibold text-foreground">
            <Search
              className="mt-0.5 size-4 shrink-0 text-accent"
              aria-hidden
            />
            Zuerst prüfen: Beschreibt jede Karte wirklich die Ist-Situation?
          </p>
          <div className="mt-3">
            <BeispielPaar
              bad="„Zeitmanagement“"
              badWhy="ein Schlagwort, keine Beschreibung"
              good="„Ich nehme mir mehr vor, als ich schaffe“"
              goodWhy="oder: „Ich versinke im operativen Geschäft“ — so ist es gerade wirklich"
            />
          </div>
        </div>
      </Abschnitt>

      {/* 2 — Ordnen */}
      <Abschnitt n={2} title="Ordnen">
        <div className="max-w-prose space-y-2 text-muted">{ORDNEN}</div>

        {/* Kompakte Merkzeile — Begründungen stehen im Absatz, nicht hier. */}
        <ul aria-label="Merkzeile" className="flex flex-wrap gap-2">
          {CHIPS.map((chip) => (
            <li
              key={chip}
              className="rounded-full border border-subtle bg-surface px-3 py-1 text-xs text-muted"
            >
              {chip}
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
        <p className="text-sm text-faint">
          {clusters.length} von 5 Clustern angelegt.
        </p>

        <CoachCardBoard
          cards={cards}
          onCardsChange={setCards}
          clusters={clusters}
          onClustersChange={setClusters}
          anchorCard={{ text: istWord, onTextChange: setIstWord }}
        />
      </Abschnitt>

      {/* 3 — Bewerten */}
      <Abschnitt n={3} title="Bewerten">
        <p className="text-muted">{BEWERTEN}</p>
        {clusters.length >= 1 ? (
          <div className="rounded-xl border border-subtle bg-surface-2 p-4">
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
        ) : (
          <p className="text-sm text-faint">
            Die Schmerzskala erscheint, sobald du dein erstes Cluster angelegt
            hast.
          </p>
        )}
      </Abschnitt>

      {!canNext ? (
        <p className="text-sm text-faint">
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
