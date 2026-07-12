import type { ReactNode } from "react";

import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import {
  coreThemeLabel,
  useCoreTheme,
} from "@/features/phases/phase2/useCoreTheme";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import { cn } from "@/lib/utils";

/** Format an ISO date (yyyy-mm-dd) as a German date without timezone shifts. */
function formatGermanDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}.${m}.${y}` : iso;
}

/**
 * Assemble the complete mantra sentence from its building blocks (data
 * contract: phase2.goalText always holds the full assembled sentence).
 * The feeling is the core — without it there is no sentence yet ("").
 * An unset date shows as "…" until picked (forward is gated on it anyway).
 */
function assembleGoalText(
  datum: string,
  rolle: string,
  gefuehl: string,
  coreLabel: string,
): string {
  const feeling = gefuehl.trim();
  if (!feeling) return "";
  const datePart = datum ? formatGermanDate(datum) : "…";
  const rollePart = rolle.trim()
    ? `in meiner Funktion als ${rolle.trim()} `
    : "";
  return `Ab dem ${datePart} werde ich ${rollePart}${feeling} in Bezug auf ${coreLabel} erreicht haben.`;
}

/** A filled or placeholder slot in the live mantra preview. */
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
 * Phase 2, Step 2.2 — Mein Zielsatz. The mantra builder following the method's
 * fixed pattern: „Ab dem DATUM werde ich (in meiner Funktion als ROLLE) GEFÜHL
 * in Bezug auf KERNTHEMA erreicht haben." The FEELING (a noun, prefilled from
 * 2.1) is the core; the role bracket disappears entirely when empty. Every
 * building-block change re-assembles and persists phase2.goalText (the full
 * sentence). Forward is gated on gefuehl + datum. No AI here.
 */
export function Step2Zielformel({ nav }: { nav: PhaseNavigation }) {
  const datum = useSessionStore((s) => s.session?.phase2.datum ?? "");
  const rolle = useSessionStore((s) => s.session?.phase2.rolle ?? "");
  const gefuehl = useSessionStore((s) => s.session?.phase2.gefuehl ?? "");
  const patch = useSessionStore((s) => s.patch);
  const core = useCoreTheme();
  const label = coreThemeLabel(core);

  /**
   * Patch a building block, re-assemble goalText from the NEW values and keep
   * clusterRef in sync with the core theme (data contract).
   */
  function setField(
    partial: Partial<{ datum: string; rolle: string; gefuehl: string }>,
  ) {
    patch((s) => {
      const merged = { ...s.phase2, ...partial };
      return {
        ...s,
        phase2: {
          ...merged,
          goalText: assembleGoalText(
            merged.datum ?? "",
            merged.rolle ?? "",
            merged.gefuehl ?? "",
            label,
          ),
          clusterRef: core ? core.name : s.phase2.clusterRef,
        },
      };
    });
  }

  const canNext = gefuehl.trim().length > 0 && datum.length > 0;

  return (
    <div>
      <div className="space-y-5">
        <p className="text-muted">
          Du hast nun eine Vorstellung deiner positiven neuen Situation. Die
          Stichworte aus deinem Brainstorming wirst du dir nicht alle merken
          können. Deshalb legst du dir jetzt{" "}
          <strong className="font-semibold text-foreground">einen Satz</strong>{" "}
          zurecht, der wie ein{" "}
          <strong className="font-semibold text-foreground">Mantra</strong>{" "}
          dienen kann — der in einem Satz beschreibt, wonach du strebst.
        </p>

        {/* Live mantra preview — the feeling is the core of the sentence. */}
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-faint">
            Dein Zielsatz
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
                in meiner Funktion als <Slot value={rolle} />{" "}
              </>
            ) : null}
            <Slot value={gefuehl} placeholder="Gefühl" /> in Bezug auf{" "}
            <Slot value={label} /> erreicht haben.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
              className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </Field>

          <Field
            label="Gefühl"
            htmlFor="phase2-gefuehl"
            hint="Als Substantiv, z. B. „Gelassenheit“ statt „gelassen“."
          >
            <input
              id="phase2-gefuehl"
              type="text"
              value={gefuehl}
              onChange={(event) => setField({ gefuehl: event.target.value })}
              placeholder="z. B. Gelassenheit"
              className={cn(
                "w-full rounded-lg border bg-surface px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                gefuehl.trim() ? "border-subtle" : "border-amber-600/50",
              )}
            />
          </Field>
        </div>

        <Field
          label="Rolle / Funktion (optional)"
          htmlFor="phase2-rolle"
          hint="Ist sie leer, entfällt der Einschub „in meiner Funktion als …“ komplett."
        >
          <input
            id="phase2-rolle"
            type="text"
            value={rolle}
            onChange={(event) => setField({ rolle: event.target.value })}
            placeholder="z. B. Teamleitung"
            className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </Field>

        <div className="rounded-lg border border-subtle bg-surface-2 px-3 py-2 text-sm">
          <span className="text-muted">Bezug zum Kernthema: </span>
          <span className="font-medium text-foreground">{label}</span>
        </div>

        <div className="rounded-xl border border-subtle bg-surface-2 p-4">
          <p className="text-sm text-muted">
            Lies dir deinen Satz{" "}
            <strong className="font-semibold text-foreground">laut</strong> vor
            und spüre, ob er in dir ein gutes Gefühl auslöst. Auch wenn es „nur“
            um einen Satz geht: Lass dir Zeit — ist dein Ziel nicht attraktiv
            für dich, wird es keine Motivation und keine Bewegung auslösen.
          </p>
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
