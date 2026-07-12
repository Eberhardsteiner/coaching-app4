import { FileText } from "lucide-react";
import { Link } from "react-router";

import { useSessionStore } from "@/features/session/sessionStore";

/**
 * Content of the "Werkzeuge" drawer. Once a goal sentence exists (Phase 2),
 * it is shown on top as a calm read-only card — keeping the mantra "stets vor
 * Augen". Below: the entry point to the session summary / PDF. More
 * phase-specific tools will follow.
 */
export function ToolsDrawerContent() {
  const goalText = useSessionStore((s) => s.session?.phase2.goalText ?? "");

  return (
    <div className="space-y-4">
      {goalText.trim() ? (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-faint">
            Dein Zielsatz
          </p>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-foreground">
            {goalText.trim()}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted">
          Hier erscheinen Werkzeuge für die aktuelle Phase — ab Phase 2 zum
          Beispiel dein Zielsatz.
        </p>
      )}

      <Link
        to="/zusammenfassung"
        className="inline-flex items-center gap-2 text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <FileText className="size-4" />
        Zusammenfassung ansehen &amp; als PDF speichern
      </Link>
    </div>
  );
}
