import { useState } from "react";

import { Button } from "@/components/ui/button";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import {
  coreThemeLabel,
  useCoreTheme,
} from "@/features/phases/phase2/useCoreTheme";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import { cn } from "@/lib/utils";

/** Brainstorming-Anmoderation (Methodik-Vorlage, wortgetreu). */
const INTRO =
  "Stell dir einmal vor, es würde dir mit deinem Thema und Anliegen, das du in Phase 1 beschrieben hast, richtig gut gehen — wie geht es dir dann? Wie fühlst du dich? Was ist dann anders? Was erlebst du? Welche Veränderungen nehmen andere an dir wahr? Beginne mit dem Gefühl, das du dann hast …";

/** Perspektivwechsel-Text (Methodik-Vorlage, wortgetreu — Teil der Anmoderation). */
const PERSPEKTIV_TEXT =
  "Nimm bitte bewusst eine neue Perspektive ein. Such dir einen Platz, an dem du dich wohlfühlst. Und stell dir vor – du weißt zwar nicht wie – aber deine Probleme aus der Ist-Situation wären verschwunden. Die Dinge haben sich zum Guten gewendet. Welches Gefühl stellt sich bei dir ein? Du kannst zunächst einfach frei assoziieren und dir in einer Art Brainstorming vorstellen, wie sich deine Situation geändert hat. Verschwende erst einmal gar keinen Gedanken an das Wie, beschreibe einfach den neuen, positiven Zustand.";

/** Liste positiver Gefühle (Methodik-Vorlage) — ohne Anspruch auf Vollständigkeit. */
const FEELINGS = [
  "Ausgeglichenheit",
  "Erleichterung",
  "Freude",
  "Gelassenheit",
  "Glück",
  "Hoffnung",
  "Leichtigkeit",
  "Lust",
  "Ruhe",
  "Selbstsicherheit",
  "Stolz",
  "Zufriedenheit",
  "Zuversicht",
];

/** Das stärkste Gefühl wählen — zwei sind auch ok (Methodik). */
const MAX_FEELINGS = 2;

