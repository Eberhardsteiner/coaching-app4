/**
 * Card colour palette for the moderation board. Light surfaces with dark text
 * (deliberate card colours — colour carries meaning). Pink is intentionally NOT
 * part of this palette: it is reserved for the IST anchor card.
 */
export interface CardColor {
  id: string;
  label: string;
  /** Surface + text classes for the card body. */
  surface: string;
  /** Saturated swatch for the colour button. */
  swatch: string;
}

export const CARD_COLORS: CardColor[] = [
  {
    id: "neutral",
    label: "Neutral",
    surface: "bg-surface text-foreground",
    swatch: "bg-surface-2",
  },
  {
    id: "blue",
    label: "Blau",
    surface: "bg-blue-50 text-blue-900",
    swatch: "bg-blue-400",
  },
  {
    id: "green",
    label: "Grün",
    surface: "bg-green-50 text-green-900",
    swatch: "bg-green-400",
  },
  {
    id: "teal",
    label: "Teal",
    surface: "bg-teal-100 text-teal-900",
    swatch: "bg-teal-600",
  },
  {
    id: "amber",
    label: "Amber",
    surface: "bg-amber-50 text-amber-900",
    swatch: "bg-amber-600",
  },
];

export const DEFAULT_CARD_COLOR = "neutral";

/**
 * IST-analysis card stages (Phase 1, Schritt 2) — "Farbe = Bedeutung". A fixed
 * 4-colour set keyed to the four stages; stage 1 (the IST feeling anchor) is
 * rendered separately in rosa (the IST token), so only stages 2–4 are card
 * colours here. Light fill + dark ink come from the `--color-card-*` tokens.
 */
export const CARD_STAGES: CardColor[] = [
  {
    id: "zusammenhang",
    label: "Zusammenhang",
    surface: "bg-card-zusammenhang text-card-zusammenhang-ink",
    swatch: "bg-orange-200",
  },
  {
    id: "konkretisierung",
    label: "Konkretisierung",
    surface: "bg-card-konkretisierung text-card-konkretisierung-ink",
    swatch: "bg-green-400",
  },
  {
    id: "beitrag",
    label: "Beitrag",
    surface: "bg-card-beitrag text-card-beitrag-ink",
    swatch: "bg-faint",
  },
];

/** Every resolvable card colour (generic palette + the IST-analysis stages). */
const ALL_CARD_COLORS: CardColor[] = [...CARD_COLORS, ...CARD_STAGES];

/** Resolve a colour id to its definition (falls back to neutral). */
export function getCardColor(id: string | undefined): CardColor {
  return ALL_CARD_COLORS.find((color) => color.id === id) ?? CARD_COLORS[0];
}
