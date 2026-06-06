import { Info } from "lucide-react";

import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";

/** Verbatim invitation to sketch the topic. */
const EINLEITUNG =
  "Bevor du in deinen eigentlichen Coachingprozess startest, darf ich dich bitten, dein Thema kurz zu skizzieren. Bitte nicht zu ausführlich, denn du wirst gleich gebeten, dir dieses Thema in aller Tiefe zu erschließen. Es genügt, wenn du hier ein paar Fakten zu deiner Person und deinem Kontext benennst und angibst, mit welchem Thema und Anliegen du ins Coaching gehst. Bitte halte diese Punkte schriftlich fest, damit du im Anschluss überprüfen kannst, ob alle deine Aspekte auch in deiner Beschreibung der Ist-Situation vorkommen und du nichts vergessen hast.";

/** Three calm guiding questions (verbatim) shown as inspiration over the field. */
const LEITFRAGEN = [
  "Warum möchtest du ein Selbstcoaching durchführen?",
  "Was ist dein Thema?",
  "Was treibt dich um?",
];

/**
 * Phase 0, last step — Dein Thema (topic sketch). No yes/no here: the
 * eignungs-/Schutzprüfung is the previous step (Step04Eignung). Shows the
 * verbatim invitation + three guiding questions + a single free-text field bound
 * to the existing phase0.topicSketch (no model change). The §9.0 hint is locally
 * framed for this page — it deliberately avoids the blanket "no personal data"
 * wording, since the user is invited to note a few facts about themselves (the
 * app-wide privacy wording is unified in KP 1.5). Completing this step finishes
 * Phase 0 → Phase 1.
 */
export function Step05Thema({ nav }: { nav: PhaseNavigation }) {
  const session = useSessionStore((s) => s.session);
  const patch = useSessionStore((s) => s.patch);

  if (!session) return null;

  const { topicSketch } = session.phase0;

  function setTopic(value: string) {
    patch((s) => ({ ...s, phase0: { ...s.phase0, topicSketch: value } }));
  }

  const hasTopic = topicSketch.trim().length > 0;

  return (
    <div>
      <div className="space-y-6">
        <p className="text-muted">{EINLEITUNG}</p>

        <div className="rounded-lg border border-subtle bg-surface-2 p-4">
          <p className="text-sm font-medium text-foreground">
            Diese Fragen können dir helfen
          </p>
          <ul className="mt-2 space-y-1.5">
            {LEITFRAGEN.map((question) => (
              <li
                key={question}
                className="flex items-start gap-2 text-sm text-muted"
              >
                <span
                  aria-hidden
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                />
                <span>{question}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="topic-sketch"
            className="block text-sm font-medium text-foreground"
          >
            Dein Thema
          </label>
          <textarea
            id="topic-sketch"
            value={topicSketch}
            onChange={(event) => setTopic(event.target.value)}
            rows={6}
            placeholder="Ein paar Sätze zu dir, deinem Kontext und deinem Anliegen …"
            className="w-full rounded-md border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <p className="flex items-start gap-1.5 text-xs text-faint">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>
              Deine Eingaben bleiben lokal auf deinem Gerät. Schreib so offen,
              wie du möchtest — vermeide besonders sensible Angaben und nenne
              andere Personen nur, soweit nötig (am besten in ihrer Rolle).
            </span>
          </p>
        </div>
      </div>

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext={hasTopic}
      />
    </div>
  );
}
