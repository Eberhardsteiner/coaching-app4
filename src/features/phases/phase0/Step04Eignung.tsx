import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { StepNav } from "@/features/phases/StepNav";
import {
  COACHABILITY_QUESTIONS,
  computeCoachabilityResult,
  type CoachabilityField,
} from "@/features/phases/phase0/coachability";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { SafetyNotice } from "@/features/safety/SafetyNotice";
import { useSessionStore } from "@/features/session/sessionStore";
import { cn } from "@/lib/utils";

/** A calm Ja / Nein toggle (default state reflects the stored boolean). */
function YesNo({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-2">
      {[
        { v: true, t: "Ja" },
        { v: false, t: "Nein" },
      ].map((option) => (
        <button
          key={option.t}
          type="button"
          aria-pressed={value === option.v}
          onClick={() => onChange(option.v)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm transition-colors",
            value === option.v
              ? "bg-accent text-white"
              : "bg-surface-2 text-muted hover:text-foreground",
          )}
        >
          {option.t}
        </button>
      ))}
    </div>
  );
}

/**
 * Phase 0, Step 0.4 — Passt das Thema? (eignungs-/Schutzprüfung).
 *
 * The three calm yes/no self-assessments plus the unchanged protection logic
 * (computeCoachabilityResult): addiction or acute distress → not_suitable
 * (calm message + SafetyNotice / help resources; for self this blocks advancing
 * to the topic sketch — help links + back instead of "Weiter"); "others must
 * change" → caution hint. coached is recommended-not-blocked. The topic sketch
 * itself is the next, separate step (Step05Thema).
 */
export function Step04Eignung({ nav }: { nav: PhaseNavigation }) {
  const session = useSessionStore((s) => s.session);
  const patch = useSessionStore((s) => s.patch);

  if (!session) return null;

  const { coachability } = session.phase0;
  const branch = session.meta.branch;
  const result = coachability.result;

  function setAnswer(field: CoachabilityField, value: boolean) {
    patch((s) => {
      const next = { ...s.phase0.coachability, [field]: value };
      const computed = computeCoachabilityResult({
        addiction: next.addiction,
        othersMustChange: next.othersMustChange,
        acuteDistress: next.acuteDistress,
      });
      return {
        ...s,
        phase0: { ...s.phase0, coachability: { ...next, result: computed } },
      };
    });
  }

  const blockedSelf = branch === "self" && result === "not_suitable";

  return (
    <div>
      <div className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">
            Eine kurze Selbsteinschätzung
          </legend>
          {COACHABILITY_QUESTIONS.map((question) => (
            <div
              key={question.field}
              className="flex flex-col gap-3 rounded-lg border border-subtle bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm text-foreground">{question.text}</p>
              <YesNo
                value={coachability[question.field]}
                onChange={(value) => setAnswer(question.field, value)}
                label={question.text}
              />
            </div>
          ))}
        </fieldset>

        {result === "not_suitable" ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-subtle bg-surface-2 p-4">
              <p className="text-sm text-foreground">
                Nach deiner Einschätzung ist (Selbst-)Coaching hier vermutlich
                nicht das richtige Werkzeug. Das ist keine Bewertung — manche
                Themen brauchen andere, fachliche Hilfe.
              </p>
              {branch === "coached" ? (
                <p className="mt-2 text-sm text-muted">
                  Du arbeitest mit Begleitung — bitte besprich dieses Thema mit
                  deiner begleitenden Person.
                </p>
              ) : null}
            </div>
            <SafetyNotice />
          </div>
        ) : result === "caution" ? (
          <div className="rounded-lg border border-subtle bg-surface-2 p-4 text-sm text-foreground">
            Coaching wirkt dort, wo es um deine eigene Veränderung geht.
            Vielleicht lässt sich dein Thema so wenden: Was möchtest <em>du</em>{" "}
            anders machen oder erreichen — unabhängig von anderen?
          </div>
        ) : null}
      </div>

      {blockedSelf ? (
        <div className="mt-8 flex flex-col gap-3 border-t border-subtle pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            onClick={nav.goPrevStep}
            disabled={!nav.canGoBack}
          >
            <ArrowLeft />
            Zurück
          </Button>
          <Button asChild variant="outline">
            <Link to="/start">Zurück zur Auswahl</Link>
          </Button>
        </div>
      ) : (
        <StepNav
          onBack={nav.goPrevStep}
          canBack={nav.canGoBack}
          onNext={nav.advance}
          canNext={!blockedSelf}
        />
      )}
    </div>
  );
}
