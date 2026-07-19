import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { GoalComponents } from "@/features/session/types";
import { cn } from "@/lib/utils";

const SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const DEFAULT_COMPONENTS: GoalComponents = {
  futurII: false,
  adressat: false,
  terminiert: false,
  kontextbezug: false,
  loesungsfrei: false,
  emotionalAttraktiv: 0,
  selbstErreichbar: 0,
};

/**
 * The four yes/no criteria of the method (criteria 3–6; the two scales are
 * criteria 1–2). `loesungsfrei` stays in the type (persistence contract) but
 * is no longer part of the UI — the method has exactly six criteria.
 */
type BoolComponentKey = "kontextbezug" | "terminiert" | "adressat" | "futurII";

const BOOL_CRITERIA: {
  key: BoolComponentKey;
  number: number;
  label: string;
  explanation: ReactNode;
}[] = [
  {
    key: "kontextbezug",
    number: 3,
    label: "Bezug zum Kernthema",
    explanation: (
      <>
        Worauf bezieht sich dein Gefühl? Auf welchen Kontext richtet sich dein
        Gefühl? Bitte überprüfe einmal, ob dein Ziel sich auf dein „Cluster 10“,
        also dein Hauptproblem, bezieht. Ist das nicht der Fall, so kann es
        sein, dass du vielleicht deine Bewertung aus Phase 1 revidieren
        solltest. Oder dein Ziel stimmt noch nicht so richtig, weil dein
        Hauptproblem damit nicht gelöst ist.
      </>
    ),
  },
  {
    key: "terminiert",
    number: 4,
    label: "Terminiert",
    explanation: (
      <>
        Der Zeitpunkt soll der Zeitpunkt sein, zu dem du dein Ziel erreicht
        haben willst. Falls dir schwer fällt, das festzulegen, so überprüfe
        einmal, ob es bereits feststehende Termine gibt, die auf dein Ziel
        einwirken. Gib dir nicht zu wenig Zeit, aber auch nicht zu viel. Du
        kannst den Zeitpunkt auch später nochmal anpassen, nachdem du deine
        Maßnahmen entwickelt hast.
      </>
    ),
  },
  {
    key: "adressat",
    number: 5,
    label: "Adressat",
    explanation: (
      <>
        Der Adressat deines Ziels bist{" "}
        <strong className="font-semibold text-foreground">du selbst</strong>.
        Oft ist es sinnvoll, die eigene Rolle oder Funktion im Ziel zu
        beschreiben. Z. B. „Ich als Führungskraft“ ist etwas anderes als „Ich
        als Partner*in“.
      </>
    ),
  },
  {
    key: "futurII",
    number: 6,
    label: "Futur II",
    explanation: (
      <>
        Wenn du die Satzstruktur übernommen hast, dann steckt das „Futur II“
        schon drin. Das Futur II verwendet man, um einen in der Zukunft{" "}
        <strong className="font-semibold text-foreground">
          abgeschlossenen Zustand
        </strong>{" "}
        zu beschreiben – eine besonders wirkungsvolle Form für einen Zielsatz.
      </>
    ),
  },
];

/**
 * Phase 2, Step 2.3 — Zielprüfung. The assembled mantra on top (read-only),
 * then the method's exactly six quality criteria, each with a collapsible
 * explanation: two 1–10 scales (emotional attraktiv, selbst erreichbar — the
 * 10/10 stopper gates forward) and four yes/no checks (Kernthema-Bezug,
 * terminiert, Adressat, Futur II — soft, no hard block). Below-10 impulses and
 * the "Ziel anpassen" way back to 2.2 stay.
 */
