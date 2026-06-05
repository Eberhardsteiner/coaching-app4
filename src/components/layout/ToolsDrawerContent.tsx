import { FileText } from "lucide-react";
import { Link } from "react-router";

/**
 * Content of the "Werkzeuge" drawer. For now: an entry point to the session
 * summary / PDF (reachable during and after the session). More phase-specific
 * tools will follow.
 */
export function ToolsDrawerContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Hier erscheinen später Werkzeuge für die aktuelle Phase.
      </p>

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
