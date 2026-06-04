import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  DEFAULT_PERSONA,
  ThemeContext,
  type Persona,
} from "@/app/theme-context";

/**
 * Provides the active persona and reflects it as `data-persona` on <html>.
 * The persona deltas (accent + density) are defined in styles/personas.css;
 * this component only flips the attribute and exposes persona/setPersona.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona>(DEFAULT_PERSONA);

  useEffect(() => {
    document.documentElement.setAttribute("data-persona", persona);
  }, [persona]);

  const value = useMemo(() => ({ persona, setPersona }), [persona]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
