import type { ReactNode } from "react";

import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import {
  coreThemeLabel,
  useCoreTheme,
} from "@/features/phases/phase2/useCoreTheme";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { Phase2 } from "@/features/session/types";

/** Format an ISO date (yyyy-mm-dd) as a German date without timezone shifts. */
function formatGermanDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}.${m}.${y}` : iso;
}

/** A filled or placeholder slot in the live goal sentence. */
function Slot({ value, placeholder }: { value: string; placeholder?: string }) {
  const filled = value.trim().length > 0;
  return (
    <span
      className={filled ? "font-medium text-foreground" : "italic text-faint"}
    >
      «{filled ? value : (placeholder ?? "…")}»
    </span>
  );
}

/**
 * Phase 2, Step 2.2 — Zielformel. A Futur-II goal-sentence builder assembled
 * live from a date, the goal state, the core-theme reference (prefilled) and
 * optional role + feeling. Forward is gated on goalText + datum. No AI here.
 */
export function Step2Zielformel({ nav }: { nav: PhaseNavigation }) {
  const datum = useSessionStore((s) => s.session?.phase2.datum ?? "");
  const goalText = useSessionStore((s) => s.session?.phase2.goalText ?? "");
  const rolle = useSessionStore((s) => s.session?.phase2.rolle ?? "");
  const gefuehl = useSessionStore((s) => s.session?.phase2.gefuehl ?? "");
  const patch = useSessionStore((s) => s.patch);
  const core = useCoreTheme();
  const label = coreThemeLabel(core);

  /** Patch a Phase-2 field and keep clusterRef in sync with the core theme. */
  function setField(partial: Partial<Phase2>) {
    patch((s) => ({
      ...s,
      phase2: {
        ...s.phase2,
        ...partial,
        clusterRef: core ? core.name : s.phase2.clusterRef,
      },
    }));
  }

  const canNext = goalText.trim().length > 0 && datum.length > 0;

  return (
    <div>
      <div className="space-y-5">
        {/* Live Futur-II preview */}
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-faint">
            Deine Zielformel
          </p>
          <p className="mt-2 leading-relaxed text-muted">
            Ab dem{" "}
            <Slot
              value={datum ? formatGermanDate(datum) : ""}
              placeholder="Datum"
            />{" "}
            werde ich{" "}
            {rolle.trim() ? (
              <>
                als <Slot value={rolle} />{" "}
              </>
            ) : null}
            <Slot value={goalText} placeholder="dein Zielzustand" /> in Bezug
            auf <Slot value={label} /> erreicht haben.
            {gefuehl.trim() ? (
              <>
                {" "}
                Ich werde mich dabei <Slot value={gefuehl} /> fühlen.
              </>
            ) : null}
          </p>
        </div>

        <Field
          label="Datum"
          htmlFor="phase2-datum"
          hint="Wann willst du es erreicht haben?"
        >
          <input
            id="phase2-datum"
            type="date"
            value={datum}
            onChange={(event) => setField({ datum: event.target.value })}
            className="rounded-lg border border-subtle bg-surface px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </Field>

        <Field
          label="Zielzustand"
          htmlFor="phase2-goal"
          hint="Als bereits erreicht formuliert — ein Zustand, kein Weg."
        >
          <textarea
            id="phase2-goal"
            value={goalText}
            rows={3}
            onChange={(event) => setField({ goalText: event.target.value })}
            placeholder="… ruhig und klar mit meiner Arbeitslast umgehen"
            className="w-full resize-y rounded-lg border border-subtle bg-surface px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </Field>

        <div className="rounded-lg border border-subtle bg-surface-2 px-3 py-2 text-sm">
          <span className="text-muted">Bezug zum Kernthema: </span>
          <span className="font-medium text-foreground">{label}</span>
        </div>

        {/* Optional refinements */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Rolle / Adressat (optional)" htmlFor="phase2-rolle">
            <input
              id="phase2-rolle"
              type="text"
              value={rolle}
              onChange={(event) => setField({ rolle: event.target.value })}
              placeholder="z. B. als Teamleitung"
              className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </Field>
          <Field label="Gefühl (optional)" htmlFor="phase2-gefuehl">
            <input
              id="phase2-gefuehl"
              type="text"
              value={gefuehl}
              onChange={(event) => setField({ gefuehl: event.target.value })}
              placeholder="z. B. gelassen"
              className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </Field>
        </div>

        <NoPersonalDataHint />
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

/** Small labelled field wrapper with an optional hint. */
function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-faint">{hint}</p> : null}
    </div>
  );
}
