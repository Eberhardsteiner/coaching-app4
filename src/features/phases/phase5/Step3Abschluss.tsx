import { ContactCard } from "@/components/ContactCard";
import { METHOD_LABELS } from "@/config/method";
import { PhaseCheck } from "@/features/phases/PhaseCheck";
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

/** Abschlusstext Teil 1 (Methodik-Vorlage, wortgetreu). */
const OUTRO_1 =
  "Du hast deinen Coachingprozess vollständig durchlaufen. Wenn du zufrieden bist mit deinem Weg und den Ergebnissen, dann steht dem Erreichen deines Ziels nun nichts mehr entgegen. Solltest du noch unsicher sein und Zweifel haben, so wende dich gern an einen Coach aus unserem Team, der oder die dich gern darin unterstützt, deine Unklarheiten auszuräumen.";

/** Dank/Go-live (wortgetreu, SMC interpoliert, Zweig-Variante). */
function outro2(coached: boolean): string {
  const label = coached
    ? `${METHOD_LABELS.standardShort}-Coaching`
    : `${METHOD_LABELS.standardShort}-Selbstcoaching`;
  return `Und nun viel Erfolg mit dem ‚Go live!‘ — und herzlichen Dank, dass du dich unserem ${label} anvertraut hast!`;
}

/**
 * Phase 5, Step 5.3 — Abschluss & Check. The method's closing text (branch
 * variants, SMC interpolated from METHOD_LABELS), the contact card right under
 * the doubt sentence, then the shared four-part check. "Sitzung abschließen"
 * (via onComplete) marks Phase 5 complete — the container then shows the
 * completion page.
 */
export function Step3Abschluss({
  nav,
  onComplete,
}: {
  nav: PhaseNavigation;
  onComplete: () => void;
}) {
  const check = useSessionStore((s) => s.session?.phase5.check) ?? EMPTY_CHECK;
  const coached = useSessionStore((s) => s.session?.meta.branch === "coached");
  const patch = useSessionStore((s) => s.patch);

  function setCheck(next: PhaseCheckValue) {
    patch((s) => ({ ...s, phase5: { ...s.phase5, check: next } }));
  }

  return (
    <div className="space-y-5">
      <p className="text-muted">{OUTRO_1}</p>

      <ContactCard />

      <p className="text-muted">{outro2(coached)}</p>

      <PhaseCheck value={check} onChange={setCheck} />

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={onComplete}
        canNext
        nextLabel="Sitzung abschließen"
      />
    </div>
  );
}
