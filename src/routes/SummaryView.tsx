import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { Navigate, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { BRANDING } from "@/config/branding";
import * as repo from "@/features/session/sessionRepository";
import { useSessionStore } from "@/features/session/sessionStore";
import { SessionSummary } from "@/features/summary/SessionSummary";

type BootPhase = "booting" | "ready" | "redirect";

/**
 * Shell-free /zusammenfassung route: a clean, print-friendly page showing the
 * active session's summary. Reads the active session from the store; if none is
 * loaded (e.g. direct URL), it resumes the last active session, else redirects.
 * Only the chrome (header + buttons) is hidden in print via `print:hidden`, so
 * the print output is just the summary.
 */
export function SummaryView() {
  const session = useSessionStore((s) => s.session);
  const resume = useSessionStore((s) => s.resume);
  const navigate = useNavigate();

  const [phase, setPhase] = useState<BootPhase>(() =>
    useSessionStore.getState().session ? "ready" : "booting",
  );
  const bootedRef = useRef(false);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    async function boot() {
      if (useSessionStore.getState().session) {
        setPhase("ready");
        return;
      }
      const lastId = await repo.getLastActiveId();
      if (lastId && (await resume(lastId))) setPhase("ready");
      else setPhase("redirect");
    }
    void boot();
  }, [resume]);

  if (phase === "redirect") return <Navigate to="/start" replace />;

  if (phase === "booting" || !session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-sm text-muted">Zusammenfassung wird geladen …</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-subtle bg-surface px-4 py-3 print:hidden">
        <span className="font-serif text-lg text-foreground">
          {BRANDING.appName}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft />
            Zurück
          </Button>
          <Button
            size="sm"
            aria-label="Als PDF speichern"
            onClick={() => window.print()}
          >
            <Printer />
            Als PDF speichern
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <SessionSummary session={session} />
      </main>
    </div>
  );
}
