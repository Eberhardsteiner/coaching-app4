import { useRef, useState, type PointerEvent } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCardColor } from "@/features/cards/cardColors";
import { MAX_CLUSTERS, UNASSIGNED } from "@/features/cards/clusters";
import {
  effectiveVisibility,
  toggleVisibility,
} from "@/features/cards/visibility";
import { VisibilityToggle } from "@/features/cards/VisibilityToggle";
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
  /** Show the per-card visibility toggle on chips (coached branch only). */
  allowVisibilityToggle?: boolean;
};

/** The unique 1..10 weight scale (10 = "drückt am meisten"). */
const WEIGHTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Cluster mode of the moderation board. Cards (which keep their IST stage colours)
 * are grouped into at most five clusters labelled by a **blue oval**; assignment
 * is by dragging a card chip onto a cluster (committed on pointerup) or via a
 * keyboard cluster-select per card. `card.clusterId` is the single source of
 * truth. Each cluster gets a **unique** weight 1–10 (10 = drückt am meisten):
 * values already taken by another cluster are locked in the selector. The IST
 * anchor stays visible and is never clustered. No connection lines.
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

  function toggleCardVisibility(cardId: string) {
    onCardsChange(
      cards.map((card) =>
        card.id === cardId
          ? {
              ...card,
              visibility: toggleVisibility(effectiveVisibility(card)),
            }
          : card,
      ),
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
      { id: crypto.randomUUID(), name: "", cardIds: [] },
    ]);
  }

  function updateCluster(id: string, partial: Partial<Cluster>) {
    onClustersChange(
      clusters.map((cluster) =>
        cluster.id === id ? { ...cluster, ...partial } : cluster,
      ),
    );
  }

  function deleteCluster(id: string) {
    // Cards in the deleted cluster fall back to "not assigned" (never lost).
    onCardsChange(
      cards.map((card) =>
        card.clusterId === id ? { ...card, clusterId: undefined } : card,
      ),
    );
    onClustersChange(clusters.filter((cluster) => cluster.id !== id));
  }

  /** Is weight `value` already taken by a *different* cluster? */
  function weightLockedBy(clusterId: string, value: number): boolean {
    return clusters.some((c) => c.id !== clusterId && c.weight === value);
  }

  /* Rendering ------------------------------------------------------------- */

  const ghostCard = dragCardId ? getCard(dragCardId) : null;
  const ghostColor = ghostCard ? getCardColor(ghostCard.color) : null;

  /** A card chip — keeps the card's own IST stage colour (orthogonal to clusters). */
  function renderChip(card: CardModel) {
    const color = getCardColor(card.color);
    const dragging = card.id === dragCardId;
    const coachOnly =
      Boolean(allowVisibilityToggle) &&
      effectiveVisibility(card) === "coach_only";
    return (
      <div
        key={card.id}
        className={cn(
          "flex items-center gap-1.5 rounded-md border py-1 pl-1 pr-1.5 shadow-sm transition-colors",
          coachOnly ? "border-dashed border-muted/70" : "border-black/10",
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
        {allowVisibilityToggle ? (
          <VisibilityToggle
            visibility={effectiveVisibility(card)}
            disabled={readOnly}
            onToggle={() => toggleCardVisibility(card.id)}
          />
        ) : null}
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
        <div className="flex items-center gap-3 rounded-lg border border-ist/40 bg-ist/10 px-4 py-2.5">
          <span className="text-[0.65rem] font-medium uppercase tracking-wide text-ist">
            {anchorCard.label ?? "IST-Zustand"}
          </span>
          <span className="truncate text-sm font-semibold text-ist">
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
            {clusters.length >= MAX_CLUSTERS ? " — Maximum erreicht" : ""}
          </p>
        </div>
      ) : null}

      {/* Cluster zones */}
      <div className="space-y-3">
        {clusters.map((cluster, index) => {
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
                {/* Cluster label — the blue oval (new card form). */}
                <div className="flex min-w-0 flex-1 items-center rounded-full border border-blue-600/30 bg-blue-50 px-3.5 py-1.5 focus-within:ring-2 focus-within:ring-blue-600">
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

                {/* Prominent weight badge. */}
                <span
                  aria-hidden
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full text-base font-semibold tabular-nums",
                    cluster.weight != null
                      ? "bg-blue-600 text-white"
                      : "border border-dashed border-subtle text-faint",
                  )}
                >
                  {cluster.weight ?? "–"}
                </span>

                {cluster.isCore && cluster.weight != null ? (
                  <span className="shrink-0 rounded-full bg-blue-600/10 px-2 py-0.5 text-xs font-medium text-blue-800">
                    Kernproblem
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

              {/* Unique weight selector — taken values are locked. */}
              {!readOnly ? (
                <div className="mt-2.5">
                  <p className="text-xs text-muted">
                    Gewicht — 10 drückt am meisten, jeder Wert nur einmal
                  </p>
                  <div
                    role="group"
                    aria-label={`Gewicht für Cluster ${cluster.name.trim() || index + 1}`}
                    className="mt-1 flex flex-wrap gap-1"
                  >
                    {WEIGHTS.map((value) => {
                      const isSelf = cluster.weight === value;
                      const locked =
                        !isSelf && weightLockedBy(cluster.id, value);
                      return (
                        <button
                          key={value}
                          type="button"
                          disabled={locked}
                          aria-disabled={locked}
                          aria-pressed={isSelf}
                          aria-label={`Gewicht ${value}${value === 10 ? " — drückt am meisten" : ""}${locked ? " — bereits vergeben" : ""}`}
                          onClick={() =>
                            updateCluster(cluster.id, { weight: value })
                          }
                          className={cn(
                            "size-7 rounded-md text-sm tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                            isSelf
                              ? "bg-blue-600 font-medium text-white"
                              : locked
                                ? "cursor-not-allowed bg-surface-2 text-faint opacity-40"
                                : "bg-surface-2 text-muted hover:text-foreground",
                          )}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

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
