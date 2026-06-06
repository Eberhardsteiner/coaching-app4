import { Button } from "@/components/ui/button";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import { cn } from "@/lib/utils";

const EXAMPLE_CHIPS = [
  "Stress",
  "Druck",
  "Unsicherheit",
  "Frust",
  "Überforderung",
  "Stillstand",
];

const BURDEN_SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const LOW_BURDEN_THRESHOLD = 3;

/**
 * Phase 1, Step 1.1 — Gefühl benennen (IST). A single word for the IST state
 * (Lösungsfreiheit guidance + gentle multi-word nudge) and an optional
 * Leidensdruck check (1–10) with a calm low-burden response. No AI here.
 */
export function Step1Gefuehl({ nav }: { nav: PhaseNavigation }) {
  const istWord = useSessionStore((s) => s.session?.phase1.istWord ?? "");
  const istBurden = useSessionStore((s) => s.session?.phase1.istBurden);
  const patch = useSessionStore((s) => s.patch);

  function setIstWord(value: string) {
    patch((s) => ({ ...s, phase1: { ...s.phase1, istWord: value } }));
  }

  function setBurden(value: number) {
    patch((s) => ({ ...s, phase1: { ...s.phase1, istBurden: value } }));
  }

  const trimmed = istWord.trim();
  const multipleWords = trimmed.split(/\s+/).filter(Boolean).length > 1;
  const lowBurden =
    istBurden !== undefined && istBurden <= LOW_BURDEN_THRESHOLD;
  const canNext = trimmed.length > 0;

  return (
    <div>
      <div className="space-y-6">
        <p className="text-muted">
          Finde ein einziges Wort für deinen IST-Zustand — das Gefühl, das dein
          Thema gerade auslöst. Keine Lösung, kein Wunsch: nur, was jetzt ist.
        </p>

        <div className="space-y-2">
          <label
            htmlFor="ist-word"
            className="block text-sm font-medium text-foreground"
          >
            Dein IST-Wort
          </label>
          <input
            id="ist-word"
            type="text"
            value={istWord}
            onChange={(event) => setIstWord(event.target.value)}
            placeholder="ein Wort …"
            className="w-full rounded-md border border-subtle bg-surface px-3 py-2.5 text-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          {multipleWords ? (
            <p className="text-xs text-amber-600">Versuch es mit einem Wort.</p>
          ) : (
            <p className="text-xs text-faint">
              Keine Lösung, kein Wunsch — nur das Gefühl, das jetzt da ist.
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {EXAMPLE_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setIstWord(chip)}
                className="rounded-full border border-subtle bg-surface px-3 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Wie sehr belastet dich das gerade?
          </p>
          <div
            role="group"
            aria-label="Belastung von 1 bis 10"
            className="flex flex-wrap gap-1.5"
          >
            {BURDEN_SCALE.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={istBurden === value}
                aria-label={`${value} von 10`}
                onClick={() => setBurden(value)}
                className={cn(
                  "size-9 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  istBurden === value
                    ? "bg-accent text-white"
                    : "bg-surface-2 text-muted hover:text-foreground",
                )}
              >
                {value}
              </button>
            ))}
          </div>

          {lowBurden ? (
            <div className="mt-2 rounded-lg border border-subtle bg-surface-2 p-4">
              <p className="text-sm text-foreground">
                Wenn dich das gerade kaum belastet, fehlt vielleicht der Anlass
                für Veränderung. Möchtest du dein Thema noch einmal anschauen?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => nav.goTo(0, 4)}
                >
                  Thema anpassen
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!canNext}
                  onClick={() => nav.advance()}
                >
                  Trotzdem weiter
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext={canNext}
      />
    </div>
  );
}
