import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Visual-Baukasten (VIS-2): eine beschriftete Bewertungs-Skala als
 * BEDIENELEMENT (verallgemeinert aus der 1.4-Schmerzskala) — eine Zeile pro
 * bewertetem Ding: Label links, dann `max` klickbare Wertpositionen. Zellen
 * bis zum eigenen Wert füllen sich (Balken-Wirkung); von anderen belegte
 * Werte sind sichtbar belegt und gesperrt; Klick auf den eigenen Wert
 * entfernt ihn (Toggle). Ton "ist" hebt die Zeile als Kernthema hervor.
 */
export function SkalaBar({
  label,
  value,
  onSelect,
  taken,
  max = 10,
  tone = "calm",
  leadingIcon,
  trailing,
  readOnly = false,
}: {
  /** Row label (e.g. the cluster name). */
  label: string;
  /** The currently assigned value (undefined = none yet). */
  value?: number;
  /** Called with the new value, or undefined when the own value is cleared. */
  onSelect: (value: number | undefined) => void;
  /** Values already taken by OTHER rows (rendered blocked). */
  taken: Set<number>;
  max?: number;
  /** "ist" marks the Kernthema row (rosa); "calm" is the default blue. */
  tone?: "calm" | "ist";
  /** Optional small icon before the label (e.g. the storm cloud). */
  leadingIcon?: ReactNode;
  /** Optional trailing element (e.g. a "Kernthema" tag). */
  trailing?: ReactNode;
  readOnly?: boolean;
}) {
  const cells = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
      <span className="flex w-28 shrink-0 items-center gap-1.5 sm:w-36">
        {leadingIcon}
        <span className="truncate text-sm text-foreground">{label}</span>
      </span>
      <div
        role="group"
        aria-label={`Wert für „${label}“ (1 bis ${max})`}
        className="flex min-w-0 flex-1 items-center gap-0.5"
      >
        {cells.map((cell) => {
          const isOwn = value === cell;
          const isBlocked = !isOwn && taken.has(cell);
          const isFilled = value != null && cell <= value;
          return (
            <button
              key={cell}
              type="button"
              disabled={readOnly || isBlocked}
              aria-pressed={isOwn}
              aria-label={
                isOwn
                  ? `Wert ${cell} für „${label}“ entfernen`
                  : isBlocked
                    ? `Wert ${cell} ist bereits vergeben`
                    : `Wert ${cell} für „${label}“ vergeben`
              }
              title={
                isBlocked
                  ? "Bereits vergeben — jeder Wert nur einmal"
                  : undefined
              }
              onClick={() => onSelect(isOwn ? undefined : cell)}
              className={cn(
                "h-7 min-w-0 flex-1 rounded text-xs font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2",
                tone === "ist"
                  ? "focus-visible:ring-ist"
                  : "focus-visible:ring-accent",
                isOwn
                  ? tone === "ist"
                    ? "bg-ist text-white"
                    : "bg-blue-600 text-white"
                  : isFilled
                    ? tone === "ist"
                      ? "bg-ist/40 text-white"
                      : "bg-blue-400/50 text-blue-900"
                    : isBlocked
                      ? "cursor-not-allowed bg-surface-2 text-faint/60 line-through"
                      : "bg-surface-2 text-muted hover:bg-blue-50 hover:text-foreground",
              )}
            >
              {cell}
            </button>
          );
        })}
      </div>
      {trailing}
    </div>
  );
}
