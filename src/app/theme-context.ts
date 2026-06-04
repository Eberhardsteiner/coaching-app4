import { createContext, useContext } from "react";

/**
 * The three visual personas. Same markup and data model across all of them —
 * only the look (accent + density, see styles/personas.css) changes.
 */
export const PERSONAS = ["ruhig", "klar", "frei"] as const;
export type Persona = (typeof PERSONAS)[number];

/** Default persona — its values are the base baked into tokens.css/personas.css. */
export const DEFAULT_PERSONA: Persona = "ruhig";

/** Neutral, German labels for the persona switcher. */
export const PERSONA_LABELS: Record<Persona, string> = {
  ruhig: "Ruhig",
  klar: "Klar",
  frei: "Frei",
};

export type ThemeContextValue = {
  persona: Persona;
  setPersona: (persona: Persona) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Access the active persona and its setter. Must be used within ThemeProvider. */
export function usePersona(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("usePersona must be used within a ThemeProvider");
  }
  return ctx;
}
