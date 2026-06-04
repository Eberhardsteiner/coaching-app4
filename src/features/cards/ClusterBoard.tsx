import { useRef, useState, type PointerEvent } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CARD_COLORS, getCardColor } from "@/features/cards/cardColors";
import {
  MAX_CLUSTERS,
  UNASSIGNED,
  pickNextClusterColor,
} from "@/features/cards/clusters";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import type { Card as CardModel, Cluster } from "@/features/session/types";
import { cn } from "@/lib/utils";

type ClusterBoardProps = {
  cards: CardModel[];
  onCardsChange: (next: CardModel[]) => void;
  clusters: Cluster[];
  onClustersChange: (next: Cluster[]) => void;
  /** Optional fixed IST anchor card (pink, never clustered). */
  anchorCard?: { text: string };
  readOnly?: boolean;
};

/**
 * Cluster mode of the moderation board. Cards are assigned to at most five
 * colour-coded zones (plus a "not assigned" area) two ways: by dragging a card
 * onto a zone (committed on pointerup) or via a keyboard cluster select per
 * card. `card.clusterId` is the single source of truth; an assigned card takes
 * its cluster's colour. The IST anchor stays visible and is never clustered.
 * No connection lines.
 */
export function ClusterBoard({
  cards,
  onCardsChange,
  clusters,
  onClustersChange,
  anchorCard,
  readOnly,
}: ClusterBoardProps) {
  const zoneRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [dragCardId, setDragCardId] = useState<string | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const [hoverZone, setHoverZone] = useState<string | null>(null);

  const clusterById = new Map(clusters.map((cluster) => [cluster.id, cluster]));

  /** The zone a card belongs to: its cluster's id, or UNASSIGNED. */
  function zoneOf(card: CardModel): string {
    return card.clusterId && clusterById.has(card.clusterId)
      ? card.clusterId
      : UNASSIGNED;
  }

  /** Which registered zone (by rect) sits under a screen point. */
  function zoneAt(x: number, y: number): string | null {
    for (const [id, el] of zoneRefs.current) {
      const rect = el.getBoundingClientRect();
      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      )
        return id;
    }
    return null;
  }

  function assignCard(cardId: string, zoneId: string) {
    const clusterId = zoneId === UNASSIGNED ? undefined : zoneId;
    onCardsChange(
      cards.map((card) => (card.id === cardId ? { ...card, clusterId } : card)),
    );
  }

  /* Drag-to-zone (pointer) — commits only on pointerup. ------------------- */

  function onChipPointerDown(
    cardId: string,
    event: PointerEvent<HTMLButtonElement>,
  ) {
    if (readOnly) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* synthetic pointer — ignore */
    }
    setDragCardId(cardId);
    setGhost({ x: event.clientX, y: event.clientY });
    setHoverZone(zoneAt(event.clientX, event.clientY));
  }

  function onChipPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (dragCardId === null) return;
    setGhost({ x: event.clientX, y: event.clientY });
    setHoverZone(zoneAt(event.clientX, event.clientY));
  }

  function onChipPointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (dragCardId === null) return;
    const target = zoneAt(event.clientX, event.clientY);
    if (target && target !== zoneOf(getCard(dragCardId))) {
      assignCard(dragCardId, target);
    }
    setDragCardId(null);
    setGhost(null);
    setHoverZone(null);
  }

  function getCard(id: string): CardModel {
    return (
      cards.find((card) => card.id === id) ?? {
        id,
        text: "",
        visibility: "shared",
      }
    );
  }

  /* Cluster CRUD ---------------------------------------------------------- */

  function addCluster() {
    if (readOnly || clusters.length >= MAX_CLUSTERS) return;
    onClustersChange([
      ...clusters,
      {
        id: crypto.randomUUID(),
        name: "",
        weight: 5,
        color: pickNextClusterColor(clusters),
        cardIds: [],
      },
    ]);
  }

  function updateCluster(id: string, partial: Partial<Cluster>) {
    onClustersChange(
      clusters.map((cluster) =>
        cluster.id === id ? { ...cluster, ...partial } : cluster,
      ),
    );
  }

  function cycleClusterColor(id: string) {
    const cluster = clusterById.get(id);
    if (!cluster) return;
    const index = CARD_COLORS.findIndex(
      (c) => c.id === (cluster.color ?? "neutral"),
    );
    updateCluster(id, {
      color: CARD_COLORS[(index + 1) % CARD_COLORS.length].id,
    });
  }

  function deleteCluster(id: string) {
    // Cards in the deleted cluster fall back to "not assigned".
    onCardsChange(
      cards.map((card) =>
        card.clusterId === id ? { ...card, clusterId: undefined } : card,
      ),
    );
    onClustersChange(clusters.filter((cluster) => cluster.id !== id));
  }

  /* Rendering ------------------------------------------------------------- */

  const ghostCard = dragCardId ? getCard(dragCardId) : null;
  const ghostColor = ghostCard
    ? getCardColor(
        ghostCard.clusterId
          ? clusterById.get(ghostCard.clusterId)?.color
          : undefined,
      )
    : null;

  function renderChip(card: CardModel) {
    const cluster = card.clusterId
      ? clusterById.get(card.clusterId)
      : undefined;
    const color = getCardColor(cluster?.color);
    const dragging = card.id === dragCardId;
    return (
      <div
        key={card.id}
        className={cn(
          "flex items-center gap-1.5 rounded-md border border-black/10 py-1 pl-1 pr-1.5 shadow-sm transition-colors",
          color.surface,
          dragging && "opacity-40",
        )}
      >
        <button
          type="button"
          aria-label={`Karte „${card.text || "ohne Text"}“ in ein Cluster ziehen`}
          title="Auf ein Cluster ziehen"
          disabled={readOnly}
          onPointerDown={(event) => onChipPointerDown(card.id, event)}
          onPointerMove={onChipPointerMove}
          onPointerUp={onChipPointerUp}
          className="flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-current/60 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing disabled:cursor-default"
        >
          <GripVertical className="size-4" />
        </button>
        <span className="max-w-[10rem] truncate text-sm">
          {card.text || "—"}
        </span>
        <label className="sr-only" htmlFor={`assign-${card.id}`}>
          Cluster für „{card.text || "ohne Text"}“
        </label>
        <select
          id={`assign-${card.id}`}
          value={zoneOf(card)}
          disabled={readOnly || clusters.length === 0}
          onChange={(event) => assignCard(card.id, event.target.value)}
          className="max-w-[7rem] rounded border border-black/10 bg-white/70 px-1 py-0.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
        >
          <option value={UNASSIGNED}>nicht zugeordnet</option>
          {clusters.map((cluster, index) => (
            <option key={cluster.id} value={cluster.id}>
              {cluster.name.trim() || `Cluster ${index + 1}`}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const unassignedCards = cards.filter((card) => zoneOf(card) === UNASSIGNED);

  return (
    <div className="space-y-3">
      {anchorCard ? (
        <div className="flex items-center gap-3 rounded-lg border border-ist/40 bg-pink-50 px-4 py-2.5">
          <span className="text-[0.65rem] font-medium uppercase tracking-wide text-ist">
            IST-Zustand
          </span>
          <span className="truncate text-sm font-semibold text-pink-900">
            {anchorCard.text || "—"}
          </span>
        </div>
      ) : null}

      {!readOnly ? (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={addCluster}
            disabled={clusters.length >= MAX_CLUSTERS}
          >
            <Plus />
            Cluster
          </Button>
          <p className="text-xs text-faint">
            {clusters.length} / {MAX_CLUSTERS} Cluster
          </p>
        </div>
      ) : null}

      {/* Cluster zones */}
      <div className="space-y-3">
        {clusters.map((cluster, index) => {
          const color = getCardColor(cluster.color);
          const assigned = cards.filter(
            (card) => card.clusterId === cluster.id,
          );
          return (
            <div
              key={cluster.id}
              data-zone-id={cluster.id}
              ref={(el) => {
                if (el) zoneRefs.current.set(cluster.id, el);
                else zoneRefs.current.delete(cluster.id);
              }}
              className={cn(
                "rounded-xl border bg-surface p-3 transition-colors",
                hoverZone === cluster.id
                  ? "border-accent ring-2 ring-accent"
                  : "border-subtle",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => cycleClusterColor(cluster.id)}
                  disabled={readOnly}
                  aria-label={`Farbe wechseln (aktuell: ${color.label})`}
                  title={`Farbe: ${color.label}`}
                  className="flex size-6 shrink-0 items-center justify-center rounded hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span
                    className={cn(
                      "size-3.5 rounded-full border border-black/10",
                      color.swatch,
                    )}
                  />
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
                  className="min-w-0 flex-1 rounded border border-subtle bg-surface px-2 py-1 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
                {cluster.isCore ? (
                  <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">
                    Kernthema
                  </span>
                ) : null}
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

              <div className="mt-2 flex items-center gap-3">
                <label
                  htmlFor={`cluster-weight-${cluster.id}`}
                  className="text-xs text-muted"
                >
                  Gewicht
                </label>
                <input
                  id={`cluster-weight-${cluster.id}`}
                  type="range"
                  min={1}
                  max={10}
                  value={cluster.weight}
                  disabled={readOnly}
                  onChange={(event) =>
                    updateCluster(cluster.id, {
                      weight: Number(event.target.value),
                    })
                  }
                  className="h-1.5 flex-1 cursor-pointer accent-accent"
                />
                <span className="w-6 text-right text-sm font-medium text-foreground tabular-nums">
                  {cluster.weight}
                </span>
              </div>

              <div className="mt-3 flex min-h-[40px] flex-wrap gap-2">
                {assigned.length > 0 ? (
                  assigned.map(renderChip)
                ) : (
                  <p className="self-center text-xs text-faint">
                    Karten hierher ziehen oder über das Auswahlfeld zuordnen.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unassigned area */}
      <div
        data-zone-id={UNASSIGNED}
        ref={(el) => {
          if (el) zoneRefs.current.set(UNASSIGNED, el);
          else zoneRefs.current.delete(UNASSIGNED);
        }}
        className={cn(
          "rounded-xl border border-dashed p-3 transition-colors",
          hoverZone === UNASSIGNED
            ? "border-accent bg-surface ring-2 ring-accent"
            : "border-subtle bg-surface-2",
        )}
      >
        <p className="mb-2 text-xs font-medium text-muted">
          noch nicht zugeordnet
        </p>
        <div className="flex min-h-[40px] flex-wrap gap-2">
          {unassignedCards.length > 0 ? (
            unassignedCards.map(renderChip)
          ) : (
            <p className="self-center text-xs text-faint">
              Alle Karten sind einem Cluster zugeordnet.
            </p>
          )}
        </div>
      </div>

      {/* Drag ghost — follows the pointer, ignores pointer events. */}
      {ghost && ghostCard && ghostColor ? (
        <div
          aria-hidden
          style={{ left: ghost.x + 12, top: ghost.y + 12 }}
          className={cn(
            "pointer-events-none fixed z-50 max-w-[12rem] truncate rounded-md border border-black/10 px-2 py-1 text-sm shadow-md",
            ghostColor.surface,
          )}
        >
          {ghostCard.text || "—"}
        </div>
      ) : null}

      {!readOnly ? <NoPersonalDataHint example="Arbeitslast" /> : null}
    </div>
  );
}
