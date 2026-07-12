/** One cockpit facet: a rounded panel with content bars that "fill up". */
type Facet = {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Widths of the content bars inside (0 = empty slot placeholder). */
  bars: number[];
  /** Facet emphasis: filled facets carry more accent. */
  tone: "strong" | "soft" | "empty";
};

const FACETS: Facet[] = [
  { x: 24, y: 36, w: 148, h: 74, bars: [96, 72, 48], tone: "strong" },
  { x: 188, y: 36, w: 148, h: 74, bars: [88, 56], tone: "soft" },
  { x: 24, y: 126, w: 100, h: 118, bars: [56, 40, 64], tone: "soft" },
  { x: 140, y: 126, w: 100, h: 56, bars: [52], tone: "empty" },
  { x: 140, y: 198, w: 100, h: 46, bars: [48, 32], tone: "soft" },
  { x: 256, y: 126, w: 80, h: 118, bars: [40, 52, 28], tone: "strong" },
];

/**
 * Phase 3 motif — an abstract resource cockpit: a board of facets (panels)
 * gradually filling with entries, standing for the resources collected step by
 * step. One facet breathes via the shared, reduced-motion-safe
 * `animate-pulse-calm`. Purely decorative (aria-hidden) — the PhaseStart
 * screen is fully understandable from its heading and text. Colours come only
 * from tokens: accent (Phase 3 is a non-IST phase) plus subtle/faint neutrals.
 */
export function Phase3Motif() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <svg
        viewBox="0 0 360 280"
        className="h-auto w-full"
        aria-hidden="true"
        focusable="false"
      >
        {/* board outline */}
        <rect
          x={10}
          y={22}
          width={340}
          height={236}
          rx={16}
          strokeWidth={1.25}
          className="fill-none stroke-subtle"
        />

        {/* breathing highlight behind the first facet — the board comes alive */}
        <rect
          x={16}
          y={28}
          width={164}
          height={90}
          rx={12}
          className="animate-pulse-calm fill-accent/10 [transform-box:fill-box]"
        />

        {FACETS.map((facet, index) => (
          <g key={index}>
            <rect
              x={facet.x}
              y={facet.y}
              width={facet.w}
              height={facet.h}
              rx={10}
              strokeWidth={1.25}
              className={
                facet.tone === "strong"
                  ? "fill-accent/5 stroke-accent/40"
                  : "fill-none stroke-subtle"
              }
            />
            {facet.bars.map((barWidth, barIndex) => (
              <rect
                key={barIndex}
                x={facet.x + 12}
                y={facet.y + 14 + barIndex * 14}
                width={Math.min(barWidth, facet.w - 24)}
                height={6}
                rx={3}
                className={
                  facet.tone === "strong"
                    ? barIndex === 0
                      ? "fill-accent/85"
                      : "fill-accent/40"
                    : facet.tone === "soft"
                      ? barIndex === 0
                        ? "fill-accent/40"
                        : "fill-faint/35"
                      : "fill-faint/25"
                }
              />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
