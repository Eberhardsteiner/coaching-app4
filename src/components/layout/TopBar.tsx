import { CircleHelp, FileDown, Save } from "lucide-react";
import { Link } from "react-router";

import { PhaseBar } from "@/features/phases/PhaseBar";
import { downloadSession } from "@/features/session/exportSession";
import { ImportButton } from "@/features/session/ImportButton";
import { useSessionStore } from "@/features/session/sessionStore";

/**
 * Top bar of the AppShell: the real phase indicator (left) and action icons
 * (right). Export and Import are wired up; Hilfe stays a placeholder.
 */
export function TopBar() {
  const session = useSessionStore((s) => s.session);
  const compact = session?.meta.branch === "coached";

  return (
    <header className="flex items-center justify-between gap-4 border-b border-subtle bg-surface/80 px-4 py-2.5 backdrop-blur">
      <PhaseBar compact={compact} />

      <div className="flex items-center gap-1">
        {/* Export the active session as a JSON file. */}
        <button
          type="button"
          data-tour="export"
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

        {/* Open the print-ready summary page (the user prints to PDF there). */}
        <Link
          to="/zusammenfassung"
          aria-label="Ergebnisse als PDF speichern"
          title="Ergebnisse als PDF speichern"
          className="flex size-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <FileDown className="size-5" />
        </Link>

        {/* Import a previously saved session. */}
        <span data-tour="import" className="inline-flex">
          <ImportButton iconOnly label="Sitzung importieren" />
        </span>

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
