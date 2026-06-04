import { RotateCcw } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { SafetyNotice } from "@/features/safety/SafetyNotice";

type HelpDrawerContentProps = {
  /** Re-open the onboarding tour. */
  onStartTour: () => void;
};

/**
 * Content of the Hilfe drawer: the reusable SafetyNotice (kept permanently
 * reachable), quiet links to the legal pages, and a "restart tour" action.
 * Links open in a new tab so the session view stays put.
 */
export function HelpDrawerContent({ onStartTour }: HelpDrawerContentProps) {
  return (
    <div className="space-y-5">
      <SafetyNotice />

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-faint">
          Rechtliches
        </p>
        <ul className="space-y-1.5 text-sm">
          <li>
            <Link
              to="/rechtliches"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline-offset-4 hover:underline"
            >
              Rechtliches &amp; Sicherheit
            </Link>
          </li>
          <li>
            <Link
              to="/datenschutz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline-offset-4 hover:underline"
            >
              Datenschutz
            </Link>
          </li>
        </ul>
      </div>

      <Button variant="outline" size="sm" onClick={onStartTour}>
        <RotateCcw />
        Tour erneut starten
      </Button>
    </div>
  );
}
