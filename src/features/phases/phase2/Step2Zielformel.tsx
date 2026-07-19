import { useState, type ReactNode } from "react";

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

/** The editable mantra segments (Kernthema comes from Phase 1, read-only). */
type SegmentKey = "datum" | "rolle" | "gefuehl";

/** Segment colour language: field marker + sentence chip share one tone. */
const SEGMENT_TONES: Record<
  SegmentKey | "kernthema",
  { chip: string; activeRing: string; dot: string }
> = {
  datum: {
    chip: "bg-blue-50 text-blue-900",
    activeRing: "ring-2 ring-blue-400",
    dot: "bg-blue-400",
  },
  rolle: {
    chip: "bg-teal-100 text-teal-900",
    activeRing: "ring-2 ring-teal-600",
    dot: "bg-teal-600",
  },
  gefuehl: {
    chip: "bg-green-50 text-green-900",
    activeRing: "ring-2 ring-green-400",
    dot: "bg-green-400",
  },
  // Das Kernthema IST der Bezug zur Ist-Situation aus Phase 1 → ist-Ton.
  kernthema: {
    chip: "bg-ist/10 text-ist",
    activeRing: "ring-2 ring-ist",
    dot: "bg-ist",
  },
};

/** One coloured building block inside the live mantra sentence (VIS-2). */
function MantraChip({
  tone,
  active,
  filled,
  children,
}: {
  tone: SegmentKey | "kernthema";
  active?: boolean;
  filled: boolean;
  children: ReactNode;
}) {
  const t = SEGMENT_TONES[tone];
  return (
    <span
      className={cn(
        "inline-block rounded-md px-1.5 py-0.5 transition-shadow",
        t.chip,
        !filled && "italic opacity-70",
        active && t.activeRing,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Anmoderation (MP2-REV, wortgetreu) — sichtbarer Coaching-Text (VOICE-1),
 * K1: in drei Sinnabsätze + einen Handlungs-Absatz gesetzt. „dem obigen
 * Muster" ist Pflicht-Wortlaut aus der Methodik-Vorlage; die Muster-Zeile
 * wird direkt darunter gerendert (wie schon in MP2-REV).
 */
const INTRO_ABSAETZE: ReactNode[] = [
  "Du hast nun eine Vorstellung deiner positiven neuen Situation. Vermutlich wirst du dir die Stichworte aus deinem Brainstorming nicht alle einfach so merken können.",
  <>
    Deshalb geht es nun darum, dass du dir einen Satz zurechtlegst, der für dich
    wie eine Art{" "}
    <strong className="font-semibold text-foreground">Mantra</strong> dienen
    kann. Der in einem Satz beschreibt, wonach du strebst.
  </>,
  "Damit der Satz für dich gut funktioniert, sollen Qualitätsmerkmale unterstützen, die du leicht selbst überprüfen kannst.",
  <>
    Bitte beginne damit, dass du dein erstrebenswertes Gefühl (als{" "}
    <strong className="font-semibold text-foreground">Substantiv</strong>, also
    z. B.{" "}
    <strong className="font-semibold text-foreground">„Gelassenheit“</strong>{" "}
    statt „gelassen“) identifizierst. Formuliere dann bitte einen Satz, der dem
    obigen Muster entspricht.
  </>,
];

/** Muster-Zeile (MP2-REV, wortgetreu) — sichtbar unter der Anmoderation. */
const MUSTER =
  "Muster: Ab dem DATUM werde ich (in meiner Funktion als …) das POSITIVE GEFÜHL in Bezug auf „mein Hauptproblem“ erreicht haben.";

/**
 * Phase 2, Step 2.2 — Mein Zielsatz. The mantra builder following the method's
 * fixed pattern, VIS-2: the sentence is rendered from COLOURED BUILDING
 * BLOCKS (chips) — focusing an input lights up its chip, so the field ↔
 * sentence-segment mapping is visible; each field label carries the matching
 * colour dot. The FEELING (a noun, prefilled from 2.1) is the core; the role
 * bracket disappears entirely when empty (it shows while its field has
 * focus, so the mapping stays visible). Every building-block change
 * re-assembles and persists phase2.goalText (the full sentence). Forward is
 * gated on gefuehl + datum. No AI here.
 */
export function Step2Zielformel({ nav }: { nav: PhaseNavigation }) {
  const datum = useSessionStore((s) => s.session?.phase2.datum ?? "");
  const rolle = useSessionStore((s) => s.session?.phase2.rolle ?? "");
  const gefuehl = useSessionStore((s) => s.session?.phase2.gefuehl ?? "");
  const patch = useSessionStore((s) => s.patch);
  const core = useCoreTheme();
  const label = coreThemeLabel(core);
  // Which input has focus → its sentence chip lights up (VIS-2 mapping).
  const [focusSegment, setFocusSegment] = useState<SegmentKey | null>(null);

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

  /** Focus handlers wiring an input to its sentence chip. */
  const focusProps = (segment: SegmentKey) => ({
    onFocus: () => setFocusSegment(segment),
    onBlur: () =>
      setFocusSegment((current) => (current === segment ? null : current)),
  });

  return (
    <div>
      <div className="space-y-5">
        {/* Die vollständige Mantra-Anmoderation + Muster-Zeile — SICHTBAR
            (VOICE-1: MP2-REV-Anmoderationen sind nie zugeklappt). */}
        <div className="max-w-prose space-y-2 text-muted">
          {INTRO_ABSAETZE.map((absatz, index) => (
            <p key={index}>{absatz}</p>
          ))}
        </div>
        <p className="text-sm font-medium text-foreground">{MUSTER}</p>

        {/* Der Zielsatz aus farbigen Bausteinen (VIS-2) — Fokus im Feld lässt
            den zugehörigen Baustein aufleuchten. */}
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-faint">
            Dein Zielsatz
          </p>
          <p className="mt-2 leading-relaxed text-muted">
            Ab dem{" "}
            <MantraChip
              tone="datum"
              active={focusSegment === "datum"}
              filled={Boolean(datum)}
            >
              {datum ? formatGermanDate(datum) : "Datum"}
            </MantraChip>{" "}
            werde ich{" "}
            {rolle.trim() || focusSegment === "rolle" ? (
              <>
                in meiner Funktion als{" "}
                <MantraChip
                  tone="rolle"
                  active={focusSegment === "rolle"}
                  filled={Boolean(rolle.trim())}
                >
                  {rolle.trim() || "Rolle"}
                </MantraChip>{" "}
              </>
            ) : null}
            <MantraChip
              tone="gefuehl"
              active={focusSegment === "gefuehl"}
              filled={Boolean(gefuehl.trim())}
            >
              {gefuehl.trim() || "Gefühl"}
            </MantraChip>{" "}
            in Bezug auf{" "}
            <MantraChip tone="kernthema" filled>
              {label}
            </MantraChip>{" "}
            erreicht haben.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Datum"
            dot={SEGMENT_TONES.datum.dot}
            htmlFor="phase2-datum"
            hint="Wann willst du es erreicht haben?"
          >
            <input
              id="phase2-datum"
              type="date"
              value={datum}
              {...focusProps("datum")}
              onChange={(event) => setField({ datum: event.target.value })}
              className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </Field>

          <Field
            label="Gefühl"
            dot={SEGMENT_TONES.gefuehl.dot}
            htmlFor="phase2-gefuehl"
            hint="Als Substantiv, z. B. „Gelassenheit“ statt „gelassen“."
          >
            <input
              id="phase2-gefuehl"
              type="text"
              value={gefuehl}
              {...focusProps("gefuehl")}
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
          dot={SEGMENT_TONES.rolle.dot}
          htmlFor="phase2-rolle"
          hint="Ist sie leer, entfällt der Einschub „in meiner Funktion als …“ komplett."
        >
          <input
            id="phase2-rolle"
            type="text"
            value={rolle}
            {...focusProps("rolle")}
            onChange={(event) => setField({ rolle: event.target.value })}
            placeholder="z. B. Teamleitung"
            className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </Field>

        <div className="rounded-lg border border-subtle bg-surface-2 px-3 py-2 text-sm">
          <span
            aria-hidden
            className={cn(
              "mr-1.5 inline-block size-2.5 rounded-full",
              SEGMENT_TONES.kernthema.dot,
            )}
          />
          <span className="text-muted">Bezug zum Kernthema: </span>
          <span className="font-medium text-foreground">{label}</span>
        </div>

        <div className="rounded-xl border border-subtle bg-surface-2 p-4">
          <p className="text-sm text-muted">
            Lies ihn dir{" "}
            <strong className="font-semibold text-foreground">laut</strong> vor
            und spüre, ob er in dir ein gutes Gefühl auslöst.
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

/** Small labelled field wrapper with the segment colour dot + optional hint. */
function Field({
  label,
  dot,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  /** Colour-dot class matching the sentence chip (field ↔ segment mapping). */
  dot?: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 text-sm font-medium text-foreground"
      >
        {dot ? (
          <span
            aria-hidden
            className={cn("size-2.5 shrink-0 rounded-full", dot)}
          />
        ) : null}
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-faint">{hint}</p> : null}
    </div>
  );
}
