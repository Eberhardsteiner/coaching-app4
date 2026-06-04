import { RouterProvider } from "react-router";

import { PersonaSwitcher } from "@/app/PersonaSwitcher";
import { router } from "@/app/router";

/**
 * Application root: renders the data router (inside the ThemeProvider supplied
 * by providers.tsx) plus the DEV-only persona switcher.
 */
export function App() {
  return (
    <>
      <RouterProvider router={router} />
      {import.meta.env.DEV ? <PersonaSwitcher /> : null}
    </>
  );
}
