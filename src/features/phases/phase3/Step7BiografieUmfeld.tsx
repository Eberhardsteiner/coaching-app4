import { NotebookPen, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { requestDrawer } from "@/components/layout/drawerBus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { PolarityToggle } from "@/features/phases/phase3/ResourceHarvest";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { ResourceItem } from "@/features/session/types";

/**
 * Sections of this step, all writing into ONE field (phase3.experiential)
 * distinguished via `category` (additive convention, no schema bump):
 * the template's three reflection anchors for mastered experiences —
 * "erfahrung" (In meinem Inneren?, legacy entries without a category land
 * here), "erfahrung-aussen" (Von außen?), "ableitung" (Was leite ich daraus
 * ab?, an insight — no polarity) — plus the outer resources of the
 * surroundings ("aussen").
 */
type SectionCategory =
  | "erfahrung"
  | "erfahrung-aussen"
  | "ableitung"
  | "aussen";

const ANKER: {
  category: Exclude<SectionCategory, "aussen">;
  title: string;
  placeholder: string;
  withPolarity: boolean;
}[] = [
  {
    category: "erfahrung",
    title: "In meinem Inneren?",
    placeholder: "z. B. Geduld, die mir damals geholfen hat",
    withPolarity: true,
  },
  {
    category: "erfahrung-aussen",
    title: "Von außen?",
    placeholder: "z. B. der Rückhalt einer Kollegin damals",
    withPolarity: true,
  },
  {
    category: "ableitung",
    title: "Was leite ich daraus ab?",
    placeholder: "z. B. Ich bewältige so etwas, wenn ich früh um Rat frage",
    withPolarity: false,
  },
];

/**
 * Phase 3, Step 3.7 — Biografie & Umfeld (MP3-REV). The experience reflection
 * follows the template's three anchors (In meinem Inneren? / Von außen? / Was
 * leite ich daraus ab?) on the guiding question "Habe ich Ähnliches
 * gemeistert — wer oder was hat geholfen?", plus the outer resources of the
 * surroundings. Entries can be rated förderlich/hinderlich in place (the
 * Ableitung anchor is an insight — no rating). Soft step.
 */
export function Step7BiografieUmfeld({ nav }: { nav: PhaseNavigation }) {
  const experiential = useSessionStore(
    (s) => s.session?.phase3.experiential ?? [],
  );
  const patch = useSessionStore((s) => s.patch);
  const [drafts, setDrafts] = useState<Record<SectionCategory, string>>({
    erfahrung: "",
    "erfahrung-aussen": "",
    ableitung: "",
    aussen: "",
  });

  function setExperiential(next: ResourceItem[]) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, experiential: next } }));
  }

  const ofSection = (category: SectionCategory) =>
    category === "erfahrung"
      ? // Legacy entries without a category belong to the first anchor.
        experiential.filter((i) => !i.category || i.category === "erfahrung")
      : experiential.filter((i) => i.category === category);

  function addDraft(category: SectionCategory) {
    const text = drafts[category].trim();
    if (!text) return;
    setExperiential([
      ...experiential,
      { id: crypto.randomUUID(), text, category },
    ]);
    setDrafts((d) => ({ ...d, [category]: "" }));
  }

  function setPolarity(
    id: string,
    polarity: "foerderlich" | "hinderlich" | undefined,
  ) {
    setExperiential(
      experiential.map((i) => (i.id === id ? { ...i, polarity } : i)),
    );
  }

  function remove(id: string) {
    setExperiential(experiential.filter((i) => i.id !== id));
  }

  /** One compact entry list + add input for a section. */
  function renderSection(
    category: SectionCategory,
    placeholder: string,
    withPolarity: boolean,
    ariaLabel: string,
  ) {
    const entries = ofSection(category);
    return (
      <div className="space-y-1.5">
        <ul className="space-y-1.5">
          {entries.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-2 rounded-lg border border-subtle bg-background px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              {/* P10/P8a: Text horizontal lesbar, Wertung daneben/darunter. */}
              <span className="min-w-0 break-words text-base text-foreground">
                {item.text || "—"}
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                {withPolarity ? (
                  <PolarityToggle
                    value={item.polarity}
                    onChange={(next) => setPolarity(item.id, next)}
                    helpLabel="förderlich"
                    hinderLabel="hinderlich"
                    ariaContext={`„${item.text || "Eintrag"}“`}
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={`„${item.text || "Eintrag"}“ entfernen`}
                  title="Entfernen"
                  className="flex size-7 shrink-0 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Trash2 className="size-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Input
            value={drafts[category]}
            aria-label={ariaLabel}
            onChange={(event) =>
              setDrafts((d) => ({ ...d, [category]: event.target.value }))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addDraft(category);
              }
            }}
            placeholder={placeholder}
            className="min-w-0 flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => addDraft(category)}
          >
            <Plus />
            Hinzufügen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Erfahrungen — die drei Reflexionsanker der Vorlage */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Erfahrungen</h3>
        <p className="text-muted">
          Möglicherweise hast du in der Vergangenheit Situationen gemeistert,
          die Ähnlichkeiten mit deiner derzeitigen Situation aufweisen. Wer oder
          was hat dir damals geholfen? Geh die drei Fragen durch und schreibe
          auf.
        </p>
        {/* P10: die drei Boxen ÜBEREINANDER in voller Breite (G1). */}
        <div className="grid grid-cols-1 gap-4">
          {ANKER.map((anker) => (
            <section
              key={anker.category}
              aria-label={anker.title}
              className="space-y-2 rounded-xl border border-subtle bg-surface p-4"
            >
              <h4 className="text-base font-medium text-foreground">
                {anker.title}
              </h4>
              {renderSection(
                anker.category,
                anker.placeholder,
                anker.withPolarity,
                `${anker.title} — Eintrag ergänzen`,
              )}
            </section>
          ))}
        </div>
      </div>

      {/* Äußere Ressourcen im Umfeld */}
      <div className="space-y-3 border-t border-subtle pt-6">
        <h3 className="text-sm font-semibold text-foreground">
          Äußere Ressourcen
        </h3>
        <p className="text-muted">
          Sieh dich in deinem Umfeld um: Gibt es äußere Ressourcen, die dir
          helfen können, dein Ziel zu erreichen? Von materiellen Ressourcen über
          Unternehmensunterlagen wie Prozessbeschreibungen oder Leitbilder bis
          zu anderen Menschen mit hilfreichen Fähigkeiten ist alles möglich.
          Bitte schreibe auf.
        </p>
        {renderSection(
          "aussen",
          "z. B. ein Leitbild, eine Prozessbeschreibung",
          true,
          "Äußere Ressourcen ergänzen",
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-subtle bg-surface-2 px-3 py-2">
        <p className="text-sm text-muted">
          Hast du daraus weitere Erkenntnisse? Notiere sie auf deinem
          Erkenntnisboard (Notizbuch rechts).
        </p>
        {/* K2: Direkt-Öffnen-Link zur Erkenntnisboard-Schublade. */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => requestDrawer("notebook")}
        >
          <NotebookPen />
          Erkenntnisboard öffnen
        </Button>
      </div>

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