/** Split the persisted gefuehl ("A und B") into its trimmed parts. */
function splitGefuehl(gefuehl: string): string[] {
  return gefuehl
    .split(" und ")
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Phase 2, Step 2.1 — Was strebe ich an? Two sections following the method:
 * (1) free brainstorming of the positive future state (phase2.vision, ungated),
 * (2) pulling out the feeling words — pick ONE positive feeling (two are ok,
 * max 2) from the list or a custom noun; the choice writes phase2.gefuehl
 * ("A und B" when two). Forward is gated on at least one feeling. No AI here.
 */
export function Step1Vision({ nav }: { nav: PhaseNavigation }) {
  const vision = useSessionStore((s) => s.session?.phase2.vision ?? "");
  const gefuehl = useSessionStore((s) => s.session?.phase2.gefuehl ?? "");
  const patch = useSessionStore((s) => s.patch);
  const core = useCoreTheme();

  // Mirror the persisted value back into the UI: list words become chips, the
  // rest is the custom entry (kept in local state so typing a list word does
  // not "jump" out of the input mid-edit).
  const parts = splitGefuehl(gefuehl);
  const chipParts = parts.filter((part) => FEELINGS.includes(part));
  const [custom, setCustom] = useState(() =>
    parts.filter((part) => !FEELINGS.includes(part)).join(" und "),
  );

  const count = chipParts.length + (custom.trim() ? 1 : 0);
  const canAddMore = count < MAX_FEELINGS;

  function setVision(value: string) {
    patch((s) => ({ ...s, phase2: { ...s.phase2, vision: value } }));
  }

  /** Persist the combined choice ("A und B" when two feelings). */
  function persistGefuehl(chips: string[], customValue: string) {
    const next = [...chips, customValue.trim()].filter(Boolean).join(" und ");
    patch((s) => ({ ...s, phase2: { ...s.phase2, gefuehl: next } }));
  }

  function toggleChip(feeling: string) {
    const isSelected = chipParts.includes(feeling);
    if (!isSelected && !canAddMore) return; // gesperrt bis eine Abwahl erfolgt
    const nextChips = isSelected
      ? chipParts.filter((part) => part !== feeling)
      : [...chipParts, feeling];
    persistGefuehl(nextChips, custom);
  }

  function changeCustom(value: string) {
    setCustom(value);
    persistGefuehl(chipParts, value);
  }

  // Exceptional: no core theme (gating should prevent this).
  if (!core) {
    return (
      <div>
        <div className="rounded-xl border border-subtle bg-surface-2 p-5">
          <p className="text-sm text-foreground">
            Für diese Phase fehlt dein Kernthema aus Phase 1. Geh kurz zurück
            und lege dort ein gewichtetes Cluster als Kernthema fest.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => nav.goToPhase(1)}
          >
            Zurück zu Phase 1
          </Button>
        </div>
      </div>
    );
  }

  const label = coreThemeLabel(core);
  const customLocked = !canAddMore && !custom.trim();

  return (
    <div>
      <div className="space-y-6">
        {/* C1 — Brainstorming des positiven Zukunftszustands */}
        <div className="rounded-lg border border-subtle bg-surface-2 px-3 py-2 text-sm">
          <span className="text-muted">Dein Kernthema aus Phase 1: </span>
          <span className="font-medium text-foreground">{label}</span>
        </div>

        <p className="text-muted">{INTRO}</p>

        {/* Perspektivwechsel — sichtbarer Teil der durchgehenden Anmoderation. */}
        <p className="text-muted">{PERSPEKTIV_TEXT}</p>

        <div className="space-y-2">
          <label
            htmlFor="phase2-vision"
            className="block text-sm font-medium text-foreground"
          >
            Dein Brainstorming
          </label>
          <textarea
            id="phase2-vision"
            value={vision}
            rows={8}
            onChange={(event) => setVision(event.target.value)}
            placeholder="Wenn alles gut läuft, dann …"
            className="w-full resize-y rounded-lg border border-subtle bg-surface px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <NoPersonalDataHint />
        </div>

        {/* C2 — Gefühlswörter herausziehen (Auswahl → phase2.gefuehl) */}
        <div className="space-y-4 border-t border-subtle pt-6">
          <p className="text-muted">
            Unterstreiche dann die{" "}
            <strong className="font-semibold text-foreground">
              Gefühlswörter
            </strong>
            . Denn zunächst geht es um das neue, positive Gefühl, das sich
            einstellt, wenn dein neuer Zustand eingetreten ist.
          </p>
          <p className="text-muted">
            Wenn du nach einem Wort suchst, das dein Gefühl am besten zum
            Ausdruck bringt, dann kannst du dir durch die Liste helfen lassen.
            Sie hat keinen Anspruch auf Vollständigkeit. Wenn du mehrere Gefühle
            in dir spürst, dann nimm das{" "}
            <strong className="font-semibold text-foreground">stärkste</strong>.{" "}
            <strong className="font-semibold text-foreground">
              2 Gefühle sind auch ok.
            </strong>
          </p>

          <div
            role="group"
            aria-label="Positive Gefühle (höchstens zwei wählen)"
            className="flex flex-wrap gap-2"
          >
            {FEELINGS.map((feeling) => {
              const selected = chipParts.includes(feeling);
              const locked = !selected && !canAddMore;
              return (
                <button
                  key={feeling}
                  type="button"
                  aria-pressed={selected}
                  disabled={locked}
                  onClick={() => toggleChip(feeling)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    selected
                      ? "border-accent bg-accent text-white"
                      : "border-subtle bg-surface text-muted hover:text-foreground",
                    locked && "cursor-not-allowed opacity-45 hover:text-muted",
                  )}
                >
                  {feeling}
                </button>
              );
            })}
          </div>
          <div className="max-w-sm space-y-1.5">
            <label
              htmlFor="phase2-custom-gefuehl"
              className="block text-sm font-medium text-foreground"
            >
              Eigenes Gefühl
            </label>
            <input
              id="phase2-custom-gefuehl"
              type="text"
              value={custom}
              disabled={customLocked}
              onChange={(event) => changeCustom(event.target.value)}
              placeholder="z. B. Klarheit"
              className={cn(
                "w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                customLocked && "cursor-not-allowed opacity-45",
              )}
            />
            <p className="text-xs text-faint">
              Als Substantiv — z. B. „Gelassenheit“ statt „gelassen“. Zählt mit
              in die Zwei-Gefühle-Grenze.
            </p>
          </div>

          {gefuehl.trim() ? (
            <div className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-sm">
              <span className="text-muted">Dein Zielgefühl: </span>
              <span className="font-medium text-foreground">
                {gefuehl.trim()}
              </span>
            </div>
          ) : (
            <p className="text-xs text-faint">
              „Weiter“ öffnet sich, sobald du mindestens ein Gefühl gewählt
              hast.
            </p>
          )}
        </div>
      </div>

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext={gefuehl.trim().length > 0}
      />
    </div>
  );
}
