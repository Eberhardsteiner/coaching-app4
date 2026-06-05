import { CoachCardBoard } from "@/features/cards/CoachCardBoard";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { Card } from "@/features/session/types";

/**
 * Phase 1, Step 1.2 — Zusammenhänge sammeln (induktiv). Wires the reusable
 * CardBoard to phase1.cards, with the IST word as the pink anchor card.
 * "Weiter" is always possible (no hard minimum; a gentle hint if empty).
 */
export function Step2Zusammenhaenge({ nav }: { nav: PhaseNavigation }) {
  const istWord = useSessionStore((s) => s.session?.phase1.istWord ?? "");
  const cards = useSessionStore((s) => s.session?.phase1.cards ?? []);
  const patch = useSessionStore((s) => s.patch);

  function setCards(next: Card[]) {
    patch((s) => ({ ...s, phase1: { ...s.phase1, cards: next } }));
  }

  return (
    <div>
      <p className="mb-4 text-muted">
        Was hängt alles mit deinem IST-Zustand zusammen? Schreib es auf Karten —
        ein Wort pro Karte (Menschen, Aufgaben, Umstände, Gefühle). Schieb die
        Karten frei herum und gib ihnen Farben, wie es für dich Sinn ergibt.
      </p>

      <CoachCardBoard
        cards={cards}
        onCardsChange={setCards}
        anchorCard={{ text: istWord }}
      />

      {cards.length === 0 ? (
        <p className="mt-3 text-xs text-faint">
          Tipp: Leg mit „+ Karte“ die erste Karte an. Du kannst auch ohne Karten
          weitergehen.
        </p>
      ) : null}

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext
      />
    </div>
  );
}
