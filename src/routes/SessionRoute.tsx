import { Navigate } from "react-router";

import { AppShell } from "@/components/layout/AppShell";
import { useSessionBootstrap } from "@/features/session/useSessionBootstrap";

/**
 * Route element for /session. Bootstraps the persisted session (create / resume
 * / redirect) and then renders the AppShell — whose <Outlet /> shows SessionView.
 */
export function SessionRoute() {
  const phase = useSessionBootstrap();

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

  return <AppShell />;
}
