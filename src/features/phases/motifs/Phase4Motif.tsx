/** Calm water lines of the river (the Rubikon being crossed). */
const WAVES: { d: string; soft?: boolean }[] = [
  { d: "M56 208 q 10 -5 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0" },
  {
    d: "M88 226 q 10 -5 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0",
    soft: true,
  },
  { d: "M120 244 q 10 -5 20 0 t 20 0 t 20 0 t 20 0", soft: true },
];

/**
 * Phase 4 motif — the paper boat crossing the river (MP1-REV: the shared
 * Rubikon symbol language — Phase 4 sets over with the Maßnahmen): a calm
 * paper boat in the persona accent on the water between the near and the far
 * bank; the far bank is already in sight. The boat's halo breathes via the
 * shared, reduced-motion-safe `animate-pulse-calm`. Purely decorative
 * (aria-hidden) — the PhaseStart screen is fully understandable from its
 * heading and text. Colours come only from tokens: accent (Phase 4 is a
 * non-IST phase), blue for the water, subtle/faint neutrals.
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
        {/* near bank (left) and far bank (right) */}
        <path
          d="M0 214 Q 40 200 72 210 L 72 280 L 0 280 Z"
          className="fill-faint/25"
        />
        <path
          d="M288 208 Q 322 196 360 206 L 360 280 L 288 280 Z"
          className="fill-faint/25"
        />

        {/* water lines */}
        <g strokeWidth={2} strokeLinecap="round" fill="none">
          {WAVES.map((wave, index) => (
            <path
              key={index}
              d={wave.d}
              className={
                wave.soft ? "stroke-blue-200/60" : "stroke-blue-400/50"
              }
            />
          ))}
        </g>

        {/* breathing halo behind the boat */}
        <circle
          cx={180}
          cy={144}
          r={64}
          className="animate-pulse-calm fill-accent/10 [transform-box:fill-box]"
        />

        {/* the paper boat — sails + hull */}
        <path d="M180 74 L180 152 L132 152 Z" className="fill-accent/40" />
        <path d="M180 90 L180 152 L220 152 Z" className="fill-accent/85" />
        <path
          d="M116 162 L244 162 L212 196 L148 196 Z"
          className="fill-accent"
        />

        {/* small flag on the far bank — the goal side is in sight */}
        <line
          x1={318}
          y1={196}
          x2={318}
          y2={166}
          strokeWidth={2.5}
          strokeLinecap="round"
          className="stroke-accent/70"
        />
        <path d="M318 167 L336 172 L318 177 Z" className="fill-accent/70" />
      </svg>
    </div>
  );
}
