/** One building block of the bridge (measures built from resources). */
type Block = {
  x: number;
  y: number;
  w: number;
  h: number;
  tone: "strong" | "soft" | "faint";
};

/** Two piers and a stepped arch of blocks bridging the gap between them. */
const BLOCKS: Block[] = [
  // left pier (the IST side — built from resource blocks)
  { x: 30, y: 196, w: 46, h: 22, tone: "soft" },
  { x: 34, y: 170, w: 38, h: 22, tone: "soft" },
  { x: 38, y: 144, w: 30, h: 22, tone: "strong" },
  // right pier (the goal side)
  { x: 284, y: 196, w: 46, h: 22, tone: "soft" },
  { x: 288, y: 170, w: 38, h: 22, tone: "soft" },
  { x: 292, y: 144, w: 30, h: 22, tone: "strong" },
  // arch — the measures spanning the gap, block by block
  { x: 78, y: 132, w: 40, h: 18, tone: "strong" },
  { x: 124, y: 122, w: 40, h: 18, tone: "strong" },
  { x: 170, y: 118, w: 40, h: 18, tone: "strong" },
  { x: 216, y: 122, w: 40, h: 18, tone: "strong" },
  { x: 262, y: 132, w: 24, h: 18, tone: "strong" },
];

/**
 * Phase 4 motif — a bridge built from blocks: the measures (blocks) are made
 * of one's resources and span the gap between IST and goal. One block still
 * "floats in" with the shared, reduced-motion-safe `animate-pulse-calm` halo.
 * Purely decorative (aria-hidden) — the PhaseStart screen is fully
 * understandable from its heading and text. Colours come only from tokens:
 * accent (Phase 4 is a non-IST phase) plus subtle/faint neutrals.
 */
export function Phase4Motif() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <svg
        viewBox="0 0 360 280"
        className="h-auto w-full"
        aria-hidden="true"
        focusable="false"
      >
        {/* ground line */}
        <line
          x1={16}
          y1={218}
          x2={344}
          y2={218}
          strokeWidth={1.25}
          strokeLinecap="round"
          className="stroke-subtle"
        />

        {/* the gap beneath the bridge */}
        <path
          d="M92 218 Q 180 252 268 218"
          strokeWidth={1.25}
          strokeDasharray="4 4"
          className="fill-none stroke-faint/40"
        />

        {/* breathing halo behind the keystone block being placed */}
        <rect
          x={162}
          y={110}
          width={56}
          height={34}
          rx={8}
          className="animate-pulse-calm fill-accent/10 [transform-box:fill-box]"
        />

        {BLOCKS.map((block, index) => (
          <rect
            key={index}
            x={block.x}
            y={block.y}
            width={block.w}
            height={block.h}
            rx={5}
            strokeWidth={1.25}
            className={
              block.tone === "strong"
                ? "fill-accent/15 stroke-accent/50"
                : block.tone === "soft"
                  ? "fill-faint/15 stroke-subtle"
                  : "fill-none stroke-subtle"
            }
          />
        ))}

        {/* small figure of direction: dot travelling the bridge */}
        <circle cx={98} cy={124} r={5} className="fill-accent/85" />
      </svg>
    </div>
  );
}
