/** Waymarks along the path (small cairns/posts marking the route ahead). */
const WAYMARKS: { cx: number; cy: number; r: number; strong?: boolean }[] = [
  { cx: 56, cy: 224, r: 7, strong: true },
  { cx: 128, cy: 196, r: 6 },
  { cx: 196, cy: 156, r: 6 },
  { cx: 258, cy: 112, r: 6 },
];

/**
 * Phase 5 motif — a path with waymarks towards a flag: staying on track. The
 * route from here to the goal is marked; the traveller's current waymark
 * breathes via the shared, reduced-motion-safe `animate-pulse-calm`. Purely
 * decorative (aria-hidden) — the PhaseStart screen is fully understandable
 * from its heading and text. Colours come only from tokens: accent (Phase 5
 * is a non-IST phase) plus subtle/faint neutrals.
 */
export function Phase5Motif() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <svg
        viewBox="0 0 360 280"
        className="h-auto w-full"
        aria-hidden="true"
        focusable="false"
      >
        {/* the winding path */}
        <path
          d="M32 244 C 96 232, 120 212, 152 184 S 224 122, 262 96"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="1 10"
          className="fill-none stroke-faint/60"
        />

        {/* breathing halo around the current waymark */}
        <circle
          cx={56}
          cy={224}
          r={20}
          className="animate-pulse-calm fill-accent/10 [transform-box:fill-box]"
        />

        {/* waymarks */}
        {WAYMARKS.map((mark, index) => (
          <g key={index}>
            <circle
              cx={mark.cx}
              cy={mark.cy}
              r={mark.r}
              className={mark.strong ? "fill-accent/85" : "fill-accent/35"}
            />
          </g>
        ))}

        {/* the goal flag at the end of the path */}
        <g>
          <line
            x1={286}
            y1={92}
            x2={286}
            y2={48}
            strokeWidth={2.5}
            strokeLinecap="round"
            className="stroke-accent/70"
          />
          <path d="M286 48 L 318 57 L 286 66 Z" className="fill-accent" />
          <circle
            cx={286}
            cy={92}
            r={10}
            strokeWidth={1.5}
            className="fill-none stroke-accent/30"
          />
        </g>

        {/* gentle horizon for depth */}
        <line
          x1={20}
          y1={252}
          x2={340}
          y2={252}
          strokeWidth={1.25}
          strokeLinecap="round"
          className="stroke-subtle"
        />
      </svg>
    </div>
  );
}
