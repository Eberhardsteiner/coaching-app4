import { ChevronDown } from "lucide-react";

import { ContentLoadState } from "@/features/content/ContentLoadState";
import { useModel } from "@/features/content/useModel";
import { cn } from "@/lib/utils";

/**
 * Collapsible reference of the method's value list (werteliste.json — ten
 * categories with their values as subterms, deliberately including ambivalent
 * ones). Clicking a value hands it to the caller (taken into the active
 * column/cluster); `disabled` blocks picking when the target is full.
 */
export function WertelisteReferenz({
  onPick,
  disabled = false,
  summaryLabel = "Werteliste ansehen",
}: {
  onPick: (value: string) => void;
  disabled?: boolean;
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
                {(category.subterms ?? []).map((value) => (
                  <button
                    key={value}
                    type="button"
                    disabled={disabled}
                    onClick={() => onPick(value)}
                    className={cn(
                      "rounded-full border border-subtle bg-surface px-2.5 py-1 text-xs text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      disabled && "cursor-not-allowed opacity-45",
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : null}
      </div>
    </details>
  );
}
