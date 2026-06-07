import { Check } from "lucide-react";

import { PHASES } from "@/features/phases/phaseConfig";
import { usePhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { cn } from "@/lib/utils";

/**
 * Real phase indicator for the TopBar: phases 0–5 as dots. Current is filled,
 * completed shows a check, the (reachable) frontier is outlined, future phases
 * are locked. Reachable phases are clickable (keyboard + ARIA). `compact` packs
 * it tighter (used in the coach view).
 */
export function PhaseBar({ compact }: { compact?: boolean }) {
  const { progress, isReachable, goToPhase } = usePhaseNavigation();

  return (
    <nav aria-label="Phasen" data-tour="phases">
      <ol className={cn("flex items-center", compact ? "gap-1" : "gap-1.5")}>
        {PHASES.map((phase) => {
          const isCurrent = phase.id === progress.phase;
          const isCompleted = progress.completedPhases.includes(phase.id);
          const reachable = isReachable(phase.id);
          const state = isCompleted
            ? "abgeschlossen"
            : isCurrent
              ? "aktuell"
              : reachable
                ? "erreichbar"
                : "gesperrt";
          return (
            <li key={phase.id} aria-current={isCurrent ? "step" : undefined}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => goToPhase(phase.id)}
                aria-label={`${phase.title} — ${state}`}
                title={phase.title}
                className={cn(
                  "flex items-center justify-center rounded-full transition-colors",
                  compact ? "size-5" : "size-6",
                  isCurrent && "bg-accent text-white",
                  !isCurrent &&
                    isCompleted &&
                    "bg-accent/15 text-accent hover:bg-accent/25",
                  !isCurrent &&
                    !isCompleted &&
                    reachable &&
                    "border border-accent/40 text-accent hover:bg-accent/10",
                  !reachable && "cursor-not-allowed bg-subtle text-faint",
                )}
              >
                {isCompleted && !isCurrent ? (
                  <Check
                    className={compact ? "size-3" : "size-3.5"}
                    aria-hidden
                  />
                ) : (
                  <span
                    className={cn(
                      "rounded-full bg-current",
                      compact ? "size-1" : "size-1.5",
                    )}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
