import { cn } from "@/lib/utils";

/**
 * Visual-Baukasten (VIS-2): nummerierter Ablauf als Kette — Kreise 1-2-3 mit
 * Kurzlabels und Verbindungslinie; horizontal auf breiten Screens, vertikal
 * auf Mobil. Ersetzt „Gehe folgendermaßen vor:"-Absätze. Semantisch eine
 * geordnete Liste.
 */
export function MiniFlow({
  steps,
  ariaLabel = "Vorgehen",
}: {
  steps: { label: string; detail?: string }[];
  ariaLabel?: string;
}) {
  return (
    <ol
      aria-label={ariaLabel}
      className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-0"
    >
      {steps.map((step, index) => (
        <li
          key={step.label}
          className={cn(
            "relative flex items-start gap-2.5 sm:flex-1 sm:flex-col sm:items-center sm:gap-1.5 sm:text-center",
            // Verbindungslinie zur nächsten Station (nur breite Screens).
            index < steps.length - 1 &&
              "sm:after:absolute sm:after:left-[calc(50%+18px)] sm:after:right-[calc(-50%+18px)] sm:after:top-[13px] sm:after:h-px sm:after:bg-subtle",
          )}
        >
          <span
            aria-hidden
            className="flex size-7 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-sm font-semibold text-accent"
          >
            {index + 1}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-foreground">
              {step.label}
            </span>
            {step.detail ? (
              <span className="block text-xs text-muted">{step.detail}</span>
            ) : null}
          </span>
        </li>
      ))}
    </ol>
  );
}
