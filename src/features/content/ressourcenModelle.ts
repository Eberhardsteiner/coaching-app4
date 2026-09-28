import { useEffect, useState } from "react";

import { ContentError } from "@/features/content/contentService";
import type { LoadStatus } from "@/features/content/useModel";
import { publicAsset } from "@/lib/asset";

/**
 * E3: die Modelle für 3.6 „Ressourcen aus Modellen“. Eine einzige Datendatei
 * (public/content/ressourcen-modelle.json) befüllt die Übersicht in 3.6, den
 * Prompt dort (nur diese Modelle) und die Schublade „Modelle“. Die Datei liegt
 * wie die übrigen Inhalte unter public/, damit sie ohne Neubau der App
 * ausgetauscht werden kann.
 */
export interface RessourcenModell {
  name: string;
  kurzbeschreibung: string;
  ressourcen: string[];
  /** Deutlich gekennzeichneter Platzhalter, bis die echten Modelle da sind. */
  platzhalter: boolean;
}

const MODELLE_URL = publicAsset("content/ressourcen-modelle.json");

let cache: RessourcenModell[] | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Load the model list (cached on success only, tolerant parsing). */
export async function loadRessourcenModelle(): Promise<RessourcenModell[]> {
  if (cache) return cache;
  let response: Response;
  try {
    response = await fetch(MODELLE_URL);
  } catch {
    throw new ContentError("Die Modelle konnten nicht geladen werden.");
  }
  if (!response.ok) {
    throw new ContentError(`Modelle nicht gefunden (HTTP ${response.status}).`);
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ContentError(
      "Die Modelldatei ist beschädigt (kein gültiges JSON).",
    );
  }
  const raw = isRecord(data) && Array.isArray(data.modelle) ? data.modelle : [];
  cache = raw
    .filter(
      (entry): entry is Record<string, unknown> =>
        isRecord(entry) &&
        typeof entry.name === "string" &&
        entry.name.trim() !== "",
    )
    .map((entry) => {
      const name = String(entry.name).trim();
      return {
        name,
        kurzbeschreibung:
          typeof entry.kurzbeschreibung === "string"
            ? entry.kurzbeschreibung.trim()
            : "",
        ressourcen: Array.isArray(entry.ressourcen)
          ? entry.ressourcen
              .filter((r): r is string => typeof r === "string")
              .map((r) => r.trim())
              .filter(Boolean)
          : [],
        platzhalter:
          entry.platzhalter === true ||
          name.includes("‹") ||
          name.includes("›"),
      };
    });
  return cache;
}

export interface RessourcenModelleResult {
  status: LoadStatus;
  modelle: RessourcenModell[];
  error: string | null;
  retry: () => void;
}

/** Lazily load the model list for 3.6 and the Modelle drawer. */
export function useRessourcenModelle(): RessourcenModelleResult {
  const [result, setResult] = useState<{
    modelle: RessourcenModell[];
    error: string | null;
  } | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    loadRessourcenModelle()
      .then((modelle) => {
        if (active) setResult({ modelle, error: null });
      })
      .catch((error: unknown) => {
        if (active) {
          setResult({
            modelle: [],
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

  if (!result) return { status: "loading", modelle: [], error: null, retry };
  if (result.error) {
    return { status: "error", modelle: [], error: result.error, retry };
  }
  return { status: "ready", modelle: result.modelle, error: null, retry };
}