export function Step3Zielpruefung({ nav }: { nav: PhaseNavigation }) {
  const components =
    useSessionStore((s) => s.session?.phase2.components) ?? DEFAULT_COMPONENTS;
  const goalText = useSessionStore((s) => s.session?.phase2.goalText ?? "");
  const datum = useSessionStore((s) => s.session?.phase2.datum ?? "");
  const clusterRef = useSessionStore((s) => s.session?.phase2.clusterRef ?? "");
  const coached = useSessionStore((s) => s.session?.meta.branch === "coached");
  const patch = useSessionStore((s) => s.patch);

  function setComponents(partial: Partial<GoalComponents>) {
    patch((s) => ({
      ...s,
      phase2: {
        ...s.phase2,
        components: { ...s.phase2.components, ...partial },
      },
    }));
  }

  const { emotionalAttraktiv, selbstErreichbar } = components;
  const canNext = emotionalAttraktiv === 10 && selbstErreichbar === 10;

  // Status-Board (VIS-2): der Zustand aller sechs Kriterien in Kachel-Reihenfolge.
  const doneFlags = [
    emotionalAttraktiv === 10,
    selbstErreichbar === 10,
    ...BOOL_CRITERIA.map((item) => Boolean(components[item.key])),
  ];
  const doneCount = doneFlags.filter(Boolean).length;

  /** Contextual note nudging a checklist item from earlier input. */
  function contextNote(key: BoolComponentKey): string | null {
    if (key === "terminiert" && datum) return "Datum ist gesetzt.";
    if (key === "kontextbezug" && clusterRef)
      return `Kernthema: „${clusterRef}“.`;
    return null;
  }

  return (
    <div>
      <div className="space-y-6">
        {/* The assembled mantra — check what actually stands there. */}
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-faint">
            Dein Zielsatz
          </p>
          {goalText.trim() ? (
            <p className="mt-2 font-medium leading-relaxed break-words text-foreground">
              {goalText.trim()}
            </p>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-muted">
                Noch kein Zielsatz — geh einen Schritt zurück und stelle ihn
                zusammen.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => nav.goTo(2, 1)}
              >
                Zum Zielsatz
              </Button>
            </div>
          )}
        </div>

        {/* Status-Board-Kopf (VIS-2): Fortschritt x/6 sichtbar. */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">
            Prüfe dein Ziel in Ruhe — sechs Qualitätskriterien.
          </p>
          <p
            aria-label={`${doneCount} von 6 Kriterien erfüllt`}
            className="flex items-center gap-1.5"
          >
            <span aria-hidden className="flex gap-1">
              {doneFlags.map((done, index) => (
                <span
                  key={index}
                  className={cn(
                    "size-2.5 rounded-full",
                    done
                      ? "bg-green-400"
                      : "border border-faint bg-transparent",
                  )}
                />
              ))}
            </span>
            <span className="text-sm font-medium tabular-nums text-foreground">
              {doneCount}/6
            </span>
          </p>
        </div>

        {/* Criteria 1 + 2 — the two scales (10/10 stopper) */}
        <Criterion
          number={1}
          title="Emotional attraktiv"
          done={emotionalAttraktiv === 10}
          statusBadge={
            <ScaleTargetBadge value={emotionalAttraktiv} label="Ziel: 10/10" />
          }
        >
          <Scale
            label="Wie emotional attraktiv ist dieses Ziel für dich? (1–10)"
            ariaLabel="Emotional attraktiv von 1 bis 10"
            value={emotionalAttraktiv}
            onChange={(value) => setComponents({ emotionalAttraktiv: value })}
          />
          {emotionalAttraktiv >= 1 && emotionalAttraktiv < 10 ? (
            <Impulse>
              Was müsste sich am Ziel ändern, damit es für dich eine glatte 10
              wird?
            </Impulse>
          ) : null}
          <Explanation>
            Ist dein Ziel für dich attraktiv – dann bekommt es 10 von 10
            Punkten. Ist das nicht der Fall, dann überprüfe einmal, ob du andere
            Worte verwenden möchtest, ohne dabei die Struktur des Satzes zu
            verändern.
          </Explanation>
          {/* Rahmensatz der Vorlage — sichtbar (VOICE-1). */}
          <p className="text-sm text-muted">
            Ist dein Ziel nicht attraktiv für dich, wird es keine Motivation,
            keine Bewegung auslösen. Auch wenn es „nur“ um einen Satz geht, lass
            dir Zeit und spüre vor allem, ob er sich richtig für dich anfühlt.
          </p>
        </Criterion>

        <Criterion
          number={2}
          title="Selbst erreichbar"
          done={selbstErreichbar === 10}
          statusBadge={
            <ScaleTargetBadge value={selbstErreichbar} label="Ziel: 10/10" />
          }
        >
          <Scale
            label="Wie sehr liegt die Erreichung in deiner eigenen Hand? (1–10)"
            ariaLabel="Selbst erreichbar von 1 bis 10"
            value={selbstErreichbar}
            onChange={(value) => setComponents({ selbstErreichbar: value })}
          />
          {selbstErreichbar >= 1 && selbstErreichbar < 10 ? (
            <Impulse>
              Was davon liegt wirklich in deiner Hand? Formuliere das Ziel so,
              dass du es aus eigener Kraft erreichen kannst.
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => nav.goTo(2, 1)}
              >
                Ziel anpassen
              </Button>
            </Impulse>
          ) : null}
          <Explanation>
            Ist der Satz so formuliert, dass du dein Ziel selbst aus deiner
            Initiative heraus erreichen kannst. Oder hast du eine Abhängigkeit
            hineinformuliert? Das bedeutet nicht, du musst dein Ziel alleine
            erreichen. Doch ein Satz wie „Ab dem … werde ich Zufriedenheit mit
            meiner erfolgreichen Bewerbung auf einen neuen Arbeitsplatz erreicht
            haben“ ist so formuliert, dass{" "}
            <strong className="font-semibold text-foreground">andere</strong>{" "}
            darüber entscheiden, ob ich eingestellt werde. Dieses Ziel ist nicht
            selbst erreichbar. Falls das der Fall ist, überprüfe einmal, wie du
            dein Ziel so formulieren kannst, dass der Satz unabhängig von
            Entscheidungen anderer gilt.
          </Explanation>
        </Criterion>

        {/* Criteria 3–6 — the four yes/no checks (soft) */}
        {BOOL_CRITERIA.map((item) => {
          const checked = Boolean(components[item.key]);
          const note = contextNote(item.key);
          return (
            <Criterion
              key={item.key}
              number={item.number}
              title={item.label}
              done={checked}
            >
              <label
                htmlFor={`comp-${item.key}`}
                className="flex cursor-pointer items-start gap-3"
              >
                <input
                  id={`comp-${item.key}`}
                  type="checkbox"
                  checked={checked}
                  onChange={(event) =>
                    setComponents({
                      [item.key]: event.target.checked,
                    } as Partial<GoalComponents>)
                  }
                  className="mt-0.5 size-4 shrink-0 accent-accent"
                />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-foreground">erfüllt</span>
                    {!checked ? (
                      <span className="text-xs text-amber-600">noch offen</span>
                    ) : null}
                  </span>
                  {note ? (
                    <span className="mt-0.5 block text-xs text-accent">
                      {note}
                    </span>
                  ) : null}
                </span>
              </label>
              <Explanation>{item.explanation}</Explanation>
            </Criterion>
          );
        })}

        {!canNext ? (
          <p className="text-sm text-faint">
            „Weiter“ öffnet sich, wenn beide Skalen auf 10 stehen — ein Ziel,
            das dich wirklich zieht und das du selbst erreichen kannst.
          </p>
        ) : null}

        <div className="rounded-xl border border-subtle bg-surface-2 p-4">
          <p className="text-sm text-muted">
            Wenn du mit deinem Ziel einverstanden bist, sorge bitte dafür, dass
            der Satz dir im weiteren Verlauf deines{" "}
            {coached ? "Coachings" : "Selbstcoachings"} stets vor Augen ist.
          </p>
        </div>
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

/**
 * One quality criterion — numbered status tile (VIS-2): the border, the
 * number chip and a check mark show erfüllt/offen at a glance; the control
 * and the collapsible explanation live inside.
 */
function Criterion({
  number,
  title,
  done,
  statusBadge,
  children,
}: {
  number: number;
  title: string;
  done: boolean;
  /** Optional extra status element (e.g. the 10/10 target badge). */
  statusBadge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={`Kriterium ${number}: ${title} — ${done ? "erfüllt" : "offen"}`}
      className={cn(
        "space-y-3 rounded-xl border p-4",
        done ? "border-green-200 bg-green-50/40" : "border-subtle bg-surface",
      )}
    >
      <h3 className="flex flex-wrap items-center gap-2">
        <span
          aria-hidden
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            done ? "bg-green-400 text-white" : "bg-surface-2 text-faint",
          )}
        >
          {done ? <Check className="size-3" /> : number}
        </span>
        <span className="text-sm font-medium text-foreground">{title}</span>
        {statusBadge}
      </h3>
      {children}
    </section>
  );
}

