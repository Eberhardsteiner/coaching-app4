import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { PolarityToggle } from "@/features/phases/phase3/ResourceHarvest";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { ResourceItem } from "@/features/session/types";

type ExperienceCategory = "erfahrung" | "aussen";

const SECTIONS: {
  category: ExperienceCategory;
  title: string;
  guide: string;
  placeholder: string;
}[] = [
  {
    category: "erfahrung",
    title: "Erfahrungen",
    guide:
      "Möglicherweise hast du in der Vergangenheit Situationen gemeistert, die Ähnlichkeiten mit deiner derzeitigen Situation aufweisen. Wer oder was hat dir damals geholfen? Fällt dir eine Erfahrung ein, die dir helfen kann — in deinem Inneren? Von außen? Bitte schreibe auf.",
    placeholder: "z. B. Erfahrung aus einem früheren Projekt",
  },
  {
    category: "aussen",
    title: "Äußere Ressourcen",
    guide:
      "Sieh dich in deinem Umfeld um: Gibt es äußere Ressourcen, die dir helfen können, dein Ziel zu erreichen? Von materiellen Ressourcen über Unternehmensunterlagen wie Prozessbeschreibungen oder Leitbilder bis zu anderen Menschen mit hilfreichen Fähigkeiten ist alles möglich. Bitte schreibe auf.",
    placeholder: "z. B. ein Leitbild, eine Prozessbeschreibung",
  },
];

/**
 * Phase 3, Step 3.7 — Biografie & Umfeld. Two collection areas writing into
 * ONE field (phase3.experiential) distinguished via `category` "erfahrung" |
 * "aussen" (pragmatic MP3 convention; legacy entries without a category show
 * under Erfahrungen). Each entry can be rated förderlich/hinderlich in place
 * (default open). The old "so nicht mehr" list moved to step 3.9. Soft step.
 */
export function Step7BiografieUmfeld({ nav }: { nav: PhaseNavigation }) {
  const experiential = useSessionStore(
    (s) => s.session?.phase3.experiential ?? [],
  );
  const patch = useSessionStore((s) => s.patch);
  const [drafts, setDrafts] = useState<Record<ExperienceCategory, string>>({
    erfahrung: "",
    aussen: "",
  });

  function setExperiential(next: ResourceItem[]) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, experiential: next } }));
  }

  const ofSection = (category: ExperienceCategory) =>
    category === "erfahrung"
      ? experiential.filter((i) => i.category !== "aussen")
      : experiential.filter((i) => i.category === "aussen");

  function addDraft(category: ExperienceCategory) {
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

  return (
    <div className="space-y-6">
      {SECTIONS.map((section, index) => {
        const entries = ofSection(section.category);
        return (
          <div
            key={section.category}
            className={
              index > 0 ? "space-y-3 border-t border-subtle pt-6" : "space-y-3"
            }
          >
            <h3 className="text-sm font-semibold text-foreground">
              {section.title}
            </h3>
            <p className="text-muted">{section.guide}</p>
            <ul className="space-y-1.5">
              {entries.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 rounded-lg border border-subtle bg-surface px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="min-w-0 text-sm text-foreground">
                    {item.text || "—"}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <PolarityToggle
                      value={item.polarity}
                      onChange={(next) => setPolarity(item.id, next)}
                      helpLabel="förderlich"
                      hinderLabel="hinderlich"
                      ariaContext={`„${item.text || "Eintrag"}“`}
                    />
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
            <div className="flex max-w-md items-center gap-2">
              <input
                type="text"
                value={drafts[section.category]}
                aria-label={`${section.title} ergänzen`}
                onChange={(event) =>
                  setDrafts((d) => ({
                    ...d,
                    [section.category]: event.target.value,
                  }))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addDraft(section.category);
                  }
                }}
                placeholder={section.placeholder}
                className="min-w-0 flex-1 rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => addDraft(section.category)}
              >
                <Plus />
                Hinzufügen
              </Button>
            </div>
          </div>
        );
      })}

      <p className="rounded-lg border border-subtle bg-surface-2 px-3 py-2 text-sm text-muted">
        Hast du daraus weitere Erkenntnisse? Notiere sie auf deinem
        Erkenntnisboard (Notizbuch rechts).
      </p>

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
