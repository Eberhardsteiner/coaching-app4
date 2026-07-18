import { Check, ChevronDown } from "lucide-react";

import { ContentLoadState } from "@/features/content/ContentLoadState";
import { useModel } from "@/features/content/useModel";
import { cn } from "@/lib/utils";

/**
 * Collapsible reference of the method's value list (werteliste.json — ten
 * categories with their values as subterms, deliberately including ambivalent
 * ones). Clicking a value hands it to the caller (taken into the active
 * column/cluster). The list stays open across picks; `isTaken(value)` marks
 * already-taken values with a check and disables that single chip (never the
 * whole list). `disabled` blocks all picking only when the target is full.
 */
export function WertelisteReferenz({
  onPick,
  disabled = false,
  isTaken,
  summaryLabel = "Werteliste ansehen",
}: {
  onPick: (value: string) => void;
  disabled?: boolean;
  /** Whether a value is already present in the active target (→ check + lock). */
  isTaken?: (value: string) => boolean;
  summaryLabel?: string;
}) {
  const loaded = useModel("werteliste");

  return (
    <details className="group rounded-xl border border-subtle bg-surface p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-foreground">
        {summaryLabel}
        <ChevronDown
          className="size-4 text-muted motion-safe:transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="mt-3 space-y-4">
        <p className="text-xs text-faint">
          Exemplarisch — kein Anspruch auf Vollständigkeit.
        </p>
        {loaded.status === "loading" || loaded.status === "error" ? (
          <ContentLoadState
            status={loaded.status}
            error={loaded.error}
            onRetry={loaded.retry}
            loadingLabel="Werteliste wird geladen …"
          />
        ) : loaded.model ? (
          loaded.model.terms.map((category) => (
            <div key={category.id}>
              <p className="text-xs font-medium uppercase tracking-wide text-faint">
                {category.label}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(category.subterms ?? []).map((value) => {
                  const taken = isTaken?.(value) ?? false;
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={disabled || taken}
                      aria-pressed={taken}
                      onClick={() => onPick(value)}
                      className={cn(
                        // break-words: lange Begriffe umbrechen als ganzer Chip,
                        // nie buchstabenweise, nie überlaufend (K3).
                        "inline-flex max-w-full items-center gap-1 rounded-full border border-subtle bg-surface px-2.5 py-1 text-left text-xs break-words text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        taken && "border-accent/40 bg-accent/10 text-accent",
                        disabled && !taken && "cursor-not-allowed opacity-45",
                        taken && "cursor-default",
                      )}
                    >
                      {taken ? (
                        <Check className="size-3 shrink-0" aria-hidden />
                      ) : null}
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        ) : null}
      </div>
    </details>
  );
}
