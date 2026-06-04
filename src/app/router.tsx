import { createBrowserRouter, Navigate } from "react-router";

import { BranchSelectPage } from "@/routes/BranchSelectPage";
import { DesignSystem } from "@/routes/DesignSystem";
import { LandingPage } from "@/routes/LandingPage";
import { LegalPage } from "@/routes/LegalPage";
import { NotFoundPage } from "@/routes/NotFoundPage";
import { SessionRoute } from "@/routes/SessionRoute";
import { SessionsPage } from "@/routes/SessionsPage";
import { SessionView } from "@/routes/SessionView";

/**
 * Application route tree (data router).
 *
 *   /         Landing (no shell)
 *   /start    Branch selection (no shell)
 *   /sessions Saved-session management (no shell)
 *   /session  AppShell layout → SessionView (index child via <Outlet />)
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
