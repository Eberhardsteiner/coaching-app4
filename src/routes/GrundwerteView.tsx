import {
  ArrowLeft,
  ArrowRight,
  Feather,
  Lock,
  SlidersHorizontal,
  Sprout,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { BRANDING } from "@/config/branding";
import { INTRO_SEEN_KEY } from "@/config/constants";
import { METHOD_LABELS } from "@/config/method";
import { setKvFlag } from "@/features/session/sessionRepository";

/** Intro paragraph (verbatim; method label bundled in METHOD_LABELS). */
const INTRO = `Auch ein Selbstcoaching mit einer App gehorcht bestimmten Prämissen und folgt den in ${METHOD_LABELS.standardShort}-Coaching festgelegten Grundwerten, an denen sich die App orientiert.`;

type Value = { icon: LucideIcon; title: string; text: string };

/** The four values (verbatim text). */
const VALUES: Value[] = [
  {
    icon: Lock,
    title: "Vertraulichkeit",
    text: "Wichtig ist zunächst die Vertraulichkeit. Wir haben sehr auf die DSGVO-Konformität geachtet und sichern damit innerhalb des Systems Vertraulichkeit zu. Wenn du dich an den Coach wenden möchtest, hat dieser über die App die Möglichkeit, in deine bisherigen Ergebnisse Einblick zu erhalten — und ist seinerseits bzw. ihrerseits wiederum der Vertraulichkeit verpflichtet. Sofern du aus der App heraus einen Ausflug in die KI-Welt unternimmst, wirst du ausdrücklich aufgefordert, der KI-Nutzung zuzustimmen. Dies geschieht nie ohne deine Einwilligung.",
  },
  {
    icon: Feather,
    title: "Freiheit",
    text: "Du unternimmst dein Selbstcoaching freiwillig. Du hast die Freiheit, deine Themen zu wählen und Entscheidungen zu treffen. Die Coaching-App beeinflusst dich in deinen Entscheidungen nicht, sondern verhält sich als dein neutraler Begleiter durch den Prozess.",
  },
  {
    icon: Sprout,
    title: "Ressourcenverfügbarkeit",
    text: "Du kannst dich selbst coachen, weil du über alle inneren Ressourcen verfügst, um dein Thema so zu lösen, wie es zu dir und deiner Persönlichkeit passt. Das kann niemand besser als du selbst.",
  },
  {
    icon: SlidersHorizontal,
    title: "Selbststeuerung",
    text: "Dein Coaching beruht darauf, dass du dich in Bezug auf dein Anliegen selbst steuern kannst.",
  },
];

/** Effects intro sentence (verbatim; method label bundled). */
const EFFECTS_SENTENCE = `Von einem Selbstcoaching nach ${METHOD_LABELS.standardShort}-Standard darfst du dir erwarten, dass du neue Perspektiven gewinnst (obwohl kein Coach dabei ist!), dass du immer wieder Entscheidungen treffen wirst und damit Klarheit gewinnst, und dass du dir Maßnahmen erschließt, die neu sind und doch weiterbringen.`;

/** The three expectable effects (verbatim). */
const EFFECTS = [
  "Neue Perspektiven",
  "Entscheidungsfähigkeit",
  "Neue Handlungsoptionen",
];

/**
 * /grundwerte — shell-free, persona "Ruhig". Second orientation page (after the
 * Rubikon page): the self-coaching premises / values and the expectable effects.
 * Self-coaching specific; the coached branch never reaches it. "Los geht's"
 * marks the intro chain seen (introSeen) and starts the session; "Zurück" goes
 * back to /einfuehrung. No pink (no IST reference here).
 */
export function GrundwerteView() {
  const navigate = useNavigate();

  /** Finish the intro chain → mark seen + go to the session. */
  function start() {
    void setKvFlag(INTRO_SEEN_KEY, true);
    navigate("/session");
  }

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

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {/* Values */}
          <section className="lg:col-span-2">
            <h2 className="font-serif text-xl text-foreground">
              Auf diese Werte kannst du dich verlassen
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {VALUES.map((value) => (
                <li
                  key={value.title}
                  className="rounded-xl border border-subtle bg-surface p-4"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <value.icon className="size-4" aria-hidden />
                  </span>
                  <h3 className="mt-3 text-sm font-medium text-foreground">
                    {value.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {value.text}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Effects */}
          <section className="lg:col-span-1">
            <h2 className="font-serif text-xl text-foreground">
              Diese Wirkungen darfst du erwarten
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {EFFECTS_SENTENCE}
            </p>
            <ul className="mt-4 space-y-2">
              {EFFECTS.map((effect) => (
                <li key={effect} className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-full bg-accent"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {effect}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-subtle pt-6">
          <Button variant="ghost" onClick={() => navigate("/einfuehrung")}>
            <ArrowLeft />
            Zurück
          </Button>
          <Button onClick={start} aria-label="Los geht's — zur Sitzung">
            Los geht’s
            <ArrowRight />
          </Button>
        </footer>
      </main>
    </div>
  );
}
