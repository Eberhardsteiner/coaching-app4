import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import { GripVertical, Trash2 } from "lucide-react";

import { CARD_COLORS, getCardColor } from "@/features/cards/cardColors";
import { VisibilityToggle } from "@/features/cards/VisibilityToggle";
import {
  effectiveVisibility,
  toggleVisibility,
} from "@/features/cards/visibility";
import type { Card as CardModel } from "@/features/session/types";
import { cn } from "@/lib/utils";

/** Approximate card size — used to clamp positions inside the board. */
const CARD_WIDTH = 152;
const CARD_HEIGHT = 88;
/** Keyboard nudge distance per arrow press. */
const KEY_STEP = 16;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

type CardProps = {
  card: CardModel;
  boardRef: RefObject<HTMLDivElement | null>;
  readOnly?: boolean;
  /** Show the per-card visibility toggle (coached branch only). */
  allowVisibilityToggle?: boolean;
  /** Focus the text field on mount (for a freshly added card). */
  autoFocus?: boolean;
  onChange: (card: CardModel) => void;
  onDelete: (id: string) => void;
};

/**
 * A single moderation card: draggable (pointer, mouse + touch; committed on
 * pointerup), keyboard-movable (arrows on the grip), inline-editable text, a
 * cycle-through colour button and delete. No connection lines.
 */
export function Card({
  card,
  boardRef,
  readOnly,
  allowVisibilityToggle,
  autoFocus,
  onChange,
  onDelete,
}: CardProps) {
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const startRef = useRef<{
    px: number;
    py: number;
    ox: number;
    oy: number;
  } | null>(null);

  const baseX = card.x ?? 16;
  const baseY = card.y ?? 16;
  const x = drag?.x ?? baseX;
  const y = drag?.y ?? baseY;
  const color = getCardColor(card.color);
  const visibility = effectiveVisibility(card);
  // The coach_only style only applies where the mechanic is active (coached).
  const coachOnly =
    Boolean(allowVisibilityToggle) && visibility === "coach_only";

  function boardSize() {
    const rect = boardRef.current?.getBoundingClientRect();
    return {
      maxX: Math.max(0, (rect?.width ?? 0) - CARD_WIDTH),
      maxY: Math.max(0, (rect?.height ?? 0) - CARD_HEIGHT),
    };
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (readOnly) return;
    // setPointerCapture can throw if the pointer is already gone — ignore.
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* no-op */
    }
    startRef.current = {
      px: event.clientX,
      py: event.clientY,
      ox: baseX,
      oy: baseY,
    };
    setDrag({ x: baseX, y: baseY });
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const start = startRef.current;
    if (!start) return;
    const { maxX, maxY } = boardSize();
    setDrag({
      x: clamp(start.ox + (event.clientX - start.px), 0, maxX),
      y: clamp(start.oy + (event.clientY - start.py), 0, maxY),
    });
  }

  function onPointerUp(event: PointerEvent<HTMLButtonElement>) {
    const start = startRef.current;
    if (!start) return;
    const { maxX, maxY } = boardSize();
    const fx = clamp(start.ox + (event.clientX - start.px), 0, maxX);
    const fy = clamp(start.oy + (event.clientY - start.py), 0, maxY);
    startRef.current = null;
    setDrag(null);
    // Only commit (and trigger autosave) if the card actually moved.
    if (fx !== start.ox || fy !== start.oy) {
      onChange({ ...card, x: fx, y: fy });
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (readOnly) return;
    const deltas: Record<string, [number, number]> = {
      ArrowLeft: [-KEY_STEP, 0],
      ArrowRight: [KEY_STEP, 0],
      ArrowUp: [0, -KEY_STEP],
      ArrowDown: [0, KEY_STEP],
    };
    const delta = deltas[event.key];
    if (!delta) return;
    event.preventDefault();
    const { maxX, maxY } = boardSize();
    onChange({
      ...card,
      x: clamp(baseX + delta[0], 0, maxX),
      y: clamp(baseY + delta[1], 0, maxY),
    });
  }

  function cycleColor() {
    const index = CARD_COLORS.findIndex(
      (c) => c.id === (card.color ?? "neutral"),
    );
    const next = CARD_COLORS[(index + 1) % CARD_COLORS.length];
    onChange({ ...card, color: next.id });
  }

  return (
    <div
      style={{ left: x, top: y, width: CARD_WIDTH }}
      className={cn(
        "absolute flex flex-col gap-1 rounded-lg border p-2 shadow-sm",
        coachOnly ? "border-dashed border-muted" : "border-subtle",
        color.surface,
        drag ? "z-10 shadow-md" : "",
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <button
          type="button"
          aria-label="Karte verschieben (Pfeiltasten zum Versetzen)"
          title="Verschieben"
          disabled={readOnly}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onKeyDown={onKeyDown}
          className="flex size-6 cursor-grab touch-none items-center justify-center rounded text-current/60 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="flex items-center gap-0.5">
          {allowVisibilityToggle ? (
            <VisibilityToggle
              visibility={visibility}
              disabled={readOnly}
              onToggle={() =>
                onChange({ ...card, visibility: toggleVisibility(visibility) })
              }
            />
          ) : null}
          <button
            type="button"
            onClick={cycleColor}
            disabled={readOnly}
            aria-label={`Farbe wechseln (aktuell: ${color.label})`}
            title={`Farbe: ${color.label}`}
            className="flex size-6 items-center justify-center rounded hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span
              className={cn(
                "size-3.5 rounded-full border border-black/10",
                color.swatch,
              )}
            />
          </button>
          <button
            type="button"
            onClick={() => onDelete(card.id)}
            disabled={readOnly}
            aria-label="Karte löschen"
            title="Löschen"
            className="flex size-6 items-center justify-center rounded text-current/60 hover:bg-black/5 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
      <input
        type="text"
        value={card.text}
        autoFocus={autoFocus}
        readOnly={readOnly}
        onChange={(event) => onChange({ ...card, text: event.target.value })}
        placeholder="ein Wort …"
        aria-label="Kartentext"
        className="w-full rounded bg-transparent px-1 py-0.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
    </div>
  );
}
