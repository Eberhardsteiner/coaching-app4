import { createBrowserRouter, Navigate } from "react-router";

import { AnforderungenView } from "@/routes/AnforderungenView";
import { BranchSelectPage } from "@/routes/BranchSelectPage";
import { BuehneView } from "@/routes/BuehneView";
import { DesignSystem } from "@/routes/DesignSystem";
import { GrundwerteView } from "@/routes/GrundwerteView";
import { IntroView } from "@/routes/IntroView";
import { LandingPage } from "@/routes/LandingPage";
import { LegalPage } from "@/routes/LegalPage";
import { NotFoundPage } from "@/routes/NotFoundPage";
import { SessionRoute } from "@/routes/SessionRoute";
import { SessionsPage } from "@/routes/SessionsPage";
import { SessionView } from "@/routes/SessionView";
import { SummaryView } from "@/routes/SummaryView";

/**
 * Application route tree (data router).
 *
 *   /         Landing (no shell)
 *   /start    Branch selection (no shell)
 *   /sessions Saved-session management (no shell)
 *   /session  AppShell layout → SessionView (index child via <Outlet />)
 *   /zusammenfassung  Print-friendly session summary (no shell)
 *   /buehne   Presenter stage — read-only, shared-only, live-mirrored (no shell)
 *   /einfuehrung  Self-coaching intro (Rubikon model, no shell)
 *   /grundwerte   Self-coaching values & effects (no shell)
 *   /anforderungen  Self-coaching requirements / preparation tips (no shell)
 *   /design   Design-System demo — DEV only; redirects to / in production
 *   *         404 fallback
 */
export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/start", element: <BranchSelectPage /> },
  { path: "/sessions", element: <SessionsPage /> },
  { path: "/rechtliches", element: <LegalPage kind="rechtliches" /> },
  { path: "/datenschutz", element: <LegalPage kind="datenschutz" /> },
  { path: "/impressum", element: <LegalPage kind="impressum" /> },
  {
    path: "/session",
    element: <SessionRoute />,
    children: [{ index: true, element: <SessionView /> }],
  },
  { path: "/zusammenfassung", element: <SummaryView /> },
  { path: "/buehne", element: <BuehneView /> },
  { path: "/einfuehrung", element: <IntroView /> },
  { path: "/grundwerte", element: <GrundwerteView /> },
  { path: "/anforderungen", element: <AnforderungenView /> },
  {
    path: "/design",
    element: import.meta.env.DEV ? (
      <DesignSystem />
    ) : (
      <Navigate to="/" replace />
    ),
  },
  { path: "*", element: <NotFoundPage /> },
]);
