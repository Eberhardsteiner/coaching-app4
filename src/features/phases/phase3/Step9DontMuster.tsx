import { ArrowRight, CircleOff, Plus, Trash2 } from "lucide-react";
import { Fragment, useState, type ReactNode } from "react";

import { InfoCallout } from "@/components/method/InfoCallout";
import { Button } from "@/components/ui/button";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { collectSortableResources } from "@/features/phases/phase3/resourceFields";
import { ResourceListEditor } from "@/features/phases/phase3/ResourceListEditor";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { DontPatternEntry, ResourceItem } from "@/features/session/types";
import { cn } from "@/lib/utils";

const NO_DONTS: DontPatternEntry[] = [];

/**
 * Anmoderation — sichtbar (VOICE-1, Methodik-Wortlaut), K1: drei Absätze;
 * der zweite trägt den vollständigen Methodik-Satz („… die du auf deinem
 * Ressourcenboard gesammelt hast … eine — deine — bestimmte wiederkehrende
 * Auswahl …", zuvor verkürzt).
 */
const INTRO_ABSAETZE: ReactNode[] = [
  "Dieser wichtige letzte Schritt der Ressourcenidentifikation macht dir klar, was du dazu beigetragen hast, dass du in deiner derzeitigen Lage steckst — und was du künftig vermeiden musst.",
  <>
    Aus den vielen Ressourcen, die du auf deinem Ressourcenboard gesammelt hast,
    trägt eine —{" "}
    <strong className="font-semibold text-foreground">deine</strong> — bestimmte
    wiederkehrende Auswahl dazu bei, dass du in diese Situation geraten bist.
    Identifiziere dieses Muster, damit du dein Verhalten künftig aus einer
    anderen Ressourcenkombination speist.
  </>,
  "Vor allem die hinderlichen Ressourcen spielen dabei eine tragende Rolle — sieh sie dir genau an.",
];

/** Giftschrank — sichtbar im Callout (VOICE-1). */
const GIFTSCHRANK_VOLLTEXT =
  "Damit weißt du, welche Ressourcenkombination auf dem Weg zu deinem Ziel in den ‚Giftschrank‘ gehört. Das bedeutet nicht, dass diese Ressourcen schlecht oder falsch sind — nur in dieser Kombination und in diesem Kontext führen sie dich immer wieder in die gleiche unerwünschte Situation.";

/**
 * Die zwei Einstiegs-Logiken (Methodik-Vorlage, wortgetreu). Der gewählte
 * Einstieg bestimmt die Reihenfolge/Nummerierung der Ketten-Felder (VIS-2):
 * `order` = Feld-Reihenfolge der Muster-Kette (die Erkenntnis steckt im
 * Wirkung/Erkenntnis-Feld der Kette).
 */
const LEITFOLGEN: {
  id: "ressourcen" | "verhalten";
  title: string;
  steps: string[];
  order: (keyof Omit<DontPatternEntry, "id">)[];
}[] = [
  {
    id: "ressourcen",
    title: "Einstieg über die Ressourcen",
    steps: [
      "Welche Ressourcen habe ich genutzt?",
      "Wie habe ich mich auf dieser Grundlage verhalten?",
      "Was hat das bei meinen systemischen Partnern bewirkt?",
      "Welche Erkenntnis gewinne ich daraus?",
    ],
    order: ["resources", "behavior", "effect"],
  },
  {
    id: "verhalten",
    title: "Einstieg über das Verhalten",
    steps: [
      "Wie habe ich mich verhalten?",
      "Welche Ressourcen habe ich dabei wohl genutzt?",
      "Was hat das bewirkt?",
      "Welche Erkenntnis gewinne ich daraus?",
    ],
    order: ["behavior", "resources", "effect"],
  },
];

const FIELDS: {
  key: keyof Omit<DontPatternEntry, "id">;
  label: string;
  placeholder: string;
}[] = [
  {
    key: "resources",
    label: "Ressource(n)",
    placeholder: "z. B. Gewissenhaftigkeit + Vorsicht",
  },
  {
    key: "behavior",
    label: "Gezeigtes Verhalten",
    placeholder: "z. B. alles selbst kontrollieren",
  },
  {
    key: "effect",
    label: "Wirkung / Erkenntnis",
    placeholder:
      "Was hat es bewirkt — und welche Erkenntnis gewinnst du daraus?",
  },
];

