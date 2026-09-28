import { cn } from "@/lib/utils";

/**
 * One yes/no check (three-state: undefined = offen; a click on the active
 * option clears it). Used for the quality check per cluster (4.2) and for
 * „Hast du deine Ressourcen eingesetzt?“ per measure (4.1, F3).
 */
export function JaNeinCheck({
  value,
  onChange,
  ariaContext,
}: {
  value?: boolean;
  onChange: (next: boolean | undefined) => void;
  ariaContext: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaContext}
      className="inline-flex shrink-0 overflow-hidden rounded-lg border border-subtle"
    >
      <button
        type="button"
        aria-pressed={value === true}
        onClick={() => onChange(value === true ? undefined : true)}
        className={cn(
          "px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
          value === true
            ? "bg-green-600 text-white"
            : "bg-surface text-muted hover:text-foreground",
        )}
      >
        ja
      </button>
      <button
        type="button"
        aria-pressed={value === false}
        onClick={() => onChange(value === false ? undefined : false)}
        className={cn(
          "border-l border-subtle px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
          value === false
            ? "bg-amber-600 text-white"
            : "bg-surface text-muted hover:text-foreground",
        )}
      >
        nein
      </button>
    </div>
  );
}
