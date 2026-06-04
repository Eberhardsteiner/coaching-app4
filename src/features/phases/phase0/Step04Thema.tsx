import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
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
 * Phase 0, Step 0.4 — Passt das Thema? & Dein Thema.
 * Coachability self-check → result; reaction to the result; topic sketch with
 * the §9.0 no-personal-data hint. For self + not_suitable, advancing to Phase 1
 * is blocked (help links + back instead); coached is recommended-not-blocked.
 */
export function Step04Thema({ nav }: { nav: PhaseNavigation }) {
  const session = useSessionStore((s) => s.session);
  const patch = useSessionStore((s) => s.patch);

  if (!session) return null;

  const { coachability, topicSketch } = session.phase0;
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

  function setTopic(value: string) {
    patch((s) => ({ ...s, phase0: { ...s.phase0, topicSketch: value } }));
  }

  const hasTopic = topicSketch.trim().length > 0;
  const blockedSelf = branch === "self" && result === "not_suitable";
  const canComplete = hasTopic && !blockedSelf;

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

        <div className="space-y-2">
          <label
            htmlFor="topic-sketch"
            className="block text-sm font-medium text-foreground"
          >
            Dein Thema
          </label>
          <p className="text-sm text-muted">
            Warum jetzt? Worum geht es im Kern?
          </p>
          <textarea
            id="topic-sketch"
            value={topicSketch}
            onChange={(event) => setTopic(event.target.value)}
            rows={4}
            placeholder="Ein paar Sätze genügen …"
            className="w-full rounded-md border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <NoPersonalDataHint />
        </div>
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
          canNext={canComplete}
        />
      )}
    </div>
  );
}
