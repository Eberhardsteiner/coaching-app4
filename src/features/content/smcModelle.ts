import { useEffect, useState } from "react";

import { ContentError } from "@/features/content/contentService";
import type { LoadStatus } from "@/features/content/useModel";
import { publicAsset } from "@/lib/asset";

/**
 * Der Modellkatalog der SMC-Toolbox (public/content/smc-modelle.json) — die
 * einzige Quelle für die Modellliste der App: die Schublade „Modelle“ und
 * der Prompt in 3.6 „Ressourcen aus Modellen“. Die Datei liegt wie die
 * übrigen Inhalte unter public/, damit sie ohne Neubau ausgetauscht werden
 * kann. `prompt_bereiche` steuert, welche Bereiche in den Prompt gehen.
 */
export interface SmcModell {
  id: string;
  name: string;
  bereich: string;
  folien: number[];
  elemente: string[];
  beschreibung: string;
  aliases: string[];
  quelle?: string;
  hinweis?: string;
}

export interface SmcBereich {
  id: string;
  label: string;
}

export interface SmcKatalog {
  /** Bereiche in fester Reihenfolge (1, 2, 3, 3.3 …). */
  bereiche: SmcBereich[];
  promptBereiche: string[];
  modelle: SmcModell[];
}

const KATALOG_URL = publicAsset("content/smc-modelle.json");

let cache: SmcKatalog | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.trim())
        .filter(Boolean)
    : [];
}

function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** Bereichs-Ids numerisch sortieren („3“ vor „3.3“), Rest alphabetisch. */
function compareBereich(a: string, b: string): number {
  const na = Number.parseFloat(a);
  const nb = Number.parseFloat(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb;
  return a.localeCompare(b, "de");
}

/** Tolerant parsing of the catalog file (unknown fields are ignored). */
export function parseSmcKatalog(data: unknown): SmcKatalog {
  if (!isRecord(data)) throw new ContentError("Ungültiger Modellkatalog.");

  const modelle: SmcModell[] = (Array.isArray(data.modelle) ? data.modelle : [])
    .filter(
      (m): m is Record<string, unknown> =>
        isRecord(m) &&
        typeof m.name === "string" &&
        m.name.trim() !== "" &&
        (typeof m.bereich === "string" || typeof m.bereich === "number"),
    )
    .map((m) => ({
      id:
        typeof m.id === "string" && m.id.trim()
          ? m.id.trim()
          : String(m.name).trim(),
      name: String(m.name).trim(),
      bereich: String(m.bereich).trim(),
      folien: Array.isArray(m.folien)
        ? m.folien.filter((f): f is number => typeof f === "number")
        : [],
      elemente: strings(m.elemente),
      beschreibung: optionalText(m.beschreibung) ?? "",
      aliases: strings(m.aliases),
      quelle: optionalText(m.quelle),
      hinweis: optionalText(m.hinweis),
    }));

  const labels = isRecord(data.bereiche) ? data.bereiche : {};
  const ids = new Set([
    ...Object.keys(labels),
    ...modelle.map((m) => m.bereich),
  ]);
  const bereiche = [...ids].sort(compareBereich).map((id) => ({
    id,
    label: optionalText(labels[id]) ?? `Bereich ${id}`,
  }));

  return {
    bereiche,
    promptBereiche: strings(data.prompt_bereiche),
    modelle,
  };
}

/** Load the catalog (cached on success only). */
export async function loadSmcKatalog(): Promise<SmcKatalog> {
  if (cache) return cache;
  let response: Response;
  try {
    response = await fetch(KATALOG_URL);
  } catch {
    throw new ContentError("Der Modellkatalog konnte nicht geladen werden.");
  }
  if (!response.ok) {
    throw new ContentError(
      `Modellkatalog nicht gefunden (HTTP ${response.status}).`,
    );
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ContentError(
      "Der Modellkatalog ist beschädigt (kein gültiges JSON).",
    );
  }
  cache = parseSmcKatalog(data);
  return cache;
}

export interface SmcKatalogResult {
  status: LoadStatus;
  katalog: SmcKatalog | null;
  error: string | null;
  retry: () => void;
}

/** Lazily load the catalog for the Modelle drawer and step 3.6. */
export function useSmcKatalog(): SmcKatalogResult {
  const [result, setResult] = useState<{
    katalog: SmcKatalog | null;
    error: string | null;
  } | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    loadSmcKatalog()
      .then((katalog) => {
        if (active) setResult({ katalog, error: null });
      })
      .catch((error: unknown) => {
        if (active) {
          setResult({
            katalog: null,
            error:
              error instanceof ContentError
                ? error.message
                : "Beim Laden ist ein unerwarteter Fehler aufgetreten.",
          });
        }
      });
    return () => {
      active = false;
    };
  }, [nonce]);

  const retry = () => {
    setResult(null);
    setNonce((n) => n + 1);
  };

  if (!result) return { status: "loading", katalog: null, error: null, retry };
  if (result.error || !result.katalog) {
    return { status: "error", katalog: null, error: result.error, retry };
  }
  return { status: "ready", katalog: result.katalog, error: null, retry };
}

/** Die Modelle, deren Bereich in `prompt_bereiche` steht (Katalogreihenfolge). */
export function promptModelle(katalog: SmcKatalog): SmcModell[] {
  return katalog.modelle.filter((m) =>
    katalog.promptBereiche.includes(m.bereich),
  );
}

/** Eine Promptzeile: Name, dann in Klammern die Elemente (sonst nur der Name). */
export function modellZeile(modell: SmcModell): string {
  return modell.elemente.length > 0
    ? `${modell.name} (${modell.elemente.join(", ")})`
    : modell.name;
}

function norm(text: string): string {
  return text.toLocaleLowerCase("de").normalize("NFC");
}

export interface SmcTreffer {
  modell: SmcModell;
  /** Elemente, in denen der Suchbegriff vorkommt (für die Trefferzeile). */
  elementTreffer: string[];
}

/** Suche in Name, Aliases und Elementen (Groß-/Kleinschreibung egal). */
export function sucheModelle(
  modelle: SmcModell[],
  suchbegriff: string,
): SmcTreffer[] {
  const q = norm(suchbegriff.trim());
  if (!q) return modelle.map((modell) => ({ modell, elementTreffer: [] }));
  return modelle.flatMap((modell) => {
    const elementTreffer = modell.elemente.filter((e) => norm(e).includes(q));
    const treffer =
      norm(modell.name).includes(q) ||
      modell.aliases.some((a) => norm(a).includes(q)) ||
      elementTreffer.length > 0;
    return treffer ? [{ modell, elementTreffer }] : [];
  });
}
