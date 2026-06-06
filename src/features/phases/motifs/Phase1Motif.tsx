import { cn } from "@/lib/utils";

/** A node in the systemic web. "ist" nodes carry the rosa IST accent. */
type Node = {
  id: string;
  cx: number;
  cy: number;
  r: number;
  tone: "ist" | "neutral";
};

/** The Kernthema (core) node — larger, rosa, slightly above the centre. */
const CORE = { cx: 188, cy: 138, r: 22 } as const;

/** Satellite nodes (aspects, people, interactions of the systemic context). */
const NODES: Node[] = [
  { id: "G", cx: 176, cy: 44, r: 9, tone: "neutral" },
  { id: "A", cx: 300, cy: 64, r: 11, tone: "ist" },
  { id: "B", cx: 78, cy: 72, r: 8, tone: "neutral" },
  { id: "H", cx: 96, cy: 150, r: 6, tone: "neutral" },
  { id: "C", cx: 42, cy: 170, r: 7, tone: "neutral" },
  { id: "F", cx: 322, cy: 176, r: 7, tone: "neutral" },
  { id: "D", cx: 120, cy: 232, r: 9, tone: "ist" },
  { id: "E", cx: 250, cy: 230, r: 8, tone: "neutral" },
];

/** Edges — "core" lines (from the Kernthema) carry the rosa accent. */
type Edge = { x1: number; y1: number; x2: number; y2: number; core?: boolean };
const EDGES: Edge[] = [
  // Kernthema → satellites
  { x1: CORE.cx, y1: CORE.cy, x2: 176, y2: 44, core: true },
  { x1: CORE.cx, y1: CORE.cy, x2: 300, y2: 64, core: true },
  { x1: CORE.cx, y1: CORE.cy, x2: 322, y2: 176, core: true },
  { x1: CORE.cx, y1: CORE.cy, x2: 250, y2: 230, core: true },
  { x1: CORE.cx, y1: CORE.cy, x2: 120, y2: 232, core: true },
  { x1: CORE.cx, y1: CORE.cy, x2: 96, y2: 150, core: true },
  // peripheral interactions
  { x1: 78, y1: 72, x2: 96, y2: 150 },
  { x1: 96, y1: 150, x2: 42, y2: 170 },
  { x1: 42, y1: 170, x2: 120, y2: 232 },
  { x1: 120, y1: 232, x2: 250, y2: 230 },
  { x1: 176, y1: 44, x2: 78, y2: 72 },
  { x1: 300, y1: 64, x2: 322, y2: 176 },
];

/**
 * Phase 1 motif — an abstract systemic web: connected nodes standing for the
 * aspects, people and interactions of one's context, with a larger Kernthema
 * node in the rosa IST accent (a few satellites rosa, the rest neutral) and
 * fine, restrained connecting lines. Purely decorative (aria-hidden) — the
 * PhaseStart screen is fully understandable from its heading and text. Colours
 * come only from tokens (rosa via the IST token). The core's halo breathes via
 * the shared, reduced-motion-safe `animate-pulse-calm`.
 */
export function Phase1Motif() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <svg
        viewBox="0 0 360 280"
        className="h-auto w-full"
        aria-hidden="true"
        focusable="false"
      >
        {/* edges (behind the nodes) */}
        <g fill="none" strokeLinecap="round">
          {EDGES.map((edge, index) => (
            <line
              key={index}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              strokeWidth={edge.core ? 1.25 : 1}
              className={edge.core ? "stroke-ist/25" : "stroke-subtle"}
            />
          ))}
        </g>

        {/* satellite nodes */}
        <g>
          {NODES.map((node) => (
            <circle
              key={node.id}
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              className={cn(
                node.tone === "ist" ? "fill-ist/85" : "fill-faint/35",
              )}
            />
          ))}
        </g>

        {/* Kernthema — breathing halo + ring + filled core */}
        <circle
          cx={CORE.cx}
          cy={CORE.cy}
          r={CORE.r + 14}
          className="animate-pulse-calm fill-ist/10 [transform-box:fill-box]"
        />
        <circle
          cx={CORE.cx}
          cy={CORE.cy}
          r={CORE.r + 4}
          strokeWidth={1.5}
          className="fill-none stroke-ist/30"
        />
        <circle cx={CORE.cx} cy={CORE.cy} r={CORE.r} className="fill-ist" />
      </svg>
    </div>
  );
}
