import { useState } from "react";

import { SunSymbol } from "@/components/icons/PhaseSymbols";
import { InfoCallout } from "@/components/method/InfoCallout";
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

/** Die Fragen der Brainstorming-Anmoderation (Methodik-Vorlage, wortgetreu). */
const INTRO_FRAGEN = [
  "wie geht es dir dann?",
  "Wie fühlst du dich?",
  "Was ist dann anders?",
  "Was erlebst du?",
  "Welche Veränderungen nehmen andere an dir wahr?",
];

/**
 * Perspektivwechsel-Text (Methodik-Vorlage, wortgetreu — Teil der
 * Anmoderation), K1: in drei Sinnabsätze gesetzt.
 */
const PERSPEKTIV_ABSAETZE = [
  "Nimm bitte bewusst eine neue Perspektive ein. Such dir einen Platz, an dem du dich wohlfühlst.",
  "Und stell dir vor – du weißt zwar nicht wie – aber deine Probleme aus der Ist-Situation wären verschwunden. Die Dinge haben sich zum Guten gewendet. Welches Gefühl stellt sich bei dir ein?",
  "Du kannst zunächst einfach frei assoziieren und dir in einer Art Brainstorming vorstellen, wie sich deine Situation geändert hat. Verschwende erst einmal gar keinen Gedanken an das Wie, beschreibe einfach den neuen, positiven Zustand.",
];

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

  /**
   * P4: ein Wort im Brainstorming-Text an-/abtippen. Listen-Wörter laufen
   * über die Chip-Auswahl, freie Wörter über das Eigene-Gefühl-Feld — die
   * Zwei-Gefühle-Grenze gilt unverändert.
   */
  function toggleTextWord(word: string) {
    const listMatch = FEELINGS.find(
      (feeling) => feeling.toLowerCase() === word.toLowerCase(),
    );
    if (listMatch) {
      toggleChip(listMatch);
      return;
    }
    const isCurrentCustom = custom.trim().toLowerCase() === word.toLowerCase();
    if (isCurrentCustom) {
      changeCustom("");
      return;
    }
    // Neues freies Wort: belegt den Eigenes-Gefühl-Platz (ersetzt dessen
    // Inhalt); gesperrt nur, wenn beide Plätze durch Chips belegt sind.
    if (chipParts.length >= MAX_FEELINGS) return;
    changeCustom(word);
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

        {/* K1: Fragenreihe als Bullet-Liste, Gefühls-Aufforderung als
            hervorgehobene Abschluss-Zeile — Wortlaut unverändert. */}
        <div className="max-w-prose space-y-2 text-muted">
          <p>
            Stell dir einmal vor, es würde dir mit deinem Thema und Anliegen,
            das du in Phase 1 beschrieben hast, richtig gut gehen —
          </p>
          <ul className="ml-4 list-disc space-y-1">
            {INTRO_FRAGEN.map((frage) => (
              <li key={frage}>{frage}</li>
            ))}
          </ul>
          <p className="font-medium text-foreground">
            Beginne mit dem Gefühl, das du dann hast …
          </p>
        </div>

        {/* Perspektivwechsel — die ganze Übung SICHTBAR im Callout
            (VOICE-1: Anmoderationen sind nie zugeklappt). */}
        <InfoCallout
          icon={<SunSymbol className="size-5" />}
          title="Neue Perspektive einnehmen"
        >
          <div className="space-y-2">
            {PERSPEKTIV_ABSAETZE.map((absatz) => (
              <p key={absatz}>{absatz}</p>
            ))}
          </div>
        </InfoCallout>

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
          {/* P4: Anleitung passt zur Bedienung — Wörter sind antippbar. */}
          <p className="text-muted">
            Tippe die{" "}
            <strong className="font-semibold text-foreground">
              Gefühlswörter
            </strong>{" "}
            in deinem Text an — sie werden unterstrichen und als dein Zielgefühl
            übernommen. Denn zunächst geht es um das neue, positive Gefühl, das
            sich einstellt, wenn dein neuer Zustand eingetreten ist.
          </p>

          {/* P4: der eingegebene Text, Wort für Wort antippbar. */}
          {vision.trim() ? (
            <div className="rounded-xl border border-subtle bg-surface p-4">
              <p className="text-sm font-medium text-foreground">
                Dein Text — tippe die Gefühlswörter an:
              </p>
              <p className="mt-2 leading-relaxed text-muted">
                {vision.split(/(\s+)/).map((token, index) => {
                  const cleaned = token.replace(
                    /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,
                    "",
                  );
                  if (!cleaned || /^\s*$/.test(token)) {
                    return <span key={index}>{token}</span>;
                  }
                  const marked = parts.some(
                    (part) => part.toLowerCase() === cleaned.toLowerCase(),
                  );
                  return (
                    <button
                      key={index}
                      type="button"
                      aria-pressed={marked}
                      onClick={() => toggleTextWord(cleaned)}
                      className={cn(
                        "rounded px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        marked
                          ? "font-medium text-foreground underline decoration-accent decoration-2 underline-offset-4"
                          : "hover:bg-accent/10 hover:text-foreground",
                      )}
                    >
                      {token}
                    </button>
                  );
                })}
              </p>
            </div>
          ) : null}
          {/* K1: drei kurze Zeilen — Liste hilft · kein Anspruch auf
              Vollständigkeit · das stärkste; 2 sind ok. */}
          <div className="max-w-prose space-y-1 text-muted">
            <p>
              Wenn du nach einem Wort suchst, das dein Gefühl am besten zum
              Ausdruck bringt, dann kannst du dir durch die Liste helfen lassen.
            </p>
            <p>Sie hat keinen Anspruch auf Vollständigkeit.</p>
            <p>
              Wenn du mehrere Gefühle in dir spürst, dann nimm das{" "}
              <strong className="font-semibold text-foreground">
                stärkste
              </strong>
              .{" "}
              <strong className="font-semibold text-foreground">
                2 Gefühle sind auch ok.
              </strong>
            </p>
          </div>

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
            <p className="text-sm text-faint">
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
            <p className="text-sm text-faint">
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
