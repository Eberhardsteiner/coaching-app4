import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { GripVertical, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/features/cards/Card";
import { MAX_CLUSTERS } from "@/features/cards/clusters";
import { useFullWidthBoard } from "@/features/cards/useFullWidthBoard";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import type { Card as CardModel, Cluster } from "@/features/session/types";
import { cn } from "@/lib/utils";

type ClusterBoardProps = {
  cards: CardModel[];
  onCardsChange: (next: CardModel[]) => void;
  clusters: Cluster[];
  onClustersChange: (next: Cluster[]) => void;
  /** Optional fixed IST anchor card (rosa, never clustered). */
  anchorCard?: {
    text: string;
    label?: string;
    hint?: string;
    onTextChange?: (text: string) => void;
  };
  readOnly?: boolean;
  /** Show the per-card visibility toggle (coached branch only). */
  allowVisibilityToggle?: boolean;
};

/* Layout constants (card height mirrors Card.tsx). */
const CARD_H = 88;
const OVAL_W = 230;
const OVAL_H = 44;
const KEY_STEP = 16;

/* The field fills the full content width (see useFullWidthBoard) and only grows
   vertically when cards/ovals are placed lower — no needless horizontal scroll. */
const CANVAS_MARGIN = 320;

/** The unique 1..10 weight scale (10 = "drückt am meisten"). */
const WEIGHTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const atLeast = (min: number, values: number[]) =>
  values.length ? Math.max(min, ...values) : min;

/**
 * Cluster mode of the moderation board — the **same free field** as Schritt 3.
 * Every colour card (unchanged `Card` component, free xy, stage colours) and
 * every **blue oval** cluster label is an **independent** draggable object: moving
 * one never moves another (no group/overlap coupling). Cluster membership is set
 * purely via the per-card cluster select (`card.clusterId`) and is logical — it
 * does not reposition the card. Each cluster gets a **unique** weight 1–10
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
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const fullWidthStyle = useFullWidthBoard(wrapRef);
  const clusterById = new Map(clusters.map((c) => [c.id, c]));

  // Live offset while a cluster's oval is being dragged (oval only — cards never follow).
  const [ovalDrag, setOvalDrag] = useState<{
    id: string;
    dx: number;
    dy: number;
  } | null>(null);
  const ovalStart = useRef<{ px: number; py: number } | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  /** Bottom edge of a cluster's oval (incl. the Kernproblem line) — for sizing. */
  function clusterBottom(cluster: Cluster): number {
    return (cluster.y ?? 0) + OVAL_H + 28;
  }

  // The canvas fills the full width (w-full) and grows vertically to fit the
  // lowest card/oval, so there is room to place items below the fold.
  const canvasH =
    atLeast(0, [
      ...cards.map((c) => (c.y ?? 0) + CARD_H),
      ...clusters.map((c) => clusterBottom(c)),
    ]) + CANVAS_MARGIN;

  /** At least one card is assigned to a cluster — gates the reset affordance. */
  const hasAssignments = cards.some((c) => c.clusterId != null);

  /** Set a card's cluster (via the dropdown). Logical only — never moves the card. */
  function assignCard(card: CardModel, clusterId: string | undefined) {
    onCardsChange(
      cards.map((c) => (c.id === card.id ? { ...c, clusterId } : c)),
    );
  }

  /**
   * Clear EVERY card's cluster assignment — a deliberate bulk reset (not
   * id-scoped: "all" is the point). Cards (text/colour/position/visibility),
   * clusters (name/weight/position) and everything else stay untouched; the
   * parent's onCardsChange re-runs normalizeClusters, so all cardIds become
   * empty while isCore stays driven by the weights.
   */
  function resetAssignments() {
    onCardsChange(
      cards.map((c) =>
        c.clusterId != null ? { ...c, clusterId: undefined } : c,
      ),
    );
    setResetOpen(false);
  }

  /** Persist a card change (move/edit). Moving a card never touches a cluster. */
  function handleCardChange(updated: CardModel) {
    onCardsChange(cards.map((c) => (c.id === updated.id ? updated : c)));
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

  /** Move ONLY the cluster's oval by (dx, dy). Cards are never dragged along. */
  function moveOval(id: string, dx: number, dy: number) {
    const cluster = clusterById.get(id);
    if (!cluster) return;
    // Clamp to the board so the oval stays within the full-width field (drag
    // bounds = the whole canvas, mirroring the cards). Only the oval moves.
    const rect = boardRef.current?.getBoundingClientRect();
    const maxX = rect ? Math.max(0, rect.width - OVAL_W) : Infinity;
    const maxY = rect ? Math.max(0, rect.height - OVAL_H) : Infinity;
    const nx = Math.min(Math.max(0, (cluster.x ?? 0) + dx), maxX);
    const ny = Math.min(Math.max(0, (cluster.y ?? 0) + dy), maxY);
    onClustersChange(
      clusters.map((c) => (c.id === id ? { ...c, x: nx, y: ny } : c)),
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
    if (dx !== 0 || dy !== 0) moveOval(id, dx, dy);
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
    moveOval(id, delta[0], delta[1]);
  }

  /* Rendering ------------------------------------------------------------- */

  /** A keyboard-friendly cluster select, slotted into each card. */
  function cardClusterSelect(card: CardModel) {
    if (clusters.length === 0) return undefined;
    // Null-safe: an orphaned clusterId (cluster deleted or never existed)
    // resolves to "Kein Cluster" instead of selecting a phantom/blank option.
    const selected =
      card.clusterId && clusters.some((c) => c.id === card.clusterId)
        ? card.clusterId
        : "";
    return (
      <select
        aria-label={`Cluster für „${card.text || "ohne Text"}“`}
        value={selected}
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={addCluster}
              disabled={clusters.length >= MAX_CLUSTERS}
            >
              <Plus />
              Cluster hinzufügen
            </Button>
            {hasAssignments ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResetOpen(true)}
              >
                <RotateCcw />
                Zuordnungen zurücksetzen
              </Button>
            ) : null}
          </div>
          <p className="text-xs text-faint">
            {clusters.length} / {MAX_CLUSTERS} Cluster
            {clusters.length >= MAX_CLUSTERS ? " — Maximum erreicht" : ""}
          </p>
        </div>
      ) : null}

      <div
        ref={wrapRef}
        style={fullWidthStyle ?? undefined}
        tabIndex={0}
        aria-label="Arbeitsfläche in voller Breite — Karten und Cluster frei platzieren"
        className={cn(
          "h-[78vh] overflow-auto rounded-xl border border-subtle bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
          fullWidthStyle ? null : "w-full",
        )}
      >
        <div
          ref={boardRef}
          className="relative min-h-full w-full"
          style={{ height: canvasH }}
        >
          {/* IST anchor — rosa, never clustered. */}
          {anchorCard ? (
            <div className="absolute left-1/2 top-1/2 w-48 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-ist/40 bg-ist/10 p-2.5 text-center shadow-sm">
              <p className="text-[0.65rem] font-medium uppercase tracking-wide text-ist">
                {anchorCard.label ?? "IST-Zustand"}
              </p>
              {anchorCard.onTextChange && !readOnly ? (
                <input
                  type="text"
                  value={anchorCard.text}
                  onChange={(event) =>
                    anchorCard.onTextChange?.(event.target.value)
                  }
                  aria-label="Ausgangsgefühl bearbeiten"
                  placeholder="—"
                  className="mt-0.5 w-full rounded bg-transparent text-center text-sm font-semibold text-ist placeholder:text-ist/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ist"
                />
              ) : (
                <p className="mt-0.5 truncate text-sm font-semibold text-ist">
                  {anchorCard.text || "—"}
                </p>
              )}
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
            Each card is an independent object; it never follows an oval. */}
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              boardRef={boardRef}
              readOnly={readOnly}
              allowVisibilityToggle={allowVisibilityToggle}
              clusterSelect={cardClusterSelect(card)}
              onChange={handleCardChange}
              onDelete={deleteCard}
            />
          ))}

          {cards.length === 0 && clusters.length === 0 ? (
            <p className="pointer-events-none absolute inset-x-0 top-24 text-center text-sm text-faint">
              Keine Karten.
            </p>
          ) : null}
        </div>
      </div>

      {!readOnly ? <NoPersonalDataHint example="Arbeitslast" /> : null}

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Cluster-Zuordnungen zurücksetzen?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Alle Karten-Zuordnungen zu Clustern werden entfernt. Deine Karten
              und Cluster bleiben erhalten — du ordnest danach neu zu.
              Fortfahren?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Abbrechen</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={resetAssignments}>
                Zuordnungen zurücksetzen
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
