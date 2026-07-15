import { ChevronDown } from "lucide-react";

import { KiImpuls } from "@/features/ai/KiImpuls";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import {
  coreThemeLabel,
  useCoreTheme,
} from "@/features/phases/phase2/useCoreTheme";
import { ResourceListEditor } from "@/features/phases/phase3/ResourceListEditor";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { ResourceItem } from "@/features/session/types";

/** Kernsatz sichtbar — der Wortlaut bleibt aufklappbar (VIS-2). */
const INTRO_CORE =
  "Jetzt wechselst du die Warte: Ein Blick durch die Brille eines wissenschaftlichen Modells kann neue Erkenntnisse bis hin zu Impulsen für neues Verhalten liefern.";

const INTRO_VOLLTEXT =
  "Bisher hast du dich am Kompetenzmodell orientiert und deine inneren Ressourcen befragt — auf sie kannst du immer zugreifen, denn sie liegen bereits in dir. Jetzt betrachtest du dein Thema und dein Ziel aus einer ganz anderen Warte: aus wissenschaftlicher Sicht. Zu fast allem, was dich bewegt, hat sich eine wissenschaftliche Disziplin schon einmal Gedanken gemacht und ihr Wissen in Modelle gegossen. Modelle sind kein Abbild der Wirklichkeit, aber sie bieten eine Ordnung an, um die Welt in einer bestimmten Perspektive zu verstehen. Ein Blick durch die Brille eines Modells kann neue Erkenntnisse bis hin zu Impulsen für neues Verhalten liefern.";

/** Die vier Leitfragen (Methodik-Vorlage, wortgetreu). */
const LEITFRAGEN = [
  "Hat das Modell mit meinem Thema zu tun?",
  "Was hat es damit zu tun?",
  "Welche Erkenntnisse oder Fragen leite ich daraus ab?",
  "Ist etwas aus dem Modell — oder das ganze Modell — eine Ressource für mein Ziel? Schreibe auf!",
];

/**
 * Copyable prompt asking for at most five fitting scientific models —
 * explicitly without interpreting the person and without advice.
 */
function buildPrompt(
  coreLabel: string,
  goalText: string,
  vision: string,
): string {
  const goal = goalText.trim() || "(noch offen)";
  const visionPart = vision.trim()
    ? ` Meine Vorstellung des Zielzustands: «${vision.trim()}».`
    : "";
  return (
    `Ich arbeite in einem Selbstcoaching an einem persönlichen Ziel und suche ` +
    `wissenschaftliche Modelle als neue Perspektive. Mein Kernthema: ` +
    `«${coreLabel}». Mein Zielsatz: «${goal}».${visionPart} Bitte schlage mir ` +
    `maximal 5 passende wissenschaftliche Modelle oder Theorien vor, die zu ` +
    `Thema und Ziel passen — mit je 1–2 Sätzen Erklärung, worum es in dem ` +
    `Modell geht. Wichtig: keine Deutung meiner Person, keine Ratschläge und ` +
    `keine Lösungen — nur Modelle mit kurzer, neutraler Erklärung. Antworte ` +
    `auf Deutsch.`
  );
}

/**
 * Phase 3, Step 3.6 — Ressourcen aus Modellen (die KI-Vogelperspektive).
 * Replaces the old free hypotheses step on the SAME field (contract:
 * phase3.hypotheses — `note` = model name, `text` = insight/resource). Self
 * branch: KiImpuls with the model-suggestion prompt (max 5, no
 * interpretation); coached branch: the coach guides, same capture. Old
 * entries without a note stay valid (shown without a model badge).
 */
export function Step6ModellRessourcen({ nav }: { nav: PhaseNavigation }) {
  const branch = useSessionStore((s) => s.session?.meta.branch);
  const goalText = useSessionStore((s) => s.session?.phase2.goalText ?? "");
  const vision = useSessionStore((s) => s.session?.phase2.vision ?? "");
  const hypotheses = useSessionStore((s) => s.session?.phase3.hypotheses ?? []);
  const patch = useSessionStore((s) => s.patch);
  const core = useCoreTheme();
  const label = coreThemeLabel(core);

  function setHypotheses(next: ResourceItem[]) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, hypotheses: next } }));
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

      <p className="text-sm text-muted">
        Es gibt hunderte solcher Modelle — längst nicht alle passen zu deinem
        Thema. Deshalb bekommst du maximal 5 Vorschläge; unpassende legst du
        einfach beiseite.
      </p>

      {/* Die vier Leitfragen */}
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
        <p className="text-sm font-medium text-foreground">
          Schau dir das Modell an und frage dich:
        </p>
        <ol className="mt-2 space-y-1 text-sm text-muted">
          {LEITFRAGEN.map((frage, index) => (
            <li key={frage}>
              <span className="font-medium text-foreground">{index + 1}.</span>{" "}
              {frage}
            </li>
          ))}
        </ol>
      </div>

      {branch === "coached" ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-subtle bg-surface-2 p-4 text-sm text-foreground">
            Diesen Schritt begleitet dein Coach — gemeinsam wählt ihr Modelle
            aus und geht sie durch. Halte hier fest, welche Erkenntnisse und
            Ressourcen dabei entstehen.
          </div>
          <ResourceListEditor
            items={hypotheses}
            onItemsChange={setHypotheses}
            addLabel="Erkenntnis / Ressource"
            placeholder="eine Erkenntnis, eine Ressource …"
            itemLabel="Erkenntnis"
            emptyHint="Noch nichts erfasst."
            noteLabel="Modell"
            notePlaceholder="Modellname"
            withPolarity
          />
          <NoPersonalDataHint />
        </div>
      ) : (
        <div className="space-y-3">
          <KiImpuls
            promptText={buildPrompt(label, goalText, vision)}
            items={hypotheses}
            onItemsChange={setHypotheses}
            captureLabel="Erkenntnis / Ressource"
            captureNoteLabel="Modell"
            captureNotePlaceholder="Modellname"
            captureWithPolarity
          />
          <div className="space-y-1 rounded-lg border border-subtle bg-surface-2 p-3 text-xs text-muted">
            <p>
              Die Vorschläge beruhen ausschließlich auf deinen Aussagen und sind
              keine Deutung. Wenn dir ein Modell unpassend erscheint, lege es
              einfach beiseite. Du kannst dir die Modelle kurz erklären lassen.
            </p>
            <p>
              Wenn keines passt, kopiere den Prompt erneut und bitte um eine
              neue Auswahl.
            </p>
          </div>
        </div>
      )}

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext
      />
    </div>
  );
}