/** The visible 10/10 condition on a scale tile (the stopper, VIS-2). */
function ScaleTargetBadge({ value, label }: { value: number; label: string }) {
  const done = value === 10;
  return (
    <span
      className={cn(
        "ml-auto rounded-full px-2 py-0.5 text-xs font-medium",
        done ? "bg-green-400/15 text-green-800" : "bg-amber-50 text-amber-800",
      )}
    >
      {done ? "10/10 ✓" : value >= 1 ? `${value}/10 — ${label}` : label}
    </span>
  );
}

/** Collapsible method explanation for a criterion. */
function Explanation({ children }: { children: ReactNode }) {
  return (
    <details className="group">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-accent">
        <ChevronDown
          className="size-3.5 motion-safe:transition-transform group-open:rotate-180"
          aria-hidden
        />
        Worauf achten?
      </summary>
      <p className="mt-2 text-sm text-muted">{children}</p>
    </details>
  );
}

/** A single 1–10 button scale (keyboard- and screenreader-accessible). */
function Scale({
  label,
  ariaLabel,
  value,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-foreground">{label}</p>
      <div
        role="group"
        aria-label={ariaLabel}
        className="flex flex-wrap gap-1.5"
      >
        {SCALE.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={value === n}
            aria-label={`${n} von 10`}
            onClick={() => onChange(n)}
            className={cn(
              "size-9 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              value === n
                ? "bg-accent text-white"
                : "bg-surface-2 text-muted hover:text-foreground",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

/** A calm sharpening impulse shown below an under-10 scale. */
function Impulse({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-subtle bg-surface-2 p-4 text-sm text-foreground">
      {children}
    </div>
  );
}
