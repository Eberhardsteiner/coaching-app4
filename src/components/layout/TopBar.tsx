import { CircleHelp, Save, Upload } from "lucide-react";

import { cn } from "@/lib/utils";

const PHASE_COUNT = 6;
const ACTIVE_PHASE = 1; // 1-based; placeholder until the phase flow exists.

const ACTIONS = [
  { id: "save", label: "Speichern / Export", icon: Save },
  { id: "import", label: "Import", icon: Upload },
  { id: "help", label: "Hilfe", icon: CircleHelp },
] as const;

/**
 * Top bar of the AppShell: a placeholder phase indicator (left) and placeholder
 * action icons (right). The actions carry aria-labels but are wired up in
 * WP1/WP6 — for now they are inert.
 */
export function TopBar() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-subtle bg-surface/80 px-4 py-2.5 backdrop-blur">
      {/* Phase indicator (placeholder, non-interactive) */}
      <ol
        className="flex items-center gap-1.5"
        aria-label={`Phase ${ACTIVE_PHASE} von ${PHASE_COUNT}`}
      >
        {Array.from({ length: PHASE_COUNT }, (_, index) => {
          const step = index + 1;
          const active = step === ACTIVE_PHASE;
          return (
            <li key={step} aria-current={active ? "step" : undefined}>
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-colors",
                  active ? "w-7 bg-accent" : "w-4 bg-subtle",
                )}
              />
            </li>
          );
        })}
      </ol>

      {/* Action icons (placeholder, inert) */}
      <div className="flex items-center gap-1">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            aria-label={action.label}
            title={action.label}
            className="flex size-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <action.icon className="size-5" />
          </button>
        ))}
      </div>
    </header>
  );
}