/**
 * Phase 3, Step 3.9 — Bisheriges Muster — Don't! (Folie 14). Structured
 * entries Ressource(n) | Verhalten | Wirkung → phase3.dontPattern. The area
 * uses the `ist` token — the ONE deliberate rosa exception in Phase 3: it IS
 * the IST pattern (marked rosa in the method template). Own hinderliche
 * resources are offered as chips; a chip click appends to the last entry's
 * resources field (creates an entry if none exists). Legacy pastPatterns
 * entries stay visible below, editable and deletable. Soft step.
 */
export function Step9DontMuster({ nav }: { nav: PhaseNavigation }) {
  const phase3 = useSessionStore((s) => s.session?.phase3);
  const dontPattern = useSessionStore(
    (s) => s.session?.phase3.dontPattern ?? NO_DONTS,
  );
  const pastPatterns = useSessionStore(
    (s) => s.session?.phase3.pastPatterns ?? [],
  );
  const patch = useSessionStore((s) => s.patch);
  // Gewählte Einstiegs-Logik — bestimmt die Reihenfolge der Ketten-Felder
  // (reine Darstellung, keine Daten: alle Felder schreiben dieselben Keys).
  const [entryLogic, setEntryLogic] = useState<"ressourcen" | "verhalten">(
    "ressourcen",
  );
  const activeFolge =
    LEITFOLGEN.find((f) => f.id === entryLogic) ?? LEITFOLGEN[0];
  const orderedFields = activeFolge.order.map(
    (key) => FIELDS.find((f) => f.key === key) as (typeof FIELDS)[number],
  );

  // Dedupe: the same text can be rated hinderlich in several fields (and the
  // harvest UI explicitly invites taking a term twice) — unique chips only.
  const hinderliche = phase3
    ? [
        ...new Set(
          collectSortableResources(phase3)
            .filter((entry) => entry.item.polarity === "hinderlich")
            .map((entry) => entry.item.text.trim())
            .filter(Boolean),
        ),
      ]
    : [];

  function setDontPattern(next: DontPatternEntry[]) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, dontPattern: next } }));
  }

  function setPastPatterns(next: ResourceItem[]) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, pastPatterns: next } }));
  }

  function addEntry(initial?: Partial<DontPatternEntry>) {
    setDontPattern([
      ...dontPattern,
      {
        id: crypto.randomUUID(),
        resources: "",
        behavior: "",
        effect: "",
        ...initial,
      },
    ]);
  }

  function updateEntry(id: string, partial: Partial<DontPatternEntry>) {
    setDontPattern(
      dontPattern.map((d) => (d.id === id ? { ...d, ...partial } : d)),
    );
  }

  function removeEntry(id: string) {
    setDontPattern(dontPattern.filter((d) => d.id !== id));
  }

  /** Chip → append to the last entry's resources (create one if needed). */
  function takeChip(text: string) {
    const last = dontPattern[dontPattern.length - 1];
    if (!last) {
      addEntry({ resources: text });
      return;
    }
    const current = last.resources.trim();
    updateEntry(last.id, {
      resources: current ? `${current}, ${text}` : text,
    });
  }

  return (
    <div className="space-y-6">
      {/* Anmoderation — sichtbar (VOICE-1), K1: drei Absätze. */}
      <div className="max-w-prose space-y-2 text-muted">
        {INTRO_ABSAETZE.map((absatz, index) => (
          <p key={index}>{absatz}</p>
        ))}
      </div>

      {/* K1: die zuvor fehlende Überleitung zur Einstiegswahl
          (Methodik-Wortlaut, verbindlich). */}
      <p className="max-w-prose text-muted">
        <strong className="font-semibold text-foreground">
          Du kannst entweder mit den Ressourcen oder mit deinem Verhalten
          beginnen.
        </strong>{" "}
        Wichtig ist nur, dass du auf alle Bereiche blickst.{" "}
        <strong className="font-semibold text-foreground">
          Folge dieser Logik:
        </strong>
      </p>

      {/* Zwei Einstiegs-Logiken — zum Antippen; die Wahl bestimmt die
          Reihenfolge der Ketten-Felder (VIS-2). */}
      <div
        role="group"
        aria-label="Einstieg wählen"
        className="grid gap-3 sm:grid-cols-2"
      >
        {LEITFOLGEN.map((folge) => {
          const active = folge.id === entryLogic;
          return (
            <button
              key={folge.id}
              type="button"
              aria-pressed={active}
              onClick={() => setEntryLogic(folge.id)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                active
                  ? "border-accent bg-accent/5"
                  : "border-subtle bg-surface hover:bg-surface-2",
              )}
            >
              <p
                className={cn(
                  "text-xs font-medium uppercase tracking-wide",
                  active ? "text-accent" : "text-faint",
                )}
              >
                {folge.title}
              </p>
              <ol className="mt-2 space-y-1 text-sm text-muted">
                {folge.steps.map((step, index) => (
                  <li key={step}>
                    {index + 1}. {step}
                  </li>
                ))}
              </ol>
            </button>
          );
        })}
      </div>

      {/* Zone 3 (K2): die Muster-Kette — die eine bewusste ist-Token-Ausnahme
          der Phase 3, mit großzügigem Abstand zwischen den Einträgen. */}
      <div className="space-y-5 rounded-xl border border-ist/40 bg-ist/5 p-4">
        <h3 className="text-sm font-semibold text-ist">
          Bisheriges Muster — Don’t!
        </h3>

        {dontPattern.map((entry, index) => (
          <div
            key={entry.id}
            className="space-y-3 rounded-lg border border-ist/30 bg-background/60 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-faint">
                Muster {index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                aria-label={`Muster ${index + 1} löschen`}
                title="Löschen"
                className="flex size-7 shrink-0 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            {/* Die Muster-Kette: nummerierte, verbundene Felder in der
                Reihenfolge des gewählten Einstiegs (VIS-2). */}
            <div className="flex flex-col gap-3">
              {orderedFields.map((field, index) => (
                <Fragment key={field.key}>
                  {index > 0 ? (
                    <ArrowRight
                      className="mx-auto size-4 shrink-0 rotate-90 self-center text-ist/50"
                      aria-hidden
                    />
                  ) : null}
                  <div className="min-w-0 flex-1 space-y-1">
                    <label
                      htmlFor={`dont-${field.key}-${entry.id}`}
                      className="flex items-center gap-1.5 text-xs font-medium text-foreground"
                    >
                      <span
                        aria-hidden
                        className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-ist/10 text-[0.65rem] font-semibold text-ist"
                      >
                        {index + 1}
                      </span>
                      {field.label}
                    </label>
                    <textarea
                      id={`dont-${field.key}-${entry.id}`}
                      value={entry[field.key]}
                      rows={2}
                      onChange={(event) =>
                        updateEntry(entry.id, {
                          [field.key]: event.target.value,
                        })
                      }
                      placeholder={field.placeholder}
                      className="w-full resize-y rounded-lg border border-subtle bg-surface px-2.5 py-1.5 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    />
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={() => addEntry()}>
          <Plus />
          Muster
        </Button>
      </div>

      {/* Zone 4 (K2): Hilfszeile — hinderliche Ressourcen zum Übernehmen. */}
      {hinderliche.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-faint">
            Zum Übernehmen: deine hinderlichen Ressourcen
          </p>
          <div
            role="group"
            aria-label="Hinderliche Ressourcen übernehmen"
            className="flex flex-wrap gap-1.5"
          >
            {hinderliche.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => takeChip(text)}
                className="rounded-full border border-amber-600/40 bg-amber-50 px-2.5 py-1 text-xs text-amber-900 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {text}
              </button>
            ))}
          </div>
          <p className="text-sm text-faint">
            Tippe an — der Wert wandert ins Ressourcen-Feld deines letzten
            Musters.
          </p>
        </div>
      ) : null}

      {/* Zone 5: Giftschrank als Callout im ist-Ton — Volltext sichtbar (VOICE-1). */}
      <InfoCallout
        icon={<CircleOff className="size-4" />}
        title="Der Giftschrank"
        tone="ist"
      >
        {GIFTSCHRANK_VOLLTEXT}
      </InfoCallout>

      {/* Legacy pastPatterns — nothing is thrown away. */}
      {pastPatterns.length > 0 ? (
        <div className="space-y-2 border-t border-subtle pt-5">
          <p className="text-sm font-medium text-foreground">Frühere Notizen</p>
          <p className="text-sm text-muted">
            Diese Einträge stammen aus einer früheren Bearbeitung („was du so
            nicht mehr tun willst“). Du kannst sie weiter bearbeiten, in die
            Muster oben überführen oder löschen.
          </p>
          <ResourceListEditor
            items={pastPatterns}
            onItemsChange={setPastPatterns}
            addLabel="Notiz"
            itemLabel="Notiz"
          />
        </div>
      ) : null}

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
