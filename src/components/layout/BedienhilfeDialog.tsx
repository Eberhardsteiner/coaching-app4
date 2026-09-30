import { LifeBuoy, Map, RotateCcw } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PHASES } from "@/features/phases/phaseConfig";
import { useSessionStore } from "@/features/session/sessionStore";

/** Eine Überschrift mit Fließtext darunter. */
function Abschnitt({
  titel,
  children,
}: {
  titel: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={titel} className="space-y-1.5">
      <h3 className="text-sm font-semibold text-foreground">{titel}</h3>
      <div className="space-y-1.5 text-sm text-muted">{children}</div>
    </section>
  );
}

/** Die vier Schubladen rechts, je mit kurzer Erklärung. */
const SCHUBLADEN: { name: string; text: string }[] = [
  {
    name: "Zielsatz",
    text: "Zeigt deinen Zielsatz, sobald du ihn in Phase 2 formuliert hast. Von dort öffnest du die Zusammenfassung, ab Phase 3 auch dein Ressourcen-Cockpit.",
  },
  {
    name: "Erkenntnisboard",
    text: "Dein Notizbuch über alle Phasen. Was du hier notierst, übernimmst du in 5.2 in deine Erkenntnisse.",
  },
  {
    name: "Modelle",
    text: "Der Modellkatalog der App, nach Phasen geordnet und mit Suchfeld.",
  },
  {
    name: "Hilfe",
    text: "Die Hilfe zum aktuellen Schritt. Darunter findest du die Sicherheitshinweise und den Kontakt zum Coach-Team.",
  },
];

/**
 * Teil 2.1: allgemeine Bedienungshilfe hinter dem Fragezeichen in der
 * Kopfleiste (die Schublade „Hilfe“ zeigt die Hilfe zum aktuellen Schritt).
 * Aufbau, Navigation, Speichern, Export und Import, PDF, Seitenleiste und
 * Datenschutz, dazu Rundgang und Einführung. Beim Öffnen liegt der Fokus
 * auf dem Textbereich (Pfeiltasten scrollen), beim Schließen gibt
 * `onCloseFocus` ihn an den Auslöser zurück.
 */
export function BedienhilfeDialog({
  open,
  onOpenChange,
  onStartTour,
  onOpenStepHelp,
  onCloseFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartTour: () => void;
  /** Öffnet die Schublade „Hilfe“ (auch ohne sichtbare Seitenleiste). */
  onOpenStepHelp: () => void;
  onCloseFocus: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isSelf = useSessionStore((s) => s.session?.meta.branch === "self");
  const arbeitsphasen = PHASES.filter((phase) => phase.id > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100dvh-2rem)] max-w-lg flex-col gap-4 overflow-hidden p-0"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          scrollRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onCloseFocus();
        }}
      >
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>Bedienungshilfe</DialogTitle>
          <DialogDescription>
            So findest du dich in der App zurecht.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={scrollRef}
          tabIndex={-1}
          className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pb-5 focus-visible:outline-none"
        >
          <Abschnitt titel="Aufbau in fünf Phasen">
            <p>
              Am Anfang steht die Vereinbarung. Danach führt dich die App
              Schritt für Schritt durch fünf Phasen:
            </p>
            <ol className="list-decimal space-y-0.5 pl-5">
              {arbeitsphasen.map((phase) => (
                <li key={phase.id}>
                  <span className="font-medium text-foreground">
                    {phase.title}
                  </span>
                  : {phase.short}
                </li>
              ))}
            </ol>
            <p>
              Jede Phase beginnt mit einem Startbildschirm und endet mit dem
              Schritt „Abschluss &amp; Check“.
            </p>
          </Abschnitt>

          <Abschnitt titel="Vor und zurück">
            <p>
              Mit „Weiter“ und „Zurück“ unten in jedem Schritt bewegst du dich
              durch den Prozess. Pflicht sind nur die Bestätigungen vor dem
              Start und in der Vereinbarung. Jeden anderen Schritt kannst du
              auch leer verlassen.
            </p>
            <p>
              Über die Phasenleiste oben links springst du in Phasen, die du
              schon erreicht hast.
            </p>
          </Abschnitt>

          <Abschnitt titel="Speichern">
            <p>
              Das musst du nicht selbst tun. Jede Eingabe wird automatisch in
              deinem Browser auf diesem Gerät gespeichert. Du kannst die App
              jederzeit schließen und später an derselben Stelle weitermachen.
            </p>
          </Abschnitt>

          <Abschnitt titel="Sitzung als Datei sichern und wieder laden">
            <p>
              Mit dem Speichern-Symbol oben rechts lädst du deine Sitzung als
              Datei herunter. Über das Symbol mit dem Pfeil nach oben liest du
              eine gesicherte Datei wieder ein, zum Beispiel auf einem anderen
              Gerät.
            </p>
            <p>
              Alle Sitzungen auf diesem Gerät findest du auf der Startseite
              unter „Sitzung fortsetzen“.
            </p>
          </Abschnitt>

          <Abschnitt titel="Ergebnisse als PDF">
            <p>
              Das Symbol mit dem Blatt und dem Pfeil nach unten öffnet deine
              Zusammenfassung. Dort speicherst du sie mit „Als PDF speichern“
              über den Druckdialog deines Browsers. Denselben Weg findest du in
              der Schublade „Zielsatz“.
            </p>
          </Abschnitt>

          <Abschnitt titel="Die Seitenleiste rechts">
            <dl className="space-y-1.5">
              {SCHUBLADEN.map((schublade) => (
                <div key={schublade.name}>
                  <dt className="font-medium text-foreground">
                    {schublade.name}
                  </dt>
                  <dd>{schublade.text}</dd>
                </div>
              ))}
            </dl>
            <p>
              Es ist immer nur eine Schublade geöffnet. Ein Tipp öffnet sie, mit
              dem Kreuz oder der Taste Esc schließt du sie.
            </p>
          </Abschnitt>

          <Abschnitt titel="Datenschutz">
            <p>
              Deine Eingaben bleiben in deinem Browser auf diesem Gerät. Die App
              sendet nichts an einen Server und ruft keine KI auf.
            </p>
            <p>
              Kopierst du einen Prompt in ein KI-Tool, entscheidest du selbst,
              was du weitergibst. Prüfe den Text vorher auf Namen und andere
              persönliche Angaben.
            </p>
            <p>
              <Link
                to="/datenschutz"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                Datenschutzhinweise lesen
              </Link>
              {" · "}
              <Link
                to="/rechtliches"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                Rechtliches &amp; Sicherheit
              </Link>
            </p>
          </Abschnitt>

          <div className="flex flex-wrap gap-2 border-t border-subtle pt-4">
            <Button variant="outline" size="sm" onClick={onOpenStepHelp}>
              <LifeBuoy />
              Hilfe zu diesem Schritt
            </Button>
            <Button variant="outline" size="sm" onClick={onStartTour}>
              <RotateCcw />
              Tour erneut starten
            </Button>
            {isSelf ? (
              <Button asChild variant="ghost" size="sm">
                <Link to="/einfuehrung">
                  <Map />
                  Einführung ansehen
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
