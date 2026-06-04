import { useRef, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/features/cards/Card";
import { DEFAULT_CARD_COLOR } from "@/features/cards/cardColors";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import type { Card as CardModel, Cluster } from "@/features/session/types";

type CardBoardProps = {
  cards: CardModel[];
  onCardsChange: (next: CardModel[]) => void;
  /** Optional fixed IST anchor card (pink, not editable). */
  anchorCard?: { text: string };
  readOnly?: boolean;
  // Reserved for Phase 1, step 4 (clustering) — unused in this prompt:
  clusters?: Cluster[];
  onClustersChange?: (next: Cluster[]) => void;
};

/**
 * Reusable moderation-card board. Props-driven (no store access here): the
 * parent owns the data and persists it. Create / edit / delete / recolour cards
 * and move them freely (pointer + keyboard); positions commit on pointerup.
 * No connection lines. Pink anchor = the IST card.
 */
export function CardBoard({
  cards,
  onCardsChange,
  anchorCard,
  readOnly,
}: CardBoardProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);

  function addCard() {
    const offset = (cards.length % 5) * 22;
    const newCard: CardModel = {
      id: crypto.randomUUID(),
      text: "",
      color: DEFAULT_CARD_COLOR,
      x: 20 + offset,
      y: 96 + offset, // below the anchor card
      visibility: "shared",
    };
    setFocusId(newCard.id);
    onCardsChange([...cards, newCard]);
  }

  function updateCard(updated: CardModel) {
    onCardsChange(cards.map((c) => (c.id === updated.id ? updated : c)));
  }

  function deleteCard(id: string) {
    onCardsChange(cards.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-3">
      {!readOnly ? (
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={addCard}>
            <Plus />
            Karte
          </Button>
          <p className="text-xs text-faint">
            {cards.length} {cards.length === 1 ? "Karte" : "Karten"}
          </p>
        </div>
      ) : null}

      <div
        ref={boardRef}
        className="relative h-[440px] w-full touch-none overflow-hidden rounded-xl border border-subtle bg-surface-2"
      >
        {anchorCard ? (
          <div className="absolute left-1/2 top-4 w-44 -translate-x-1/2 rounded-lg border border-ist/40 bg-pink-50 p-3 text-center shadow-sm">
            <p className="text-[0.65rem] font-medium uppercase tracking-wide text-ist">
              IST-Zustand
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-pink-900">
              {anchorCard.text || "—"}
            </p>
          </div>
        ) : null}

        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            boardRef={boardRef}
            readOnly={readOnly}
            autoFocus={card.id === focusId}
            onChange={updateCard}
            onDelete={deleteCard}
          />
        ))}

        {cards.length === 0 && !anchorCard ? (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-faint">
            Noch keine Karten.
          </p>
        ) : null}
      </div>

      {!readOnly ? <NoPersonalDataHint /> : null}
    </div>
  );
}
