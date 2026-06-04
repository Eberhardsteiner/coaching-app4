import { useEffect, useState } from "react";
import {
  ArrowRight,
  Feather,
  Lightbulb,
  Lock,
  SlidersHorizontal,
  Sprout,
  Telescope,
  Waypoints,
} from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { BRANDING } from "@/config/branding";
import { ImportButton } from "@/features/session/ImportButton";
import { listSessions } from "@/features/session/sessionRepository";

/** Expected effects of the process — one icon + title + sentence each. */
const BENEFITS = [
  {
    icon: Telescope,
    title: "Neue Perspektiven",
    text: "Den Blick weiten und das eigene Thema aus mehr als einem Winkel sehen.",
  },
  {
    icon: Lightbulb,
    title: "Entscheidungsfähigkeit",
    text: "Klarer erkennen, was wirklich zählt — und leichter ins Entscheiden kommen.",
  },
  {
    icon: Waypoints,
    title: "Neue Handlungsoptionen",
    text: "Konkrete nächste Schritte entwickeln, die zu dir und deinen Ressourcen passen.",
  },
];

/** Underlying values, shown as a quiet row. */
const VALUES = [
  { icon: Lock, label: "Vertraulichkeit" },
  { icon: Feather, label: "Freiheit" },
  { icon: Sprout, label: "Ressourcenverfügbarkeit" },
  { icon: SlidersHorizontal, label: "Selbststeuerung" },
];

/**
 * Landing page. Modern and calm (Less is more): one primary action
 * ("Coaching starten"), the WP1 secondary entries (resume — only when sessions
 * exist — and import), benefit cards, a values row and a footer with the legal
 * links. Pink stays reserved for IST states and is not used here.
 */
export function LandingPage() {
  const [hasSessions, setHasSessions] = useState(false);

  useEffect(() => {
    let active = true;
    void listSessions().then((sessions) => {
      if (active) setHasSessions(sessions.length > 0);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-background">
      {/* ---- Hero -------------------------------------------------------- */}
      <header className="relative isolate overflow-hidden bg-hero-gradient text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span
            className="animate-pulse-calm absolute left-[10%] top-[16%] size-48 rounded-full bg-green-200/20 ring-1 ring-white/10"
            style={{ animationDelay: "0s" }}
          />
          <span
            className="animate-pulse-calm absolute right-[12%] top-[24%] size-64 rounded-full bg-blue-400/20 ring-1 ring-white/10"
            style={{ animationDelay: "-3s" }}
          />
          <span
            className="animate-pulse-calm absolute bottom-[-3rem] left-1/3 size-52 rounded-full bg-teal-200/15 ring-1 ring-white/10"
            style={{ animationDelay: "-6s" }}
          />
        </div>

        <div className="relative mx-auto flex min-h-[88vh] w-full max-w-5xl flex-col px-6 py-8">
          {/* Wordmark */}
          <span className="font-serif text-lg tracking-wide">
            {BRANDING.appName}
          </span>

          {/* Hero content */}
          <div className="flex flex-1 flex-col justify-center py-16">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-100">
              {BRANDING.methodLabel}
            </p>
            <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[1.05] sm:text-6xl">
              Versteh dich.
              <br />
              Dann verändere dich.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-blue-100">
              Ein ruhiger, geführter Weg durch die Phasen eines systemischen
              Coachings — in deinem Tempo.
            </p>

            <div className="mt-10 flex flex-col items-start gap-5">
              <Button asChild size="lg">
                <Link to="/start">
                  Coaching starten
                  <ArrowRight />
                </Link>
              </Button>

              <p className="text-sm text-blue-100/80">
                5+1 Phasen · vertraulich · läuft nur in deinem Browser
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                {hasSessions ? (
                  <Link
                    to="/sessions"
                    className="text-blue-100 underline-offset-4 hover:text-white hover:underline"
                  >
                    Sitzung fortsetzen
                  </Link>
                ) : null}
                <ImportButton
                  variant="link"
                  label="Sitzung importieren"
                  className="h-auto px-0 text-blue-100 hover:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ---- Benefits + values ------------------------------------------ */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-xl border border-subtle bg-surface p-6"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <benefit.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-medium text-foreground">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{benefit.text}</p>
            </div>
          ))}
        </div>

        <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted">
          {VALUES.map((value) => (
            <li key={value.label} className="inline-flex items-center gap-1.5">
              <value.icon className="size-4 text-accent" aria-hidden />
              {value.label}
            </li>
          ))}
        </ul>
      </section>

      {/* ---- Footer ------------------------------------------------------ */}
      <footer className="border-t border-subtle">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            {BRANDING.appName} · {BRANDING.methodLabel}
          </p>
          <nav
            aria-label="Rechtliche Hinweise"
            className="flex flex-wrap items-center gap-x-5 gap-y-2"
          >
            <Link
              to="/rechtliches"
              className="transition-colors hover:text-foreground"
            >
              Rechtliches
            </Link>
            <Link
              to="/datenschutz"
              className="transition-colors hover:text-foreground"
            >
              Datenschutz
            </Link>
            <Link
              to="/impressum"
              className="transition-colors hover:text-foreground"
            >
              Impressum
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
