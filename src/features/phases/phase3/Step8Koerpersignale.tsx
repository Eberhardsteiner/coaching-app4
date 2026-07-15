import { ChevronDown } from "lucide-react";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { ResourceListEditor } from "@/features/phases/phase3/ResourceListEditor";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { ResourceItem } from "@/features/session/types";
import { cn } from "@/lib/utils";

/** Kernsatz sichtbar — der Wortlaut bleibt aufklappbar (VIS-2). */
const INTRO_CORE =
  "Dein Körper ist dein erster Signalgeber — identifiziere, welche Stellen oder Bereiche dir anzeigen, wenn etwas ‚nicht stimmt‘, und notiere sie unter deinen Ressourcen.";

const INTRO_VOLLTEXT =
  "Dein Körper ist der wichtigste und erste Signalgeber für dein Wohlbefinden. Er ist unser Seismograf für Veränderungen von außen und innen — und unsere Gefühlslandkarte, die uns mit Körpersignalen anzeigt, wenn etwas ‚nicht stimmt‘. Oft haben wir spezifische Stellen oder Bereiche, die wir als Signalgeber bereits kennen. Identifiziere, welche das bei dir sind, und notiere sie unter deinen Ressourcen.";

/** Anregungs-Chips (Methodik-Vorlage) — Wahrnehmung, keine Symptome. */
const BODY_CHIPS = [
  "Kopf",
  "Augen",
  "Ohren",
  "Mundhöhle",
  "Zunge",
  "Hals",
  "Haut",
  "Muskeln",
  "Herz-/Kreislaufsystem",
  "Darm",
  "Innere Organe",
  "Füße",
  "Arme",
  "Hände",
  "Beine",
  "Bauch",
  "Rücken",
  "Nacken",
  "Schulter",
  "Atmung",
  "Stimme",
  "Mimik",
  "Geschmack",
  "Geräusche",
  "Appetit",
  "Haltung",
  "Druck",
  "Gestik",
  "Müdigkeit",
  "Schmerzen",
  "Geruch",
  "Blutdruck",
  "Temperatur",
  "Gleichgewicht",
];

/**
 * Phase 3, Step 3.8 — Körpersignale. Non-pathologising (perception, not
 * symptoms): the known bodily signal spots go into phase3.somaticMarkers.
 * The suggestion chips take a term on click; the list below stays editable.
 * Soft step.
 */
export function Step8Koerpersignale({ nav }: { nav: PhaseNavigation }) {
  const somaticMarkers = useSessionStore(
    (s) => s.session?.phase3.somaticMarkers ?? [],
  );
  const patch = useSessionStore((s) => s.patch);

  function setSomaticMarkers(next: ResourceItem[]) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, somaticMarkers: next } }));
  }

  const isTaken = (chip: string) =>
    somaticMarkers.some((item) => item.text === chip);

  function takeChip(chip: string) {
    if (isTaken(chip)) return;
    setSomaticMarkers([
      ...somaticMarkers,
      { id: crypto.randomUUID(), text: chip },
    ]);
  }

  return (
    <div className="space-y-6">
      <p className="text-muted">{INTRO_CORE}</p>
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-accent">
          <ChevronDown
            className="size-3.5 motion-safe:transition-transform group-open:rotate-180"
            aria-hidden
          />
          Die ganze Anmoderation
        </summary>
        <p className="mt-1.5 text-sm text-muted">{INTRO_VOLLTEXT}</p>
      </details>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          Anregungen — tippe an, was du als Signalgeber kennst:
        </p>
        <div
          role="group"
          aria-label="Körpersignal-Anregungen"
          className="flex flex-wrap gap-1.5"
        >
          {BODY_CHIPS.map((chip) => {
            const taken = isTaken(chip);
            return (
              <button
                key={chip}
                type="button"
                disabled={taken}
                onClick={() => takeChip(chip)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  taken
                    ? "cursor-default border-accent/40 bg-accent/10 text-accent"
                    : "border-subtle bg-surface text-muted hover:text-foreground",
                )}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      <ResourceListEditor
        items={somaticMarkers}
        onItemsChange={setSomaticMarkers}
        addLabel="Körpersignal"
        placeholder="z. B. Druck im Nacken, wenn es eng wird"
        itemLabel="Körpersignal"
        emptyHint="Noch nichts erfasst."
        withPolarity
      />

      <NoPersonalDataHint />

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext
      />
    </div>
  );
}
