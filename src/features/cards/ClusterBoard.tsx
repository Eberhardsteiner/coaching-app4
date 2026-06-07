import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/features/cards/Card";
import { MAX_CLUSTERS } from "@/features/cards/clusters";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import type { Card as CardModel, Cluster } from "@/features/session/types";
import { cn } from "@/lib/utils";

type ClusterBoardProps = {
  cards: CardModel[];
  onCardsChange: (next: CardModel[]) => void;
  clusters: Cluster[];
  onClustersChange: (next: Cluster[]) => void;
  /** Optional fixed IST anchor card (rosa, never clustered). */
  anchorCard?: { text: string; label?: string; hint?: string };
  readOnly?: boolean;
  /** Show the per-card visibility toggle (coached branch only). */
  allowVisibilityToggle?: boolean;
};

/* Layout constants (card size mirrors Card.tsx). */
const CARD_W = 152;
const CARD_H = 88;
const OVAL_W = 230;
const OVAL_H = 44;
const GAP = 12;
const MEMBER_STEP = CARD_H + GAP;
const KEY_STEP = 16;
const FIELD_MIN = 560;

/** The unique 1..10 weight scale (10 = "drückt am meisten"). */
const WEIGHTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const atLeast = (min: number, values: number[]) =>
  values.length ? Math.max(min, ...values) : min;

/**
 * Cluster mode of the moderation board — the **same free field** as Schritt 3.
 * The colour cards are the unchanged `Card` component (free xy, stage colours);
 * a new **blue oval** card per cluster sits on the field as a draggable, named
 * label. Dragging a colour card onto an oval (or the per-card cluster select)
 * assigns it (`card.clusterId`) and snaps it into the stack **under** that oval,
 * so a cluster's cards lie together. Each cluster gets a **unique** weight 1–10
 * (10 = drückt am meisten); taken values are locked. No Kanban columns, no list.
 */
