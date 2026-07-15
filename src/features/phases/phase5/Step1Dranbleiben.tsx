import {
  CalendarDays,
  Check,
  Eye,
  HeartHandshake,
  HeartPulse,
  Plus,
  Sparkles,
  Trash2,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { FlagSymbol } from "@/components/icons/PhaseSymbols";
import { InfoCallout } from "@/components/method/InfoCallout";
import { Button } from "@/components/ui/button";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { collectSortableResources } from "@/features/phases/phase3/resourceFields";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { ResourceItem, Strategy } from "@/features/session/types";
import { cn } from "@/lib/utils";

/**
 * Beispiel-Anregungen (Methodik-Vorlage; Nr. 6 variiert je Zweig) — je Karte
 * ein kleines Symbol (VIS-2: Auge · Mensch · Kalender · Stern · Körper ·
 * Coach).
 */
function buildSuggestions(
  coached: boolean,
): { icon: LucideIcon; text: string }[] {
  return [
    {
      icon: Eye,
      text: "Eine Visualisierung deines Ziels, die du sehr häufig siehst",
    },
    {
      icon: UserRound,
      text: "Ein vertrauter Mensch, mit dem du deine Absichten teilst",
    },
    {
      icon: CalendarDays,
      text: "Eine Eintragung deiner Maßnahmen in deinen Kalender",
    },
    { icon: Sparkles, text: "Deine Erfolge feiern" },
    {
      icon: HeartPulse,
      text: "Deine Körpersignale als Rückmeldeinstrument über dein Wohlbefinden",
    },
    {
      icon: HeartHandshake,
      text: coached
        ? "Ein Follow-up mit deinem Coach auf der halben Zeitstrecke zu deinem Ziel"
        : "Ein Follow-up mit einem Coach auf der halben Zeitstrecke zu deinem Ziel",
    },
  ];
}

/** The suggestion that gets the somatic-marker extra line (index 4). */
const BODY_SUGGESTION_INDEX = 4;

/**
 * Phase 5, Step 5.1 — Dranbleiben. Per resource a concrete "stay-on-track"
 * strategy (→ phase5.strategies), rendered as the template's two-column table
 * "Eingesetzte Ressource | Konkrete Strategien" (MP5-REV): visible column
 * headers on md+, one row per strategy with resource left / strategy right;
 * on narrow screens the row stacks with per-field mini labels (headers
 * hidden, labels md:sr-only — screen readers always get the field labels).
 * The method's six example suggestions are one click away: taking one creates
 * a strategy row with prefilled concreteStrategy and focus in the empty
 * resource field; taken suggestions are marked (duplicate guard by text). The
 * resource field offers the förderliche / Phase-4-used resources as
 * suggestions (datalist) but stores the readable **text** in
 * `Strategy.resource` (good for the later summary/PDF). No AI here.
 */
export function Step1Dranbleiben({ nav }: { nav: PhaseNavigation }) {
  const strategies = useSessionStore((s) => s.session?.phase5.strategies ?? []);
  const plans = useSessionStore((s) => s.session?.phase4.plans ?? []);
  const phase3 = useSessionStore((s) => s.session?.phase3);
  const coached = useSessionStore((s) => s.session?.meta.branch === "coached");
  const patch = useSessionStore((s) => s.patch);
  const [focusId, setFocusId] = useState<string | null>(null);

  // Suggested resource texts: Phase-4-used first, then remaining förderliche.
  const resById = new Map<string, ResourceItem>(
    phase3
      ? collectSortableResources(phase3).map((e) => [e.item.id, e.item])
      : [],
  );
  const usedTexts = plans
    .flatMap((p) => p.resourcesUsed)
    .map((id) => resById.get(id)?.text)
    .filter((t): t is string => Boolean(t && t.trim()));
  const foerderlicheTexts = phase3
    ? collectSortableResources(phase3)
        .filter((e) => e.item.polarity === "foerderlich")
        .map((e) => e.item.text)
        .filter((t) => t.trim())
    : [];
  const suggestions = [...new Set([...usedTexts, ...foerderlicheTexts])];

  function setStrategies(next: Strategy[]) {
    patch((s) => ({ ...s, phase5: { ...s.phase5, strategies: next } }));
  }

  function addStrategy() {
    const strategy: Strategy = {
      id: crypto.randomUUID(),
      resource: "",
      concreteStrategy: "",
    };
    setFocusId(strategy.id);
    setStrategies([...strategies, strategy]);
  }

  const suggestions_ = buildSuggestions(coached);
  const isTakenSuggestion = (text: string) =>
    strategies.some((s) => s.concreteStrategy === text);

  /** Take a suggestion: new row with prefilled strategy, focus the resource. */
  function takeSuggestion(text: string) {
    if (isTakenSuggestion(text)) return;
    const strategy: Strategy = {
      id: crypto.randomUUID(),
      resource: "",
      concreteStrategy: text,
    };
    setFocusId(strategy.id);
    setStrategies([...strategies, strategy]);
  }

  const bodyMarkers = (phase3?.somaticMarkers ?? [])
    .map((m) => m.text.trim())
    .filter(Boolean);

  function updateStrategy(id: string, partial: Partial<Strategy>) {
    setStrategies(
      strategies.map((s) => (s.id === id ? { ...s, ...partial } : s)),
    );
  }

  function deleteStrategy(id: string) {
    setStrategies(strategies.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-5">
      <p className="text-muted">
        Bitte überlege dir einmal: Wer oder was kann dich beim Umsetzen deines
        Plans unterstützen? Trage die Punkte, die dir einfallen, mit den
        zugehörigen Ressourcen ein.
      </p>

      {/* Beispiel-Anregungen — ein Klick legt eine Strategien-Zeile an. */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          Anregungen — tippe an, was zu dir passt:
        </p>
        <div
          role="group"
          aria-label="Beispiel-Anregungen übernehmen"
          className="grid gap-2 sm:grid-cols-2"
        >
          {suggestions_.map((suggestion, index) => {
            const taken = isTakenSuggestion(suggestion.text);
            const Icon = suggestion.icon;
            return (
              <button
                key={suggestion.text}
                type="button"
                disabled={taken}
                onClick={() => takeSuggestion(suggestion.text)}
                className={cn(
                  "flex items-start gap-2 rounded-lg border p-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  taken
                    ? "cursor-default border-accent/40 bg-accent/10 text-muted"
                    : "border-subtle bg-surface text-foreground hover:bg-surface-2",
                )}
              >
                {taken ? (
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                ) : (
                  <Plus className="mt-0.5 size-4 shrink-0 text-accent" />
                )}
                <span className="min-w-0">
                  <span className="flex items-start gap-1.5">
                    <Icon
                      className="mt-0.5 size-4 shrink-0 text-muted"
                      aria-hidden
                    />
                    <span>{suggestion.text}</span>
                  </span>
                  {index === BODY_SUGGESTION_INDEX && bodyMarkers.length > 0 ? (
                    <span className="mt-1.5 flex flex-wrap items-center gap-1">
                      <span className="text-xs text-faint">
                        Deine Signalgeber:
                      </span>
                      {bodyMarkers.map((marker) => (
                        <span
                          key={marker}
                          className="rounded-full border border-subtle bg-surface-2 px-2 py-0.5 text-xs text-muted"
                        >
                          {marker}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {strategies.length === 0 ? (
        <p className="text-xs text-faint">
          Noch keine Strategie angelegt — leg eine erste an.
        </p>
      ) : null}

      <div className="space-y-4">
        {strategies.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-subtle bg-surface">
            {/* Spaltenüberschriften des Arbeitsblatts — nur breite Screens;
                Screenreader bekommen die Labels je Feld. */}
            <div
              aria-hidden
              className="hidden gap-3 border-b border-subtle bg-surface-2 px-3 py-2 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_2rem]"
            >
              <p className="text-sm font-medium text-foreground">
                Eingesetzte Ressource
              </p>
              <p className="text-sm font-medium text-foreground">
                Konkrete Strategien
              </p>
              <span />
            </div>

            {strategies.map((strategy, index) => (
              <div
                key={strategy.id}
                className="gap-3 border-b border-subtle p-3 last:border-b-0 max-md:space-y-3 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_2rem] md:items-start"
              >
                <div className="space-y-1.5">
                  <label
                    htmlFor={`strategy-res-${strategy.id}`}
                    className="block text-sm font-medium text-foreground md:sr-only"
                  >
                    Ressource
                  </label>
                  <input
                    id={`strategy-res-${strategy.id}`}
                    type="text"
                    list="phase5-resource-suggestions"
                    autoFocus={strategy.id === focusId}
                    value={strategy.resource}
                    onChange={(event) =>
                      updateStrategy(strategy.id, {
                        resource: event.target.value,
                      })
                    }
                    placeholder="z. B. Freiheit"
                    className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor={`strategy-how-${strategy.id}`}
                    className="block text-sm font-medium text-foreground md:sr-only"
                  >
                    Strategie
                  </label>
                  <textarea
                    id={`strategy-how-${strategy.id}`}
                    value={strategy.concreteStrategy}
                    rows={2}
                    onChange={(event) =>
                      updateStrategy(strategy.id, {
                        concreteStrategy: event.target.value,
                      })
                    }
                    placeholder="Wie nutzt du diese Ressource konkret weiter, und woran prüfst du, ob es wirkt?"
                    className="w-full resize-y rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => deleteStrategy(strategy.id)}
                  aria-label={`Strategie ${index + 1} löschen`}
                  title="Löschen"
                  className="flex size-8 shrink-0 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent max-md:ml-auto"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <datalist id="phase5-resource-suggestions">
          {suggestions.map((text) => (
            <option key={text} value={text} />
          ))}
        </datalist>

        <Button variant="outline" size="sm" onClick={addStrategy}>
          <Plus />
          Strategie
        </Button>
      </div>

      {/* Kurs-Hinweis als Callout mit Fahnen-Symbol (Baukasten). */}
      <InfoCallout
        icon={<FlagSymbol className="size-5" />}
        title="Dranbleiben"
        tone="neutral"
      >
        Wenn du vom Kurs abkommst, nutze deine Ressourcen einfach erneut.
      </InfoCallout>

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
