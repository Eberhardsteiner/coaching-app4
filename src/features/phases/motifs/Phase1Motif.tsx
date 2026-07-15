/** Raindrops falling from the cloud (short slanted strokes, two layers). */
const RAIN: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  soft?: boolean;
}[] = [
  { x1: 128, y1: 168, x2: 122, y2: 186 },
  { x1: 158, y1: 176, x2: 152, y2: 194, soft: true },
  { x1: 188, y1: 170, x2: 182, y2: 188 },
  { x1: 218, y1: 178, x2: 212, y2: 196, soft: true },
  { x1: 244, y1: 168, x2: 238, y2: 186 },
];

/**
 * Phase 1 motif — the storm cloud of the IST situation (MP1-REV: the shared
 * Rubikon symbol language — Phase 1 is the Gewitterwolke, "Weg von …"): a
 * calm, layered rain cloud in the rosa IST accent with rain strokes and one
 * restrained lightning bolt over a soft landscape line. The cloud's halo
 * breathes via the shared, reduced-motion-safe `animate-pulse-calm`. Purely
 * decorative (aria-hidden) — the PhaseStart screen is fully understandable
 * from its heading and text. Colours come only from tokens (rosa via the IST
 * token; neutrals subtle/faint).
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
        {/* breathing halo behind the cloud */}
        <ellipse
          cx={185}
          cy={116}
          rx={92}
          ry={58}
          className="animate-pulse-calm fill-ist/10 [transform-box:fill-box]"
        />

        {/* back cloud layer (soft) */}
        <path
          d="M112 142 a20 20 0 0 1 4-39.4 A27 27 0 0 1 168 90 a19 19 0 0 1 27 17.2 L195 142 Z"
          className="fill-ist/25"
        />

        {/* main storm cloud */}
        <path
          d="M138 152 a24 24 0 0 1 4.6-47.2 A33 33 0 0 1 207 96 a23.5 23.5 0 0 1 11 44.6 L218 152 Z"
          className="fill-ist/85"
        />

        {/* rain */}
        <g strokeWidth={2.5} strokeLinecap="round">
          {RAIN.map((drop, index) => (
            <line
              key={index}
              x1={drop.x1}
              y1={drop.y1}
              x2={drop.x2}
              y2={drop.y2}
              className={drop.soft ? "stroke-ist/35" : "stroke-ist/60"}
            />
          ))}
        </g>

        {/* one restrained lightning bolt */}
        <path
          d="M186 156 L172 182 L184 182 L176 206 L200 176 L188 176 Z"
          className="fill-ist"
        />

        {/* soft landscape line for depth */}
        <path
          d="M0 236 Q 90 222 180 232 T 360 228 L 360 280 L 0 280 Z"
          className="fill-faint/15"
        />
        <line
          x1={16}
          y1={252}
          x2={344}
          y2={252}
          strokeWidth={1.25}
          strokeLinecap="round"
          className="stroke-subtle"
        />
      </svg>
    </div>
  );
}
