import { ChevronDown, Info } from "lucide-react";

import { CoachCardBoard } from "@/features/cards/CoachCardBoard";
import { normalizeClusters } from "@/features/cards/clusters";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { Card, Cluster } from "@/features/session/types";

const NO_CLUSTERS: Cluster[] = [];

/** Intro + "keine Lösungen"-Check (verbatim). */
const INTRO =
  "Nun hast du deine Ist-Situation ausführlich erfasst und beschrieben. Das ist eine hervorragende Voraussetzung dafür, dass du deinem Thema nun eine bearbeitbare Struktur geben kannst. Bevor du loslegst, überprüfe bitte nochmal, ob in deiner Ist-Darstellung auch keine ‚Lösungen‘ oder ‚Maßnahmen‘ liegen, sondern wirklich nur die Ist-Situation beschrieben ist. Falls du noch etwas entdeckst, ersetze die Punkte bitte durch die zugehörige Beschreibung des aktuellen Zustands.";

/** Collapsible example (verbatim). */
const EXAMPLE =
  "Du findest bei dir eine Karte ‚Zeitmanagement‘. Dann frage dich bitte, ob ‚Zeitmanagement‘ wirklich beschreibt, wie es gerade ist. Falls nein (und das ist sehr wahrscheinlich), dann frage dich, wie die Situation wirklich ist. Das könnte sein: ‚Ich nehme mir mehr vor als ich schaffe‘. Oder ‚Versinke im operativen Geschäft‘ …";

/** Ordering hints (verbatim). */
const ORDER_HINT =
  "Doch nun zum Ordnen: Du kannst nun deine ganzen Karten aus der ursprünglichen Fragelogik lösen und sie in verschiedene Themenfelder oder Cluster gruppieren. Bilde bitte nicht mehr als 5 Cluster. Du wirst später deinen Handlungsplan entlang der Cluster entwickeln und mehr als 5 entpuppt sich oft als zu viel des Guten. Trotzdem solltest du differenzieren und nicht zu unterschiedliche Dinge in 1 Cluster packen. Das ist ebenfalls herausfordernd für den späteren Handlungsplan. Bitte gib den Clustern passende Überschriften. Auch hier: keine Lösungen und idealerweise nur 1 Begriff. Je konkreter deine Überschrift (z. B. konkrete Personen oder Gruppen, ein Cluster ‚Ich‘, aber auch Abstraktes wie ‚Prozesse‘ etc. eignen sich gut), desto leichter geht dir die Arbeit später von der Hand.";

/** Weighting hints (verbatim) — shown once clustering has begun. */
const EVAL_HINT =
  "Wenn du nun alle deine Karten den Clustern zugeordnet und Überschriften gefunden hast, dann folgt abschließend die Bewertung der Cluster. Du bist auf der Suche nach deinem Kernproblem. Da, wo der Schuh am meisten drückt, vergib bitte die 10. Auch dann, falls du bei dem Punkt denkst, dass du da gar nichts ändern kannst. Es geht auch nicht um eine Lösungsperspektive im Sinne von ‚was muss ich als erstes lösen?‘, sondern nur um die Frage, welches Cluster trägt am meisten zu deinem Gefühl bei. Wenn du dich entschieden hast, dann vergib auch den anderen Clustern Werte zwischen 1–9. Die Abstände zwischen den Werten sind wie eine Art Schmerzskala. Den niedrigsten Wert bekommt das Cluster, das am wenigsten schmerzt. Vergib bitte die Werte jeweils nur 1×.";

/**
 * Phase 1, Step 1.4 — Clustern & gewichten. The Schritt-3 cards are taken over
 * unchanged (same texts + stage colours; no reset) and then grouped into up to
 * five clusters, each labelled by a blue oval and given a unique weight 1–10
 * (10 = drückt am meisten → Kernproblem). Cluster mode of the board:
 * `card.clusterId` is the source of truth; cardIds + isCore are derived via
 * normalizeClusters on every change. Forward is gated until at least one cluster
 * is named.
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

  const namedClusters = clusters.filter((c) => c.name.trim() !== "");
  const canNext = namedClusters.length >= 1;

  return (
    <div className="space-y-5">
      {/* Intro + keine-Lösungen-Check (verbatim) */}
      <p className="text-muted">{INTRO}</p>

      {/* Example (collapsed by default) */}
      <details className="group rounded-xl border border-subtle bg-surface p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-foreground">
          Beispiel: Ist das wirklich die Ist-Situation?
          <ChevronDown
            className="size-4 text-muted motion-safe:transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <p className="mt-3 text-sm text-muted">{EXAMPLE}</p>
      </details>

      {/* Ordering hints (verbatim) */}
      <p className="text-muted">{ORDER_HINT}</p>

      {/* Weighting hints — shown once at least one cluster exists (beim Bewerten). */}
      {clusters.length >= 1 ? (
        <div className="flex items-start gap-2 rounded-xl border border-subtle bg-surface-2 p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Cluster bewerten
            </p>
            <p className="mt-1 text-sm text-muted">{EVAL_HINT}</p>
          </div>
        </div>
      ) : null}

      <CoachCardBoard
        cards={cards}
        onCardsChange={setCards}
        clusters={clusters}
        onClustersChange={setClusters}
        anchorCard={{ text: istWord }}
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
