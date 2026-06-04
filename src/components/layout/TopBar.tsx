import { CircleHelp, Save } from "lucide-react";

import { downloadSession } from "@/features/session/exportSession";
import { ImportButton } from "@/features/session/ImportButton";
import { useSessionStore } from "@/features/session/sessionStore";
import { cn } from "@/lib/utils";

const PHASE_COUNT = 6;
const ACTIVE_PHASE = 1; // 1-based; placeholder until the phase flow exists.

/**
 * Top bar of the AppShell: a placeholder phase indicator (left) and action
 * icons (right). Export and Import are wired up; Hilfe stays a placeholder.
 */
export function TopBar() {
  const session = useSessionStore((s) => s.session);

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

      <div className="flex items-center gap-1">
        {/* Export the active session as a JSON file. */}
        <button
          type="button"
          onClick={() => {
            if (session) downloadSession(session);
          }}
          disabled={!session}
          aria-label="Sitzung exportieren"
          title="Sitzung exportieren"
          className="flex size-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="size-5" />
        </button>

        {/* Import a previously saved session. */}
        <ImportButton iconOnly label="Sitzung importieren" />

        {/* Help — placeholder, wired up in a later package. */}
        <button
          type="button"
          aria-label="Hilfe"
          title="Hilfe"
          className="flex size-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <CircleHelp className="size-5" />
        </button>
      </div>
    </header>
  );
}
