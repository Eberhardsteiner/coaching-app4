import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { PHASES } from "@/features/phases/phaseConfig";
import { cn } from "@/lib/utils";

/**
 * A phase accent. IST phases use the rosa IST token (persona-independent), all
 * other phases use the persona accent (green in self, blue in the coach view).
 */
export type PhaseAccent = "ist" | "accent";

export interface PhaseStartProps {
  /** 1–5 (Phase 0 = Vereinbarung has no start screen). */
  phaseNumber: 1 | 2 | 3 | 4 | 5;
  /** Short phase name (for the CTA's accessible label). */
  phaseName: string;
  /** Small calm eyebrow, e.g. "Phase 1 · Ist-Situation". */
  eyebrow: string;
  /** Large editorial headline (rendered as the page h1). */
  heading: string;
  /** Concise explanatory text. */
  intro: string;
  accent: PhaseAccent;
  /** Phase-specific artwork (decorative SVG). */
  motif: ReactNode;
  ctaLabel: string;
  onStart: () => void;
  /** Optional secondary action (e.g. back to the previous phase's last step). */
  onBack?: () => void;
}

/**
 * The five working phases as a calm progress trail — echoes the Rubikon journey
 * (IntroView) and shows where in the process this phase sits. Presentational
 * (not interactive); the current phase is emphasised in the phase accent.
 */
function PhaseTrail({
  current,
  accent,
}: {
  current: number;
  accent: PhaseAccent;
}) {
  const isAccent = accent === "accent";
  return (
    <ol
      aria-label="Die fünf Phasen deiner Reise"
      className="flex items-center gap-2 sm:gap-3"
    >
      {([1, 2, 3, 4, 5] as const).map((n) => {
        const isCurrent = n === current;
        const isPast = n < current;
        return (
          <li
            key={n}
            aria-current={isCurrent ? "step" : undefined}
            className="flex items-center gap-2 sm:gap-3"
          >
            <span
              aria-label={`Phase ${n}: ${PHASES[n].title}`}
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full font-medium transition-colors",
                isCurrent ? "size-8 text-sm" : "size-6 text-xs",
                isCurrent &&
                  (isAccent ? "bg-accent text-white" : "bg-ist text-white"),
                isPast &&
                  (isAccent
                    ? "bg-accent/15 text-accent"
                    : "bg-ist/15 text-ist"),
                !isCurrent && !isPast && "bg-surface-2 text-faint",
              )}
            >
              {n}
            </span>
            {n < 5 ? (
              <span
                aria-hidden
                className={cn(
                  "h-px w-4 sm:w-8",
                  isPast
                    ? isAccent
                      ? "bg-accent/30"
                      : "bg-ist/30"
                    : "bg-subtle",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * PhaseStart — the editorial opening screen of a phase, shown once on entry
 * before its work steps (gated by usePhaseStartGate in PhaseContainer). Reusable
 * across phases via props; the phase-specific artwork is passed as the `motif`
 * slot. The big headline is the page h1; the motif is decorative (aria-hidden),
 * so the screen is fully understandable without it. A gentle, reduced-motion-safe
 * entrance fades the text and artwork in.
 */
export function PhaseStart({
  phaseNumber,
  phaseName,
  eyebrow,
  heading,
  intro,
  accent,
  motif,
  ctaLabel,
  onStart,
  onBack,
}: PhaseStartProps) {
  return (
    <section
      aria-labelledby="phase-start-heading"
      className="mx-auto flex min-h-full w-full max-w-5xl flex-col justify-center px-1 py-6 sm:py-10"
    >
      <PhaseTrail current={phaseNumber} accent={accent} />

      <div className="mt-10 grid items-center gap-10 lg:mt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div className="motion-safe:animate-[phase-rise_600ms_ease-out_both]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
            {eyebrow}
          </p>
          <h1
            id="phase-start-heading"
            className="mt-4 font-serif text-[2rem] leading-[1.08] text-foreground sm:text-5xl"
          >
            {heading}
          </h1>
          <p className="mt-5 max-w-prose text-base leading-relaxed text-muted sm:text-lg">
            {intro}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
            <Button
              size="lg"
              onClick={onStart}
              aria-label={`${ctaLabel} — ${phaseName} beginnen`}
            >
              {ctaLabel}
              <ArrowRight />
            </Button>
            {onBack ? (
              <Button variant="ghost" onClick={onBack}>
                Zurück
              </Button>
            ) : null}
          </div>
        </div>

        <div className="motion-safe:animate-[phase-rise_700ms_ease-out_120ms_both]">
          {motif}
        </div>
      </div>
    </section>
  );
}
