import { ArrowRight, Check, ChevronDown, Info, Search, X } from "lucide-react";

import { CoachCardBoard } from "@/features/cards/CoachCardBoard";
import { normalizeClusters } from "@/features/cards/clusters";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { Card, Cluster } from "@/features/session/types";

const NO_CLUSTERS: Cluster[] = [];

/** Short hint chips for clustering. */
const CHIPS = [
  "Höchstens 5 Cluster",
  "Überschrift: 1 Begriff, konkret — keine Lösungen",
  "Nicht zu Verschiedenes in ein Cluster mischen",
];

const EVAL_HINT =
  "Wo drückt der Schuh am meisten? Dieses Cluster bekommt die 10 — auch wenn du glaubst, du könntest daran nichts ändern. Es geht nicht ums Lösen, sondern darum, was am meisten zu deinem Gefühl beiträgt. Die übrigen bekommen Werte 1–9, jeder nur einmal.";

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

            {/* Vorher / Nachher */}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="flex items-center gap-1.5 text-sm font-medium text-red-700">
                  <X className="size-4 shrink-0" aria-hidden />
                  „Zeitmanagement“
                </p>
                <p className="mt-0.5 pl-5 text-xs text-red-700/80">
                  ein Schlagwort, keine Beschreibung
                </p>
              </div>
              <ArrowRight
                className="mx-auto size-4 shrink-0 rotate-90 text-faint sm:rotate-0"
                aria-hidden
              />
              <div className="flex-1 rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="flex items-center gap-1.5 text-sm font-medium text-green-800">
                  <Check className="size-4 shrink-0" aria-hidden />
                  „Ich nehme mir mehr vor, als ich schaffe“
                </p>
                <p className="mt-0.5 pl-5 text-xs text-green-800/80">
                  so ist es gerade wirklich
                </p>
              </div>
            </div>
          </div>

          {/* Hinweis-Chips */}
          <ul className="flex flex-wrap gap-2">
            {CHIPS.map((chip) => (
              <li
                key={chip}
                className="rounded-full border border-subtle bg-surface px-3 py-1 text-xs text-muted"
              >
                {chip}
              </li>
            ))}
          </ul>
        </div>
      </details>

      {/* Bewertungs-Hinweis — erst beim Bewerten (sobald es Cluster gibt). */}
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
