import { ChevronDown } from "lucide-react";

import { SunSymbol } from "@/components/icons/PhaseSymbols";
import { InfoCallout } from "@/components/method/InfoCallout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { withBausteine } from "@/features/phases/phase2/zielsatz";
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
 * Phase 2, Step 2.1 — Was strebe ich an? Brainstorming des positiven
 * Zukunftszustands (phase2.vision), danach D3 in zwei Stufen: (1) die
 * Gefühlswörter aus dem Text herausschreiben (phase2.gefuehlWoerter),
 * (2) das eine Gefühl benennen, das du fühlen willst (phase2.gefuehl, belegt
 * den Zielsatz in 2.2 vor). Die Gefühlsliste ist eingeklappt und nur für den
 * Fall gedacht, dass nichts einfällt; ein Klick setzt das Gefühl in Stufe 2
 * ein (höchstens zwei). D1: kein Kernthema-Kasten mehr, der Nutzer soll nicht
 * vorgeprägt werden. Keine Pflichteingabe.
 */
export function Step1Vision({ nav }: { nav: PhaseNavigation }) {
  const vision = useSessionStore((s) => s.session?.phase2.vision ?? "");
  const gefuehl = useSessionStore((s) => s.session?.phase2.gefuehl ?? "");
  const gefuehlWoerter = useSessionStore(
    (s) => s.session?.phase2.gefuehlWoerter ?? "",
  );
  const patch = useSessionStore((s) => s.patch);

  const parts = splitGefuehl(gefuehl);
  const canAddMore = parts.length < MAX_FEELINGS;

  function setVision(value: string) {
    patch((s) => ({ ...s, phase2: { ...s.phase2, vision: value } }));
  }

  function setGefuehlWoerter(value: string) {
    patch((s) => ({ ...s, phase2: { ...s.phase2, gefuehlWoerter: value } }));
  }

  /** Stufe 2: das Gefühl setzen und den Zielsatz mitziehen (D3/D4). */
  function setGefuehl(value: string) {
    patch((s) => ({
      ...s,
      phase2: withBausteine(s.phase2, { gefuehl: value }),
    }));
  }

  /** Listen-Klick: Gefühl in Stufe 2 einsetzen oder wieder herausnehmen. */
  function toggleFeeling(feeling: string) {
    if (parts.includes(feeling)) {
      setGefuehl(parts.filter((part) => part !== feeling).join(" und "));
      return;
    }
    if (!canAddMore) return;
    setGefuehl([...parts, feeling].join(" und "));
  }

  return (
    <div>
      <div className="space-y-6">
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
          <Textarea
            id="phase2-vision"
            value={vision}
            rows={8}
            onChange={(event) => setVision(event.target.value)}
            placeholder="Wenn alles gut läuft, dann …"
          />
          <NoPersonalDataHint />
        </div>

        {/* D3: die Gefühle in zwei Stufen herausarbeiten. */}
        <div className="space-y-5 border-t border-subtle pt-6">
          <p className="max-w-prose text-muted">
            Denn zunächst geht es um das neue, positive Gefühl, das sich
            einstellt, wenn dein neuer Zustand eingetreten ist.
          </p>

          {/* Stufe 1 */}
          <div className="space-y-1.5">
            <label
              htmlFor="phase2-gefuehlswoerter"
              className="block font-medium text-foreground"
            >
              Welche Gefühlswörter kommen in deinem Text vor? Schreib sie
              heraus.
            </label>
            <Textarea
              id="phase2-gefuehlswoerter"
              autoResize
              rows={2}
              value={gefuehlWoerter}
              onChange={(event) => setGefuehlWoerter(event.target.value)}
              placeholder="z. B. entspannt, erleichtert"
            />
          </div>

          {/* Stufe 2 */}
          <div className="space-y-1.5">
            <label
              htmlFor="phase2-gefuehl"
              className="block font-medium text-foreground"
            >
              Welches Gefühl ist es genau? Was willst du fühlen?
            </label>
            <Input
              id="phase2-gefuehl"
              value={gefuehl}
              onChange={(event) => setGefuehl(event.target.value)}
              placeholder="z. B. Gelassenheit"
            />
            <p className="text-sm text-faint">
              Schreib es als Substantiv, also „Gelassenheit“ statt „gelassen“.
              Dieses Gefühl steht anschließend in deinem Zielsatz.
            </p>
            <p className="text-sm text-muted">
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

          {/* Die Liste nur für den Fall, dass nichts einfällt (eingeklappt). */}
          <details className="group rounded-xl border border-subtle bg-surface p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium text-foreground">
              Dir fällt nichts ein? Wähle ein Gefühl aus der Liste
              <ChevronDown
                className="size-4 shrink-0 text-muted motion-safe:transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <div className="mt-2 max-w-prose space-y-1 text-sm text-muted">
              <p>
                Wenn du nach einem Wort suchst, das dein Gefühl am besten zum
                Ausdruck bringt, dann kannst du dir durch die Liste helfen
                lassen.
              </p>
              <p>Sie hat keinen Anspruch auf Vollständigkeit.</p>
            </div>
            <div
              role="group"
              aria-label="Positive Gefühle (höchstens zwei wählen)"
              className="mt-3 flex flex-wrap gap-2"
            >
              {FEELINGS.map((feeling) => {
                const selected = parts.includes(feeling);
                const locked = !selected && !canAddMore;
                return (
                  <button
                    key={feeling}
                    type="button"
                    aria-pressed={selected}
                    disabled={locked}
                    onClick={() => toggleFeeling(feeling)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      selected
                        ? "border-accent bg-accent text-white"
                        : "border-subtle bg-surface text-muted hover:text-foreground",
                      locked &&
                        "cursor-not-allowed opacity-45 hover:text-muted",
                    )}
                  >
                    {feeling}
                  </button>
                );
              })}
            </div>
          </details>
        </div>
      </div>

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext
      />
    </div>
  );
}
