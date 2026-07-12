import { ChevronDown } from "lucide-react";

import { ContentLoadState } from "@/features/content/ContentLoadState";
import { useModel } from "@/features/content/useModel";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { ResourceHarvest } from "@/features/phases/phase3/ResourceHarvest";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { ResourceItem } from "@/features/session/types";

/** Stable empty default for the additive-optional personalityTraits field. */
const NO_ITEMS: ResourceItem[] = [];

/** Anmoderation (Methodik-Vorlage, wortgetreu, gekürzt). */
const INTRO =
  "Wenn du einen Motivtest (EPP) gemacht hast, nimm bitte die Ergebnisse zur Hand. Identifiziere deine stärksten Motive und Persönlichkeitseigenschaften — du erkennst sie an hohen Werten. Bei Fragen zu deinem Motivtest kannst du dich jederzeit an einen unserer Coaches und EPP-Berater*innen wenden. Für eine erste Orientierung helfen dir die kurzen Beschreibungen zu den Motivwörtern.";

/** Die Reflexionsübung (Methodik-Vorlage, wortgetreu gestrafft). */
const EXERCISE_STEPS: { title: string; text: string }[] = [
  {
    title: "1. Verstehen",
    text: "Beschreibung aufmerksam lesen (compact edition ab Seite 6).",
  },
  {
    title: "2. Wahrnehmen",
    text: "Spürst du dieses Motiv bei dir? Woran merkst du das?",
  },
  {
    title: "3. Beispiele finden",
    text: "In welchen beruflichen oder privaten Situationen zeigt es sich besonders deutlich?",
  },
  {
    title: "4. Vertiefen",
    text: "Wie fühlt es sich an, wenn dieses Motiv über längere Zeit nicht erfüllt wird? Wie macht sich das körperlich oder emotional bemerkbar?",
  },
  {
    title: "5. Falls du Führungskraft bist — Bezug zur Führung",
    text: "Welche deiner starken Motive unterstützen dich in deiner Führungsrolle? Welche können dich gelegentlich behindern? Was bedeutet das für deine Selbstführung?",
  },
];

/**
 * Phase 3, Step 3.3 — Motive & Persönlichkeitseigenschaften (EPP). The 24
 * template terms (motive.json — 18 Motive with id prefix "motiv-", 6
 * Persönlichkeitseigenschaften with prefix "pe-") harvested into the SEPARATE
 * fields motives / personalityTraits (previously wrongly mixed), each entry
 * rated in place. Plus the collapsible reflection exercise. Soft step.
 */
export function Step3MotivePE({ nav }: { nav: PhaseNavigation }) {
  const motives = useSessionStore((s) => s.session?.phase3.motives ?? []);
  const personalityTraits = useSessionStore(
    (s) => s.session?.phase3.personalityTraits ?? NO_ITEMS,
  );
  const patch = useSessionStore((s) => s.patch);
  const loaded = useModel("motive");

  function setMotives(next: ResourceItem[]) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, motives: next } }));
  }

  function setPersonalityTraits(next: ResourceItem[]) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, personalityTraits: next } }));
  }

  const motivTerms =
    loaded.model?.terms.filter((t) => t.id.startsWith("motiv-")) ?? [];
  const peTerms =
    loaded.model?.terms.filter((t) => t.id.startsWith("pe-")) ?? [];

  return (
    <div className="space-y-6">
      <p className="text-muted">{INTRO}</p>

      {loaded.status === "loading" || loaded.status === "error" ? (
        <ContentLoadState
          status={loaded.status}
          error={loaded.error}
          onRetry={loaded.retry}
          loadingLabel="EPP-Begriffe werden geladen …"
        />
      ) : loaded.model ? (
        <>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Deine Motive
            </h3>
            <ResourceHarvest
              terms={motivTerms}
              items={motives}
              onItemsChange={setMotives}
              polarityQuestion="Hilft oder hindert dich dieses Motiv auf dem Weg zu deinem Ziel?"
              ownLabel="Eigenes Motiv"
              ownPlaceholder="z. B. ein weiteres Motiv aus deinem EPP"
            />
          </div>

          <div className="space-y-3 border-t border-subtle pt-6">
            <h3 className="text-sm font-semibold text-foreground">
              Deine Persönlichkeitseigenschaften
            </h3>
            <ResourceHarvest
              terms={peTerms}
              items={personalityTraits}
              onItemsChange={setPersonalityTraits}
              polarityQuestion="Hilft oder hindert dich diese Eigenschaft auf dem Weg zu deinem Ziel?"
              ownLabel="Eigene Eigenschaft"
              ownPlaceholder="z. B. eine weitere Eigenschaft"
            />
          </div>
        </>
      ) : null}

      <div className="space-y-2 rounded-xl border border-subtle bg-surface-2 p-4 text-sm text-muted">
        <p>
          Auch sehr schwache Motive können Einfluss auf die Zielerreichung
          haben: Hast du z. B. wenige Punkte bei „Status“ und musst mit sehr
          statusorientierten Menschen arbeiten, kann der niedrige Wert
          hinderlich sein.
        </p>
        <p>
          Motive und Persönlichkeitseigenschaften ohne Bezug zu deinem Ziel
          kannst du weglassen.
        </p>
      </div>

      {/* Reflexionsübung */}
      <details className="group rounded-xl border border-subtle bg-surface p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-foreground">
          Übung: Eigene Motive und Persönlichkeitseigenschaften reflektieren
          <ChevronDown
            className="size-4 text-muted motion-safe:transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="mt-3 space-y-3 text-sm text-muted">
          <p>
            <span className="font-medium text-foreground">Ziel:</span> die
            eigenen Motive und Persönlichkeitseigenschaften bewusst wahrnehmen
            und emotional nachvollziehen.
          </p>
          <p>
            <span className="font-medium text-foreground">Zeit:</span> ca. 30–40
            Minuten ·{" "}
            <span className="font-medium text-foreground">Material:</span> Dein
            EPP inkl. Beschreibungen.
          </p>
          <p>
            <span className="font-medium text-foreground">Vorgehen:</span> Nutze
            die Übersichtsseite deines EPP (compact edition, Seite 12) und gehe
            die Begriffe nacheinander durch:
          </p>
          <ol className="space-y-2">
            {EXERCISE_STEPS.map((step) => (
              <li key={step.title}>
                <span className="font-medium text-foreground">
                  {step.title}
                </span>{" "}
                — {step.text}
              </li>
            ))}
          </ol>
        </div>
      </details>

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
