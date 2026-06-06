import { useEffect, useState } from "react";
import { Navigate } from "react-router";

import { AppShell } from "@/components/layout/AppShell";
import { INTRO_SEEN_KEY } from "@/config/constants";
import { ConsentGate } from "@/features/onboarding/ConsentGate";
import { getKvFlag } from "@/features/session/sessionRepository";
import { useSessionBootstrap } from "@/features/session/useSessionBootstrap";
import { useSessionStore } from "@/features/session/sessionStore";

/**
 * Route element for /session. Bootstraps the persisted session (create / resume
 * / redirect). Then:
 *   - consentAck === false → render the ConsentGate ONLY (no shell access yet);
 *   - consentAck === true, self branch, intro not yet seen → redirect once to
 *     the Rubikon intro page (/einfuehrung); the intro marks the flag and comes
 *     back here. The coached branch and returning users go straight in.
 *   - otherwise → render the AppShell (whose <Outlet /> shows the SessionView).
 *
 * The WP1 bootstrap/creation flow is unchanged — the gates are conditional steps.
 */
export function SessionRoute() {
  const phase = useSessionBootstrap();
  const consentAck = useSessionStore(
    (s) => s.session?.phase0.consentAck ?? false,
  );
  const branch = useSessionStore((s) => s.session?.meta.branch);

  // Intro flag (null = still reading). setState lives in the async callback.
  const [introSeen, setIntroSeen] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    void getKvFlag(INTRO_SEEN_KEY).then((seen) => {
      if (active) setIntroSeen(seen);
    });
    return () => {
      active = false;
    };
  }, []);

  if (phase === "redirect") {
    return <Navigate to="/start" replace />;
  }

  if (phase === "booting") {
    return <Loading />;
  }

  if (!consentAck) {
    return <ConsentGate />;
  }

  // Self branch: show the intro once (before the work view). Wait for the flag
  // to avoid a flash of the shell before redirecting.
  if (branch === "self") {
    if (introSeen === null) return <Loading />;
    if (!introSeen) return <Navigate to="/einfuehrung" replace />;
  }

  return <AppShell />;
}

function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <p className="text-sm text-muted">Sitzung wird geladen …</p>
    </div>
  );
}
