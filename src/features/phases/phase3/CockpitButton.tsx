import { LayoutDashboard } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { countPolarities } from "@/features/phases/phase3/resourceFields";
import { RessourcenCockpitOverlay } from "@/features/phases/phase3/RessourcenCockpit";
import { useSessionStore } from "@/features/session/sessionStore";
import { cn } from "@/lib/utils";

/**
 * K2 — fester Cockpit-Zugriff: ein sichtbarer Button „Ressourcen-Cockpit" an
 * konsistenter Stelle über jedem Phase-3-Schritt (und 4.1), zusätzlich zum
 * Werkzeuge-Eintrag. Das Füllstand-Badge zeigt die Summe der gesammelten
 * Ressourcen-Einträge (countPolarities — dieselbe Zahl wie die 3.10-Zähler).
 * Self-contained: bringt sein eigenes Overlay mit.
 */
export function CockpitButton({ className }: { className?: string }) {
  const phase3 = useSessionStore((s) => s.session?.phase3);
  const [open, setOpen] = useState(false);
  const total = phase3 ? countPolarities(phase3).total : 0;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={cn("shrink-0", className)}
        onClick={() => setOpen(true)}
      >
        <LayoutDashboard />
        Ressourcen-Cockpit
        {total > 0 ? (
          <span
            aria-label={`${total} Einträge`}
            className="rounded-full bg-accent/10 px-1.5 py-0.5 text-xs font-medium tabular-nums text-accent"
          >
            {total}
          </span>
        ) : null}
      </Button>
      <RessourcenCockpitOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
