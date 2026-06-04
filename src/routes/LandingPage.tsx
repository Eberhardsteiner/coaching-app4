import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { BRANDING } from "@/config/branding";
import { ImportButton } from "@/features/session/ImportButton";
import { listSessions } from "@/features/session/sessionRepository";

/**
 * Landing (placeholder). The full start page follows in WP2.
 *
 * Hero gradient + three calm pulsing circles, a large serif headline and a
 * single primary action ("Coaching starten" → /start). Subtle secondary
 * entries — "Sitzung fortsetzen" (only when saved sessions exist) and
 * "Sitzung importieren" — sit beneath it.
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
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-hero-gradient text-white">
      {/* Calm pulsing circles (decorative). */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span
          className="animate-pulse-calm absolute left-[10%] top-[18%] size-48 rounded-full bg-teal-200/25 ring-1 ring-white/15"
          style={{ animationDelay: "0s" }}
        />
        <span
          className="animate-pulse-calm absolute right-[12%] top-[26%] size-64 rounded-full bg-blue-400/20 ring-1 ring-white/10"
          style={{ animationDelay: "-3s" }}
        />
        <span
          className="animate-pulse-calm absolute bottom-[-4rem] left-1/3 size-52 rounded-full bg-white/10 ring-1 ring-white/15"
          style={{ animationDelay: "-6s" }}
        />
      </div>

      <main className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-20">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-100">
          {BRANDING.methodLabel}
        </p>
        <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-[1.05] sm:text-6xl">
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
      </main>

      <footer className="relative mx-auto w-full max-w-4xl px-6 pb-8 text-xs text-blue-100/70">
        {BRANDING.appName}
      </footer>
    </div>
  );
}
