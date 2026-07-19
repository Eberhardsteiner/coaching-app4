import { Map, RotateCcw } from "lucide-react";
import { Link } from "react-router";

import { ContactCard } from "@/components/ContactCard";
import { Button } from "@/components/ui/button";
import { SafetyNotice } from "@/features/safety/SafetyNotice";
import { useSessionStore } from "@/features/session/sessionStore";

type HelpDrawerContentProps = {
  /** Re-open the onboarding tour. */
  onStartTour: () => void;
};

/** P6: technische Bedienhilfe — wie die App funktioniert (kein Methodik-Inhalt). */
const BEDIENHILFE: { frage: string; antwort: string }[] = [
  {
    frage: "Wie speichere ich?",
    antwort:
      "Gar nicht nötig — jede Eingabe wird automatisch auf deinem Gerät gespeichert. Du kannst den Browser jederzeit schließen und später weitermachen.",
  },
  {
    frage: "Wie navigiere ich?",
    antwort:
      "Mit „Weiter“ und „Zurück“ unten in jedem Schritt. Über die Phasenleiste oben springst du frei in bereits abgeschlossene Phasen.",
  },
  {
    frage: "Was sind die Schubladen rechts?",
    antwort:
      "Werkzeuge (u. a. Sicherung und Ressourcen-Cockpit), Erkenntnisboard (dein Notizbuch über alle Phasen), Modelle und diese Hilfe. Ein Klick öffnet, Esc oder ✕ schließt.",
  },
  {
    frage: "Wie sichere ich meine Sitzung?",
    antwort:
      "In der Schublade „Werkzeuge“ kannst du deine Sitzung als Datei exportieren und später wieder importieren — z. B. für ein anderes Gerät.",
  },
  {
    frage: "Wie setze ich eine Sitzung fort?",
    antwort:
      "Die App öffnet automatisch deine letzte Sitzung. Alle Sitzungen findest du über die Startseite unter „Sitzung fortsetzen“.",
  },
];

/**
 * Content of the Hilfe drawer (P6): FIRST the technical how-to-use help —
 * methodische Hinweise stehen in den jeweiligen Schritten, nicht hier —
 * then the reusable SafetyNotice (kept permanently reachable), quiet links
 * to the legal pages, and a "restart tour" action.
 */
export function HelpDrawerContent({ onStartTour }: HelpDrawerContentProps) {
  const isSelf = useSessionStore((s) => s.session?.meta.branch === "self");

  return (
    <div className="space-y-5">
      {/* P6: technische Bedienhilfe zuerst, eindeutig beschriftet. */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-faint">
          Bedienung der App
        </p>
        <dl className="space-y-3">
          {BEDIENHILFE.map((eintrag) => (
            <div key={eintrag.frage}>
              <dt className="text-sm font-medium text-foreground">
                {eintrag.frage}
              </dt>
              <dd className="mt-0.5 text-sm text-muted">{eintrag.antwort}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="border-t border-subtle pt-4">
        <SafetyNotice />
      </div>

      <ContactCard />

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

      {isSelf ? (
        <Link
          to="/einfuehrung"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Map className="size-4" />
          Einführung ansehen
        </Link>
      ) : null}

      <Button variant="outline" size="sm" onClick={onStartTour}>
        <RotateCcw />
        Tour erneut starten
      </Button>
    </div>
  );
}
