/**
 * Durchgängige Symbolsprache aus dem Rubikon-Bild der Methodik (MP1-REV):
 * je Phase EIN wiedererkennbares Symbol, überall konsistent verwendet —
 * in der Rubikon-Infografik (IntroView), den Phasen-Motiven und überall,
 * wo eine Phase kompakt bebildert wird.
 *
 *   Phase 1 — Gewitterwolke (IST, „Weg von …")   → ist-Token (rosa)
 *   Phase 2 — Sonne (attraktives Ziel, „Hin zu …") → accent
 *   Phase 3 — Koffer (Ressourcen als Reisegepäck)  → accent
 *   Phase 4 — Papierschiff (Maßnahmen — Übersetzen) → accent
 *   Phase 5 — Fahne (Ankommen, Dranbleiben)        → accent
 *
 * Alle Symbole zeichnen mit `currentColor` — die Aufrufstelle setzt die Farbe
 * per Token-Klasse (`text-ist`, `text-accent`, …). Dekorativ: aria-hidden.
 */

type SymbolProps = { className?: string };

/** Phase 1 — Gewitterwolke mit Regen und Blitz (IST: mit `text-ist` färben). */
export function CloudSymbol({ className }: SymbolProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Wolkenkörper aus weichen Bögen */}
      <path
        d="M13 27 a7 7 0 0 1 1.4-13.6 A9.5 9.5 0 0 1 32.8 11.8 A6.8 6.8 0 0 1 36 24.9 L36 27 Z"
        className="fill-current"
      />
      {/* Regen */}
      <g
        strokeWidth={2}
        strokeLinecap="round"
        className="stroke-current opacity-60"
      >
        <line x1={15} y1={31} x2={13} y2={36} />
        <line x1={33} y1={31} x2={31} y2={36} />
      </g>
      {/* Blitz */}
      <path
        d="M25 29 L20 37 L24 37 L21.5 44 L29 34.5 L25 34.5 Z"
        className="fill-current"
      />
    </svg>
  );
}

/** Phase 2 — Sonne (attraktives Ziel: mit `text-accent` färben). */
export function SunSymbol({ className }: SymbolProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx={24} cy={24} r={8.5} className="fill-current" />
      <g strokeWidth={2.5} strokeLinecap="round" className="stroke-current">
        <line x1={24} y1={6} x2={24} y2={11} />
        <line x1={24} y1={37} x2={24} y2={42} />
        <line x1={6} y1={24} x2={11} y2={24} />
        <line x1={37} y1={24} x2={42} y2={24} />
        <line x1={11.3} y1={11.3} x2={14.8} y2={14.8} />
        <line x1={33.2} y1={33.2} x2={36.7} y2={36.7} />
        <line x1={11.3} y1={36.7} x2={14.8} y2={33.2} />
        <line x1={33.2} y1={14.8} x2={36.7} y2={11.3} />
      </g>
    </svg>
  );
}

/** Phase 3 — Koffer (Ressourcen als Reisegepäck: mit `text-accent` färben). */
export function SuitcaseSymbol({ className }: SymbolProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Griff */}
      <path
        d="M19 15 v-3.5 a2.5 2.5 0 0 1 2.5-2.5 h5 a2.5 2.5 0 0 1 2.5 2.5 V15"
        strokeWidth={2.5}
        strokeLinecap="round"
        className="fill-none stroke-current"
      />
      {/* Korpus */}
      <rect
        x={8}
        y={15}
        width={32}
        height={23}
        rx={4}
        className="fill-current opacity-20"
      />
      <rect
        x={8}
        y={15}
        width={32}
        height={23}
        rx={4}
        strokeWidth={2.5}
        className="fill-none stroke-current"
      />
      {/* Verschluss-Linien */}
      <line
        x1={16}
        y1={15}
        x2={16}
        y2={38}
        strokeWidth={2}
        className="stroke-current opacity-60"
      />
      <line
        x1={32}
        y1={15}
        x2={32}
        y2={38}
        strokeWidth={2}
        className="stroke-current opacity-60"
      />
    </svg>
  );
}

/** Phase 4 — Papierschiff (Maßnahmen — Übersetzen: mit `text-accent` färben). */
export function BoatSymbol({ className }: SymbolProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Segel (zwei Faltflächen) */}
      <path d="M24 6 L24 25 L12 25 Z" className="fill-current opacity-45" />
      <path d="M24 10 L24 25 L34 25 Z" className="fill-current" />
      {/* Rumpf */}
      <path d="M7 28 L41 28 L32.5 37 L15.5 37 Z" className="fill-current" />
      {/* Wasserlinien */}
      <g
        strokeWidth={2}
        strokeLinecap="round"
        className="stroke-current opacity-50"
      >
        <path d="M10 42 q4 -2.5 8 0 t 8 0 t 8 0" fill="none" />
      </g>
    </svg>
  );
}

/** Phase 5 — Fahne / Wegmarke (Ankommen, Dranbleiben: mit `text-accent`). */
export function FlagSymbol({ className }: SymbolProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Mast */}
      <line
        x1={17}
        y1={7}
        x2={17}
        y2={41}
        strokeWidth={3}
        strokeLinecap="round"
        className="stroke-current"
      />
      {/* Fahnentuch */}
      <path d="M17 9 L36 14.5 L17 20 Z" className="fill-current" />
      {/* Boden */}
      <path
        d="M9 41 q8 -3 16 0"
        strokeWidth={2}
        strokeLinecap="round"
        className="fill-none stroke-current opacity-50"
      />
    </svg>
  );
}
