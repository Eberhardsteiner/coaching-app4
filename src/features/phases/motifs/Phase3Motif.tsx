/** Travel stickers on the suitcase (collected resources). */
const STICKERS: { cx: number; cy: number; r: number; strong?: boolean }[] = [
  { cx: 150, cy: 132, r: 9, strong: true },
  { cx: 236, cy: 122, r: 7 },
  { cx: 208, cy: 168, r: 8, strong: true },
  { cx: 132, cy: 178, r: 6 },
];

/**
 * Phase 3 motif — the suitcase of the journey (MP1-REV: the shared Rubikon
 * symbol language — Phase 3 packs the Ressourcen as Reisegepäck): a calm,
 * large suitcase in the persona accent with straps and a few round "travel
 * stickers" standing for the resources collected step by step; a small stack
 * of items still waits beside it. The suitcase halo breathes via the shared,
 * reduced-motion-safe `animate-pulse-calm`. Purely decorative (aria-hidden) —
 * the PhaseStart screen is fully understandable from its heading and text.
 * Colours come only from tokens: accent (Phase 3 is a non-IST phase) plus
 * subtle/faint neutrals.
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
        {/* breathing halo behind the suitcase */}
        <rect
          x={92}
          y={86}
          width={184}
          height={130}
          rx={22}
          className="animate-pulse-calm fill-accent/10 [transform-box:fill-box]"
        />

        {/* handle */}
        <path
          d="M164 100 v-12 a8 8 0 0 1 8-8 h24 a8 8 0 0 1 8 8 v12"
          strokeWidth={5}
          strokeLinecap="round"
          className="fill-none stroke-accent/70"
        />

        {/* suitcase body */}
        <rect
          x={104}
          y={100}
          width={160}
          height={110}
          rx={14}
          className="fill-accent/15"
        />
        <rect
          x={104}
          y={100}
          width={160}
          height={110}
          rx={14}
          strokeWidth={2.5}
          className="fill-none stroke-accent/60"
        />

        {/* straps */}
        <line
          x1={140}
          y1={100}
          x2={140}
          y2={210}
          strokeWidth={4}
          className="stroke-accent/35"
        />
        <line
          x1={228}
          y1={100}
          x2={228}
          y2={210}
          strokeWidth={4}
          className="stroke-accent/35"
        />

        {/* travel stickers — the resources already packed */}
        {STICKERS.map((sticker, index) => (
          <circle
            key={index}
            cx={sticker.cx}
            cy={sticker.cy}
            r={sticker.r}
            className={sticker.strong ? "fill-accent/85" : "fill-accent/40"}
          />
        ))}

        {/* feet */}
        <line
          x1={128}
          y1={214}
          x2={140}
          y2={214}
          strokeWidth={5}
          strokeLinecap="round"
          className="stroke-accent/50"
        />
        <line
          x1={228}
          y1={214}
          x2={240}
          y2={214}
          strokeWidth={5}
          strokeLinecap="round"
          className="stroke-accent/50"
        />

        {/* a small stack of items still waiting to be packed */}
        <rect
          x={286}
          y={182}
          width={44}
          height={13}
          rx={5}
          className="fill-faint/30"
        />
        <rect
          x={292}
          y={166}
          width={32}
          height={13}
          rx={5}
          className="fill-faint/20"
        />

        {/* ground line */}
        <line
          x1={16}
          y1={222}
          x2={344}
          y2={222}
          strokeWidth={1.25}
          strokeLinecap="round"
          className="stroke-subtle"
        />
      </svg>
    </div>
  );
}
