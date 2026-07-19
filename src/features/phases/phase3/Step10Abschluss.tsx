import type { ReactNode } from "react";

import { PhaseCheck } from "@/features/phases/PhaseCheck";
import { countPolarities } from "@/features/phases/phase3/resourceFields";
import { RessourcenCockpit } from "@/features/phases/phase3/RessourcenCockpit";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { PhaseCheck as PhaseCheckValue } from "@/features/session/types";

const EMPTY_CHECK: PhaseCheckValue = {
  result: "",
  process: "",
  insight: "",
  transfer: "",
};

/**
 * Abschlusstext (Methodik-Vorlage, wortgetreu, gekürzt), K1: drei Absätze —
 * Ende der Erkundung/was du kennst · Werte der anderen/Sicherheit ·
 * Cockpit-Überblick als Bausteine der Maßnahmen.
 */
const OUTRO_ABSAETZE: ReactNode[] = [
  "Du bist am Ende deiner Ressourcenerkundung angelangt. Du kennst deine hilfreichen und hinderlichen inneren Ressourcen, aber auch äußere Ressourcen.",
  <>
    Du hast ein Gespür für die{" "}
    <strong className="font-semibold text-foreground">Werte der anderen</strong>{" "}
    im System und kannst dich darauf einstellen. Und du bist sicher, dass du
    dich verändern willst und kannst — und weißt, wo die Reise hingeht.
  </>,
  <>
    Bevor du in Phase 4 deine Maßnahmen entwickelst, verschaffe dir noch einmal
    einen Überblick über dein{" "}
    <strong className="font-semibold text-foreground">
      Ressourcen-Cockpit
    </strong>
    : Deine Ressourcen sind die{" "}
    <strong className="font-semibold text-foreground">
      Bausteine, aus denen du deine Maßnahmen baust
    </strong>
    .
  </>,
];

/**
 * Phase 3, Step 3.10 — Abschluss & Check. The method's closing text, the
 * embedded (compact) Ressourcen-Cockpit with the polarity counters (incl.
 * personalityTraits via countPolarities), then the shared four-part check.
 * "Phase abschließen" completes Phase 3 → unlocks and navigates to Phase 4.
 */
export function Step10Abschluss({ nav }: { nav: PhaseNavigation }) {
  const check = useSessionStore((s) => s.session?.phase3.check) ?? EMPTY_CHECK;
  const phase3 = useSessionStore((s) => s.session?.phase3);
  const patch = useSessionStore((s) => s.patch);

  const counts = phase3
    ? countPolarities(phase3)
    : { foerderlich: 0, hinderlich: 0, offen: 0, total: 0 };

  function setCheck(next: PhaseCheckValue) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, check: next } }));
  }

  return (
    <div className="space-y-6">
      <div className="max-w-prose space-y-2 text-muted">
        {OUTRO_ABSAETZE.map((absatz, index) => (
          <p key={index}>{absatz}</p>
        ))}
      </div>

      {/* Zähler */}
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-green-50 px-3 py-1 text-green-800">
          förderlich: {counts.foerderlich}
        </span>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">
          hinderlich: {counts.hinderlich}
        </span>
        <span className="rounded-full bg-surface-2 px-3 py-1 text-muted">
          offen: {counts.offen}
        </span>
      </div>

      {/* Eingebettetes Cockpit (kompakt) */}
      <RessourcenCockpit compact />

      <PhaseCheck value={check} onChange={setCheck} />

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext
        nextLabel="Phase abschließen"
      />
    </div>
  );
}
