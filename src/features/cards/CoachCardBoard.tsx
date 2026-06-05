import { useState } from "react";
import { Eye, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardBoard, type CardBoardProps } from "@/features/cards/CardBoard";
import { stageVisibleCards } from "@/features/cards/visibility";
import { useSessionStore } from "@/features/session/sessionStore";

/** Props the parent supplies — visibility/preview are controlled internally. */
type CoachCardBoardProps = Omit<
  CardBoardProps,
  "readOnly" | "allowVisibilityToggle"
>;

/**
 * Coach-aware wrapper around CardBoard. In the self branch it renders CardBoard
 * unchanged (no visibility UI). In the coached branch it adds:
 *  - a per-card visibility toggle (shared ↔ coach_only) on the board, and
 *  - a "Bühnen-Vorschau" switch that shows the board read-only with only the
 *    shared cards (via stageVisibleCards) — exactly the coachee-facing view.
 *
 * Phases use this in place of CardBoard wherever they want the coach mechanics;
 * the self branch is unaffected.
 */
export function CoachCardBoard(props: CoachCardBoardProps) {
  const branch = useSessionStore((s) => s.session?.meta.branch);
  const [preview, setPreview] = useState(false);

  // Self branch: unchanged behaviour, no visibility mechanics.
  if (branch !== "coached") {
    return <CardBoard {...props} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-subtle bg-surface-2 px-3 py-2">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          {preview ? (
            <Eye className="size-4 text-accent" aria-hidden />
          ) : (
            <Pencil className="size-4 text-muted" aria-hidden />
          )}
          {preview ? "Bühnen-Vorschau" : "Coach-Ansicht"}
        </span>
        <Button
          variant="outline"
          size="sm"
          aria-pressed={preview}
          onClick={() => setPreview((value) => !value)}
        >
          {preview ? "Zur Coach-Ansicht" : "Bühnen-Vorschau"}
        </Button>
      </div>

      {preview ? (
        <CardBoard {...props} cards={stageVisibleCards(props.cards)} readOnly />
      ) : (
        <CardBoard {...props} allowVisibilityToggle />
      )}
    </div>
  );
}
