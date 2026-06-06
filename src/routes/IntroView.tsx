import {
  Anchor,
  ArrowRight,
  MapPin,
  Route,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { BRANDING } from "@/config/branding";
import { INTRO_SEEN_KEY } from "@/config/constants";
import { setKvFlag } from "@/features/session/sessionRepository";
import { cn } from "@/lib/utils";

/** The two intro paragraphs (verbatim). */
const INTRO_PARAGRAPHS = [
  "Ein Selbstcoaching nach den Grundsätzen der Neuen Hamburger Schule funktioniert deshalb so gut, weil das Coaching einem logischen Prozess folgt. Dieser Prozess folgt dem sogenannten Rubikon-Modell der Veränderung.",
  "Das Rubikon-Modell der Veränderung zeigt die verschiedenen Schritte und Phasen, nach denen eine Veränderung sinnvollerweise erfolgt.",
];

type Station = {
  n: number;
  /** "ist" carries the pink IST accent; "calm" uses the persona accent. */
  tone: "ist" | "calm";
  icon: LucideIcon;
  title: string;
  text: string;
};

/** The five stations of the journey (verbatim text). */
const STATIONS: Station[] = [
  {
    n: 1,
    tone: "ist",
    icon: MapPin,
    title: "Ist-Situation",
    text: "Der Prozess beginnt mit einer konsequenten Analyse der Ist-Situation und einem Festhalten der Aspekte, Personen und ihrer Wechselwirkungen. Dann weißt du, wo du wirklich stehst, was dich bewegt und wo der Schuh am meisten drückt. Du kennst die Zusammenhänge und die Wechselwirkungen in deiner Situation.",
  },
  {
    n: 2,
    tone: "calm",
    icon: Target,
    title: "Attraktives Ziel",
    text: "Als Nächstes beschäftigt dich die Frage, wo du hin möchtest — die Frage nach dem Ziel. Welchen Zustand strebst du an, und welche Auswirkungen hat dein angestrebter Zustand auf dein Umfeld und dein System? Dann weißt du, wo du stehst und wo du hin möchtest.",
  },
  {
    n: 3,
    tone: "calm",
    icon: Sparkles,
    title: "Ressourcen",
    text: "Es folgt die Analyse deiner Ressourcen, um zum Ziel zu gelangen. Um zum Ziel zu gelangen, brauchst du — wie bei einer Reise — bestimmte Ressourcen. Deine Ressourcenidentifikation fokussiert sich vor allem auf die eigenen inneren Ressourcen. Am Schluss fasst du zusammen, wie du dich bisher verhalten hast und was du in Zukunft vermeiden musst, um nicht wieder in die gleiche Situation zurückzufallen.",
  },
  {
    n: 4,
    tone: "calm",
    icon: Route,
    title: "Handlungsplan",
    text: "Wenn du einen Überblick über deine Ressourcen hast, weißt, wo du stehst und wo du hin willst, geht es zum Handlungsplan. Deinen Handlungsplan entwickelst du konsequent anhand der Struktur, nach der du deine Ist-Situation analysiert hast.",
  },
  {
    n: 5,
    tone: "calm",
    icon: Anchor,
    title: "Nachhaltigkeit",
    text: "Wenn du dann weißt, was du vorhast, gilt es schlussendlich, die Nachhaltigkeit zu sichern und dir zu überlegen, wie du dranbleibst und deinen Plan tatsächlich in die Realität umsetzt.",
  },
];

/**
 * /einfuehrung — shell-free, persona "Ruhig". Explains the self-coaching process
 * along the Rubikon model of change as a five-station journey (the 5+1 phases).
 * Shown once before the first self session (introSeen flag in SessionRoute) and
 * re-callable from the Hilfe drawer. Both actions mark it seen and go on to the
 * session. Self-coaching specific — the coached branch never sees it.
 */
export function IntroView() {
  const navigate = useNavigate();

  /** Mark the intro seen and continue to the session. */
  function proceed() {
    void setKvFlag(INTRO_SEEN_KEY, true);
    navigate("/session");
  }

  return (
    <div
      data-persona="ruhig"
      className="min-h-dvh bg-background text-foreground"
    >
      <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        <header className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-faint">
            {BRANDING.methodLabel}
          </p>
          <h1 className="mt-2 font-serif text-3xl text-foreground sm:text-4xl">
            Der Weg deiner Veränderung
          </h1>
          <div className="mx-auto mt-4 max-w-2xl space-y-3 text-muted">
            {INTRO_PARAGRAPHS.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </header>

        {/* The five stations as a path: horizontal on desktop, vertical on mobile. */}
        <ol
          aria-label="Die fünf Phasen des Rubikon-Modells der Veränderung"
          className="relative mt-12 grid gap-8 lg:grid-cols-5 lg:gap-x-3"
        >
          {/* Connecting path — decorative (vertical on mobile, horizontal on lg). */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-5 top-5 bottom-5 w-px bg-subtle lg:inset-x-[10%] lg:top-5 lg:bottom-auto lg:h-px lg:w-auto"
          />

          {STATIONS.map((station) => (
            <li
              key={station.n}
              className="relative flex items-start gap-4 lg:flex-col lg:items-center lg:gap-3 lg:text-center"
            >
              <div
                className={cn(
                  "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border",
                  station.tone === "ist"
                    ? "border-ist/40 bg-pink-50 text-ist"
                    : "border-accent/30 bg-accent/10 text-accent",
                )}
              >
                <station.icon className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-faint">
                  Schritt {station.n}
                </p>
                <h2 className="mt-0.5 font-serif text-lg text-foreground">
                  {station.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {station.text}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-subtle pt-6">
          <Button variant="ghost" onClick={proceed}>
            Überspringen
          </Button>
          <Button onClick={proceed} aria-label="Los geht's — zur Sitzung">
            Los geht’s
            <ArrowRight />
          </Button>
        </footer>
      </main>
    </div>
  );
}
