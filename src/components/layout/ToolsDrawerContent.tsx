import { FileText, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { RessourcenCockpitOverlay } from "@/features/phases/phase3/RessourcenCockpit";
import { useSessionStore } from "@/features/session/sessionStore";

/**
 * Content of the "Werkzeuge" drawer. Once a goal sentence exists (Phase 2),
 * it is shown on top as a calm read-only card — keeping the mantra "stets vor
 * Augen". From Phase 3 on, the Ressourcen-Cockpit is one click away (full
 * overlay). Below: the entry point to the session summary / PDF.
 */
export function ToolsDrawerContent() {
  const goalText = useSessionStore((s) => s.session?.phase2.goalText ?? "");
  const phase = useSessionStore((s) => s.session?.progress.phase ?? 0);
  const phase2Done = useSessionStore(
    (s) => s.session?.progress.completedPhases.includes(2) ?? false,
  );
  const [cockpitOpen, setCockpitOpen] = useState(false);

  const cockpitAvailable = phase >= 3 || phase2Done;

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

      {cockpitAvailable ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => setCockpitOpen(true)}
        >
          <LayoutDashboard />
          Mein Ressourcen-Cockpit
        </Button>
      ) : null}

      <Link
        to="/zusammenfassung"
        className="inline-flex items-center gap-2 text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <FileText className="size-4" />
        Zusammenfassung ansehen &amp; als PDF speichern
      </Link>

      <RessourcenCockpitOverlay
        open={cockpitOpen}
        onClose={() => setCockpitOpen(false)}
      />
    </div>
  );
}
