import { Navigate } from "react-router";

import { AppShell } from "@/components/layout/AppShell";
import { ConsentGate } from "@/features/onboarding/ConsentGate";
import { useSessionBootstrap } from "@/features/session/useSessionBootstrap";
import { useSessionStore } from "@/features/session/sessionStore";

/**
 * Route element for /session. Bootstraps the persisted session (create / resume
 * / redirect). Then:
 *   - consentAck === false → render the ConsentGate ONLY (no shell access yet);
 *   - consentAck === true  → render the AppShell (whose <Outlet /> shows the
 *     SessionView). Resumed/imported sessions with consentAck=true skip the gate.
 *
 * The WP1 bootstrap/creation flow is unchanged — the gate is just a conditional
 * first step here.
 */
export function SessionRoute() {
  const phase = useSessionBootstrap();
  const consentAck = useSessionStore(
    (s) => s.session?.phase0.consentAck ?? false,
  );

  if (phase === "redirect") {
    return <Navigate to="/start" replace />;
  }

  if (phase === "booting") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-sm text-muted">Sitzung wird geladen …</p>
      </div>
    );
  }

  if (!consentAck) {
    return <ConsentGate />;
  }

  return <AppShell />;
}
