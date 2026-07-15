import type { PhaseId } from "@/features/session/types";
import {
  BoatSymbol,
  CloudSymbol,
  FlagSymbol,
  SuitcaseSymbol,
  SunSymbol,
} from "@/components/icons/PhaseSymbols";

/**
 * Visual-Baukasten (VIS-2): der Schritt-Kopf mit dem Phasensymbol aus der
 * Rubikon-Bildsprache (Wolke/Sonne/Koffer/Schiff/Fahne) + Phasen-Eyebrow,
 * Titel, Schrittzähler und höchstens EINEM kurzen Einleitungsabsatz.
 * Zentral vom PhaseContainer gerendert, damit jeder Schritt das Symbol
 * konsistent trägt. Phase 0 hat kein Reise-Symbol (Vereinbarung).
 */
export function SectionHead({
  phase,
  eyebrow,
  title,
  stepLine,
  intro,
}: {
  phase: PhaseId;
  eyebrow: string;
  title: string;
  stepLine: string;
  intro?: string;
}) {
  const symbol =
    phase === 1 ? (
      <CloudSymbol className="size-7 text-ist" />
    ) : phase === 2 ? (
      <SunSymbol className="size-7 text-accent" />
    ) : phase === 3 ? (
      <SuitcaseSymbol className="size-7 text-accent" />
    ) : phase === 4 ? (
      <BoatSymbol className="size-7 text-accent" />
    ) : phase === 5 ? (
      <FlagSymbol className="size-7 text-accent" />
    ) : null;

  return (
    <header className="mb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-faint">
            {eyebrow}
          </p>
          <h2 className="mt-1 font-serif text-2xl text-foreground sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-xs text-muted">{stepLine}</p>
        </div>
        {symbol ? (
          <span
            aria-hidden
            className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-2"
          >
            {symbol}
          </span>
        ) : null}
      </div>
      {intro ? <p className="mt-3 text-muted">{intro}</p> : null}
    </header>
  );
}
