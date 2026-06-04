import { CardBoard } from "@/features/cards/CardBoard";
import { hasWeightTie, normalizeClusters } from "@/features/cards/clusters";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { Card, Cluster } from "@/features/session/types";

/**
 * Phase 1, Step 1.4 — Clustern & gewichten. Bundle related cards into up to five
 * weighted clusters; the highest-weight cluster becomes the core theme. Uses the
 * CardBoard in cluster mode. `card.clusterId` is the source of truth; cardIds +
 * isCore are kept derived via normalizeClusters on every change. Forward is
 * gated until at least one cluster has a name (every cluster always has a weight).
 */
export function Step4Clustern({ nav }: { nav: PhaseNavigation }) {
  const cards = useSessionStore((s) => s.session?.phase1.cards ?? []);
  const clusters = useSessionStore((s) => s.session?.phase1.clusters ?? []);
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
  const tie = hasWeightTie(clusters);

  return (
    <div className="space-y-5">
      <p className="text-muted">
        Fasse verwandte Karten zu Clustern zusammen — höchstens fünf. Gib jedem
        Cluster einen Namen und gewichte, wie stark es dich beschäftigt (1–10).
        Das am stärksten gewichtete Cluster ist dein Kernthema — daran arbeiten
        wir in den nächsten Phasen weiter.
      </p>

      {tie ? (
        <p
          role="status"
          className="rounded-lg border border-subtle bg-surface-2 p-3 text-sm text-muted"
        >
          Mehrere Cluster haben dasselbe höchste Gewicht. Magst du die Gewichte
          etwas differenzieren, damit ein Kernthema klar hervortritt?
        </p>
      ) : null}

      <CardBoard
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
