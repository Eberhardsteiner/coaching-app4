/** Sun rays — short, calm strokes fanning over the rising sun. */
const RAYS: { x1: number; y1: number; x2: number; y2: number }[] = [
  { x1: 180, y1: 118, x2: 180, y2: 100 },
  { x1: 142, y1: 130, x2: 130, y2: 116 },
  { x1: 218, y1: 130, x2: 230, y2: 116 },
  { x1: 118, y1: 158, x2: 102, y2: 150 },
  { x1: 242, y1: 158, x2: 258, y2: 150 },
];

/**
 * Phase 2 motif — a calm horizon with a rising sun: wide open space and a
 * "Hin-zu" orientation (where do I want to go?). The sun sits half above the
 * horizon line, its halo breathing via the shared, reduced-motion-safe
 * `animate-pulse-calm`; soft foreground hills give the scene depth. Purely
 * decorative (aria-hidden) — the PhaseStart screen is fully understandable
 * from its heading and text. Colours come only from tokens: the sun carries
 * the persona accent (Phase 2 is a non-IST phase), neutrals stay subtle/faint.
 */
export function Phase2Motif() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <svg
        viewBox="0 0 360 280"
        className="h-auto w-full"
        aria-hidden="true"
        focusable="false"
      >
        {/* everything above the horizon is clipped to it (the sun "rises") */}
        <defs>
          <clipPath id="phase2-horizon">
            <rect x="0" y="0" width="360" height="176" />
          </clipPath>
        </defs>

        {/* sun rays */}
        <g
          fill="none"
          strokeLinecap="round"
          strokeWidth={2}
          className="stroke-accent/40"
        >
          {RAYS.map((ray, index) => (
            <line key={index} x1={ray.x1} y1={ray.y1} x2={ray.x2} y2={ray.y2} />
          ))}
        </g>

        {/* rising sun — breathing halo + ring + filled core, clipped at the horizon */}
        <g clipPath="url(#phase2-horizon)">
          <circle
            cx={180}
            cy={176}
            r={44}
            className="animate-pulse-calm fill-accent/10 [transform-box:fill-box]"
          />
          <circle
            cx={180}
            cy={176}
            r={34}
            strokeWidth={1.5}
            className="fill-none stroke-accent/30"
          />
          <circle cx={180} cy={176} r={26} className="fill-accent/85" />
        </g>

        {/* horizon line */}
        <line
          x1={16}
          y1={176}
          x2={344}
          y2={176}
          strokeWidth={1.25}
          strokeLinecap="round"
          className="stroke-subtle"
        />

        {/* soft foreground hills — the open space between here and there */}
        <path
          d="M0 208 Q 90 190 180 202 T 360 198 L 360 280 L 0 280 Z"
          className="fill-faint/15"
        />
        <path
          d="M0 234 Q 120 218 226 230 T 360 226 L 360 280 L 0 280 Z"
          className="fill-faint/25"
        />
      </svg>
    </div>
  );
}
