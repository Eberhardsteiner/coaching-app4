import { useSearchParams } from "react-router";

import { BRANCH_LABELS, isCoachingBranch } from "@/config/constants";

/**
 * Placeholder phase view, rendered inside the AppShell stage. The real phase
 * flow arrives in a later package. Reads the ?branch= param only to confirm it
 * arrived (shown discreetly for control).
 */
export function SessionView() {
  const [params] = useSearchParams();
  const branchParam = params.get("branch");
  const branchLabel = isCoachingBranch(branchParam)
    ? BRANCH_LABELS[branchParam]
    : "—";

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <p className="font-serif text-2xl text-foreground sm:text-3xl">
        Phasenfluss folgt
      </p>
      <p className="mt-3 max-w-md text-sm text-muted">
        Hier entsteht der geführte Ablauf durch die Phasen. Bühne, Top-Leiste
        und die Schubladen rechts sind bereits bedienbar.
      </p>
      <p className="mt-6 text-xs text-faint">Zweig: {branchLabel}</p>
    </div>
  );
}
