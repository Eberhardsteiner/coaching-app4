import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Compass,
  Feather,
  KeyRound,
  Lock,
  Signpost,
  Telescope,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router";
import type { ReactNode } from "react";

import { SuitcaseSymbol } from "@/components/icons/PhaseSymbols";
import { Button } from "@/components/ui/button";
import { BRANDING } from "@/config/branding";
import { METHOD_LABELS } from "@/config/method";

/** Intro sentence (method label bundled in METHOD_LABELS). */
const INTRO = `Auch ein Selbstcoaching mit einer App gehorcht bestimmten Prämissen und folgt den im ${METHOD_LABELS.standardShort}-Coaching festgelegten Grundwerten.`;

type Value = {
  /** Lucide icon — or null for the shared suitcase symbol (Phase-3 imagery). */
  icon: LucideIcon | null;
  title: string;
  /** One condensed core sentence, always visible. */
  core: string;
  /** Details, collapsible (nothing lost — just off the surface). */
  details?: string[];
};

/** The four values — core sentence visible, details collapsible (MP1-REV). */
const VALUES: Value[] = [
  {
    icon: Lock,
    title: "Vertraulichkeit",
    core: "Deine Inhalte bleiben vertraulich — DSGVO-konform gesichert.",
    details: [
      "Wenn du dich an einen Coach wendest, kann er oder sie über die App Einblick in deine bisherigen Ergebnisse erhalten — und ist seinerseits bzw. ihrerseits der Vertraulichkeit verpflichtet.",
      "Ein Ausflug in die KI-Welt geschieht nie ohne deine ausdrückliche Einwilligung — du wirst vorher gefragt.",
    ],
  },
  {
    icon: Feather,
    title: "Freiheit",
    core: "Du wählst deine Themen und triffst deine Entscheidungen — freiwillig.",
    details: [
      "Die App beeinflusst dich in deinen Entscheidungen nicht, sondern verhält sich als dein neutraler Begleiter durch den Prozess.",
    ],
  },
  {
    icon: null, // Koffer — gleiche Bildsprache wie Phase 3 (Ressourcen).
    title: "Ressourcenverfügbarkeit",
    core: "Du verfügst über alle inneren Ressourcen, um dein Thema passend zu dir zu lösen.",
    details: ["Das kann niemand besser als du selbst."],
  },
  {
    icon: Compass,
    title: "Selbststeuerung",
    core: "Dein Coaching beruht darauf, dass du dich in Bezug auf dein Anliegen selbst steuern kannst.",
  },
];

type Effect = { icon: LucideIcon; title: string; text: string };

/**
 * The three expectable effects — the former intro sentence, split into the
 * column heading plus one card per effect (not repeated as running text).
 */
const EFFECTS: Effect[] = [
  {
    icon: Telescope,
    title: "Neue Perspektiven",
    text: "Du gewinnst neue Blickwinkel — obwohl kein Coach dabei ist!",
  },
  {
    icon: Signpost,
    title: "Entscheidungsfähigkeit",
    text: "Du triffst immer wieder Entscheidungen und gewinnst damit Klarheit.",
  },
  {
    icon: KeyRound,
    title: "Neue Handlungsoptionen",
    text: "Du erschließt dir Maßnahmen, die neu sind und doch weiterbringen.",
  },
];

/** Icon chip: lucide icon or the shared suitcase symbol (accent). */
function ValueIcon({ value }: { value: Value }) {
  return (
    <span className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
      {value.icon ? (
        <value.icon className="size-4" aria-hidden />
      ) : (
        <SuitcaseSymbol className="size-5" />
      )}
    </span>
  );
}

/** Collapsible details under a value's core sentence. */
function ValueDetails({ details }: { details: string[] }) {
  return (
    <details className="group mt-2">
      <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-accent">
        <ChevronDown
          className="size-3.5 motion-safe:transition-transform group-open:rotate-180"
          aria-hidden
        />
        Mehr dazu
      </summary>
      <div className="mt-1.5 space-y-1.5">
        {details.map((detail) => (
          <p key={detail} className="text-xs leading-relaxed text-muted">
            {detail}
          </p>
        ))}
      </div>
    </details>
  );
}

/** Shared two-column section shell. */
function Column({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-serif text-xl text-foreground">{heading}</h2>
      {children}
    </section>
  );
}

/**
 * /grundwerte — shell-free, persona "Ruhig". Second orientation page (after
 * the Rubikon page), following the method's "Werte | Wirkung" slide (MP1-REV):
 * two columns side by side (stacked on mobile) — left the four values you can
 * rely on (lock, feather, the SHARED suitcase symbol of Phase 3, compass),
 * each with one core sentence and collapsible details; right the three
 * expectable effects as symbol cards (telescope, signpost, key). Self-coaching
 * specific; "Weiter" continues to /anforderungen, "Zurück" to /einfuehrung.
 * No pink (no IST reference here).
 */
export function GrundwerteView() {
  const navigate = useNavigate();

  return (
    <div
      data-persona="ruhig"
      className="min-h-dvh bg-background text-foreground"
    >
      <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        <header>
          <p className="text-xs font-medium uppercase tracking-wider text-faint">
            {BRANDING.methodLabel}
          </p>
          <h1 className="mt-2 font-serif text-3xl text-foreground sm:text-4xl">
            Worauf du dich verlassen kannst
          </h1>
          <p className="mt-4 max-w-2xl text-muted">{INTRO}</p>
        </header>

        {/* Werte | Wirkung — zwei Spalten (Mobil untereinander). */}
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <Column heading="Auf diese Werte kannst du dich verlassen:">
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {VALUES.map((value) => (
                <li
                  key={value.title}
                  className="rounded-xl border border-subtle bg-surface p-4"
                >
                  <div className="flex items-start gap-3">
                    <ValueIcon value={value} />
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-foreground">
                        {value.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {value.core}
                      </p>
                      {value.details ? (
                        <ValueDetails details={value.details} />
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Column>

          <Column heading="Diese Wirkungen darfst du erwarten:">
            <ul className="mt-4 space-y-3">
              {EFFECTS.map((effect) => (
                <li
                  key={effect.title}
                  className="rounded-xl border border-accent/25 bg-accent/5 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <effect.icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-foreground">
                        {effect.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {effect.text}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Column>
        </div>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-subtle pt-6">
          <Button variant="ghost" onClick={() => navigate("/einfuehrung")}>
            <ArrowLeft />
            Zurück
          </Button>
          <Button
            onClick={() => navigate("/anforderungen")}
            aria-label="Weiter zu den Anforderungen"
          >
            Weiter
            <ArrowRight />
          </Button>
        </footer>
      </main>
    </div>
  );
}