export function ClusterBoard({
  cards,
  onCardsChange,
  clusters,
  onClustersChange,
  anchorCard,
  readOnly,
  allowVisibilityToggle,
}: ClusterBoardProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const clusterById = new Map(clusters.map((c) => [c.id, c]));
  const cardById = new Map(cards.map((c) => [c.id, c]));

  // Live offset while a cluster's oval (and its member cards) is being dragged.
  const [ovalDrag, setOvalDrag] = useState<{
    id: string;
    dx: number;
    dy: number;
  } | null>(null);
  const ovalStart = useRef<{ px: number; py: number } | null>(null);

  function membersOf(clusterId: string): CardModel[] {
    return cards.filter((card) => card.clusterId === clusterId);
  }

  function clusterBottom(cluster: Cluster): number {
    return (
      (cluster.y ?? 0) +
      OVAL_H +
      GAP +
      membersOf(cluster.id).length * MEMBER_STEP
    );
  }

  const fieldMinHeight =
    atLeast(FIELD_MIN, [
      ...cards.map((c) => (c.y ?? 0) + CARD_H),
      ...clusters.map((c) => clusterBottom(c)),
    ]) + 24;

  /** Which cluster oval (by its header rect) sits under a board point. */
  function clusterAtPoint(x: number, y: number): Cluster | null {
    for (const cluster of clusters) {
      const ox = cluster.x ?? 0;
      const oy = cluster.y ?? 0;
      if (x >= ox && x <= ox + OVAL_W && y >= oy && y <= oy + OVAL_H)
        return cluster;
    }
    return null;
  }

  /** The slot position for the next card added to a cluster (under its oval). */
  function slotFor(
    clusterId: string,
    excludeId: string,
  ): { x: number; y: number } {
    const cluster = clusterById.get(clusterId);
    const ox = cluster?.x ?? 0;
    const oy = cluster?.y ?? 0;
    const count = cards.filter(
      (c) => c.clusterId === clusterId && c.id !== excludeId,
    ).length;
    return { x: ox, y: oy + OVAL_H + GAP + count * MEMBER_STEP };
  }

  /** Assign a card to a cluster (or none) and snap it under the oval. */
  function assignCard(card: CardModel, clusterId: string | undefined) {
    let next: CardModel = { ...card, clusterId };
    if (clusterId) {
      const slot = slotFor(clusterId, card.id);
      next = { ...next, x: slot.x, y: slot.y };
    }
    onCardsChange(cards.map((c) => (c.id === card.id ? next : c)));
  }

  /**
   * A card moved (drag or keyboard) → if its centre now sits over a different
   * cluster's oval, re-assign + snap; if it left its cluster onto free space,
   * unassign. Otherwise just persist the new position.
   */
  function handleCardChange(updated: CardModel) {
    const prev = cardById.get(updated.id);
    const moved = prev && (prev.x !== updated.x || prev.y !== updated.y);
    let next = updated;
    if (moved) {
      const cx = (updated.x ?? 0) + CARD_W / 2;
      const cy = (updated.y ?? 0) + CARD_H / 2;
      const target = clusterAtPoint(cx, cy);
      const targetId = target?.id;
      if (targetId !== prev.clusterId) {
        next = { ...next, clusterId: targetId };
        if (targetId) {
          const slot = slotFor(targetId, updated.id);
          next = { ...next, x: slot.x, y: slot.y };
        }
      }
    }
    onCardsChange(cards.map((c) => (c.id === next.id ? next : c)));
  }

  function deleteCard(id: string) {
    onCardsChange(cards.filter((c) => c.id !== id));
  }

  /* Cluster CRUD ---------------------------------------------------------- */

  function addCluster() {
    if (readOnly || clusters.length >= MAX_CLUSTERS) return;
    const bottom = atLeast(80, [
      ...clusters.map((c) => clusterBottom(c)),
      ...cards.map((c) => (c.y ?? 0) + CARD_H),
    ]);
    onClustersChange([
      ...clusters,
      { id: crypto.randomUUID(), name: "", cardIds: [], x: 20, y: bottom + 16 },
    ]);
  }

  function updateCluster(id: string, partial: Partial<Cluster>) {
    onClustersChange(
      clusters.map((c) => (c.id === id ? { ...c, ...partial } : c)),
    );
  }

  function deleteCluster(id: string) {
    // Cards of the deleted cluster fall back to free (unassigned); never lost.
    onCardsChange(
      cards.map((c) =>
        c.clusterId === id ? { ...c, clusterId: undefined } : c,
      ),
    );
    onClustersChange(clusters.filter((c) => c.id !== id));
  }

  /** Move a cluster's oval + all its member cards by (dx, dy), clamped to ≥ 0. */
  function moveCluster(id: string, dx: number, dy: number) {
    const cluster = clusterById.get(id);
    if (!cluster) return;
    const nx = Math.max(0, (cluster.x ?? 0) + dx);
    const ny = Math.max(0, (cluster.y ?? 0) + dy);
    const adx = nx - (cluster.x ?? 0);
    const ady = ny - (cluster.y ?? 0);
    onClustersChange(
      clusters.map((c) => (c.id === id ? { ...c, x: nx, y: ny } : c)),
    );
    onCardsChange(
      cards.map((c) =>
        c.clusterId === id
          ? {
              ...c,
              x: Math.max(0, (c.x ?? 0) + adx),
              y: Math.max(0, (c.y ?? 0) + ady),
            }
          : c,
      ),
    );
  }

  function weightLockedBy(clusterId: string, value: number): boolean {
    return clusters.some((c) => c.id !== clusterId && c.weight === value);
  }

  /* Oval drag (pointer) --------------------------------------------------- */

  function onOvalPointerDown(
    id: string,
    event: PointerEvent<HTMLButtonElement>,
  ) {
    if (readOnly) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* synthetic pointer — ignore */
    }
    ovalStart.current = { px: event.clientX, py: event.clientY };
    setOvalDrag({ id, dx: 0, dy: 0 });
  }

  function onOvalPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const start = ovalStart.current;
    if (!start || !ovalDrag) return;
    setOvalDrag({
      id: ovalDrag.id,
      dx: event.clientX - start.px,
      dy: event.clientY - start.py,
    });
  }

  function onOvalPointerUp(event: PointerEvent<HTMLButtonElement>) {
    const start = ovalStart.current;
    if (!start || !ovalDrag) return;
    const dx = event.clientX - start.px;
    const dy = event.clientY - start.py;
    const id = ovalDrag.id;
    ovalStart.current = null;
    setOvalDrag(null);
    if (dx !== 0 || dy !== 0) moveCluster(id, dx, dy);
  }

  function onOvalKeyDown(id: string, event: KeyboardEvent<HTMLButtonElement>) {
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
    moveCluster(id, delta[0], delta[1]);
  }

  /* Rendering ------------------------------------------------------------- */

  /** A keyboard-friendly cluster select, slotted into each card. */
  function cardClusterSelect(card: CardModel) {
    if (clusters.length === 0) return undefined;
    return (
      <select
        aria-label={`Cluster für „${card.text || "ohne Text"}“`}
        value={card.clusterId ?? ""}
        disabled={readOnly}
        onChange={(event) => assignCard(card, event.target.value || undefined)}
        className="w-full rounded border border-black/10 bg-white/70 px-1 py-0.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <option value="">Kein Cluster</option>
        {clusters.map((cluster, index) => (
          <option key={cluster.id} value={cluster.id}>
            {cluster.name.trim() || `Cluster ${index + 1}`}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="space-y-3">
      {!readOnly ? (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={addCluster}
            disabled={clusters.length >= MAX_CLUSTERS}
          >
            <Plus />
            Cluster hinzufügen
          </Button>
          <p className="text-xs text-faint">
            {clusters.length} / {MAX_CLUSTERS} Cluster
            {clusters.length >= MAX_CLUSTERS ? " — Maximum erreicht" : ""}
          </p>
        </div>
      ) : null}

      <div
        ref={boardRef}
        style={{ minHeight: fieldMinHeight }}
        className="relative w-full touch-none overflow-hidden rounded-xl border border-subtle bg-surface-2"
      >
        {/* IST anchor — rosa, never clustered. */}
        {anchorCard ? (
          <div className="absolute left-1/2 top-4 w-48 -translate-x-1/2 rounded-lg border border-ist/40 bg-ist/10 p-2.5 text-center shadow-sm">
            <p className="text-[0.65rem] font-medium uppercase tracking-wide text-ist">
              {anchorCard.label ?? "IST-Zustand"}
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-ist">
              {anchorCard.text || "—"}
            </p>
          </div>
        ) : null}

        {/* Cluster ovals (blue) — draggable label + weight badge. */}
        {clusters.map((cluster, index) => {
          const live = ovalDrag?.id === cluster.id ? ovalDrag : null;
          const left = (cluster.x ?? 0) + (live?.dx ?? 0);
          const top = (cluster.y ?? 0) + (live?.dy ?? 0);
          return (
            <div
              key={cluster.id}
              style={{ left, top, width: OVAL_W }}
              className={cn("absolute", live ? "z-20" : "z-10")}
            >
              <div className="flex items-center gap-1.5">
                <div className="flex min-w-0 flex-1 items-center rounded-full border border-blue-600/40 bg-blue-50 py-1 pl-1 pr-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-600">
                  <button
                    type="button"
                    aria-label={`Cluster „${cluster.name.trim() || index + 1}“ verschieben (Pfeiltasten)`}
                    title="Verschieben"
                    disabled={readOnly}
                    onPointerDown={(event) =>
                      onOvalPointerDown(cluster.id, event)
                    }
                    onPointerMove={onOvalPointerMove}
                    onPointerUp={onOvalPointerUp}
                    onKeyDown={(event) => onOvalKeyDown(cluster.id, event)}
                    className="flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-blue-900/60 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:cursor-grabbing disabled:cursor-default"
                  >
                    <GripVertical className="size-4" />
                  </button>
                  <label
                    className="sr-only"
                    htmlFor={`cluster-name-${cluster.id}`}
                  >
                    Name für Cluster {index + 1}
                  </label>
                  <input
                    id={`cluster-name-${cluster.id}`}
                    type="text"
                    value={cluster.name}
                    readOnly={readOnly}
                    onChange={(event) =>
                      updateCluster(cluster.id, { name: event.target.value })
                    }
                    placeholder={`Cluster ${index + 1}`}
                    className="w-full min-w-0 bg-transparent text-sm font-medium text-blue-900 placeholder:text-blue-900/45 focus-visible:outline-none"
                  />
                </div>

                {/* Prominent unique-weight badge (select; taken values locked). */}
                <label
                  className="sr-only"
                  htmlFor={`cluster-weight-${cluster.id}`}
                >
                  Gewicht für Cluster {cluster.name.trim() || index + 1}
                </label>
                <select
                  id={`cluster-weight-${cluster.id}`}
                  value={cluster.weight ?? ""}
                  disabled={readOnly}
                  onChange={(event) =>
                    updateCluster(cluster.id, {
                      weight: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                  title="Gewicht (10 = drückt am meisten)"
                  className={cn(
                    "h-8 shrink-0 rounded-lg px-1.5 text-center text-sm font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                    cluster.weight != null
                      ? "bg-blue-600 text-white"
                      : "border border-dashed border-blue-600/40 bg-white text-blue-900",
                  )}
                >
                  <option value="">–</option>
                  {WEIGHTS.map((value) => (
                    <option
                      key={value}
                      value={value}
                      disabled={weightLockedBy(cluster.id, value)}
                    >
                      {value}
                      {value === 10 ? " (max)" : ""}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => deleteCluster(cluster.id)}
                  disabled={readOnly}
                  aria-label={`Cluster ${cluster.name.trim() || index + 1} löschen`}
                  title="Cluster löschen"
                  className="flex size-7 shrink-0 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {cluster.isCore && cluster.weight != null ? (
                <span className="ml-1 mt-1 inline-block rounded-full bg-blue-600/10 px-2 py-0.5 text-xs font-medium text-blue-800">
                  Kernproblem
                </span>
              ) : null}
            </div>
          );
        })}

        {/* Colour cards — the unchanged Card component (free xy, stage colours).
            Members of a dragged cluster follow its live offset. */}
        {cards.map((card) => {
          const live =
            card.clusterId && ovalDrag?.id === card.clusterId ? ovalDrag : null;
          const display = live
            ? {
                ...card,
                x: (card.x ?? 0) + live.dx,
                y: (card.y ?? 0) + live.dy,
              }
            : card;
          return (
            <Card
              key={card.id}
              card={display}
              boardRef={boardRef}
              readOnly={readOnly}
              allowVisibilityToggle={allowVisibilityToggle}
              clusterSelect={cardClusterSelect(card)}
              onChange={handleCardChange}
              onDelete={deleteCard}
            />
          );
        })}

        {cards.length === 0 && clusters.length === 0 ? (
          <p className="pointer-events-none absolute inset-x-0 top-1/2 text-center text-sm text-faint">
            Keine Karten.
          </p>
        ) : null}
      </div>

      {!readOnly ? <NoPersonalDataHint example="Arbeitslast" /> : null}
    </div>
  );
}
