import { useEffect, useState } from "react";

import { ContentError } from "@/features/content/contentService";
import type { LoadStatus } from "@/features/content/useModel";
import { publicAsset } from "@/lib/asset";

/**
 * Hilfetexte je Schritt (public/content/hilfe-schritte.json), ein Eintrag pro
 * Schritt-Id aus phaseConfig mit festem Aufbau. Die Datei liegt unter
 * public/, damit die Texte ohne Neubau angepasst werden können.
 */
export interface SchrittHilfe {
  worum: string;
  eintragen: string;
  beispiel: string;
  fehler: string;
  weiter: string;
}

export type SchrittHilfen = Record<string, SchrittHilfe>;

const HILFE_URL = publicAsset("content/hilfe-schritte.json");
const FELDER = ["worum", "eintragen", "beispiel", "fehler", "weiter"] as const;

let cache: SchrittHilfen | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Tolerant parsing: missing fields become empty strings. */
export function parseSchrittHilfen(data: unknown): SchrittHilfen {
  const schritte =
    isRecord(data) && isRecord(data.schritte) ? data.schritte : {};
  const result: SchrittHilfen = {};
  for (const [id, eintrag] of Object.entries(schritte)) {
    if (!isRecord(eintrag)) continue;
    const hilfe = Object.fromEntries(
      FELDER.map((feld) => [
        feld,
        typeof eintrag[feld] === "string" ? eintrag[feld].trim() : "",
      ]),
    ) as unknown as SchrittHilfe;
    if (FELDER.every((feld) => !hilfe[feld])) continue;
    result[id] = hilfe;
  }
  return result;
}

/** Load the help texts (cached on success only). */
export async function loadSchrittHilfen(): Promise<SchrittHilfen> {
  if (cache) return cache;
  let response: Response;
  try {
    response = await fetch(HILFE_URL);
  } catch {
    throw new ContentError("Die Hilfetexte konnten nicht geladen werden.");
  }
  if (!response.ok) {
    throw new ContentError(
      `Hilfetexte nicht gefunden (HTTP ${response.status}).`,
    );
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ContentError(
      "Die Hilfetexte sind beschädigt (kein gültiges JSON).",
    );
  }
  cache = parseSchrittHilfen(data);
  return cache;
}

export interface SchrittHilfenResult {
  status: LoadStatus;
  hilfen: SchrittHilfen | null;
  error: string | null;
  retry: () => void;
}

/** Lazily load the per-step help texts for the Hilfe drawer. */
export function useSchrittHilfen(): SchrittHilfenResult {
  const [result, setResult] = useState<{
    hilfen: SchrittHilfen | null;
    error: string | null;
  } | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    loadSchrittHilfen()
      .then((hilfen) => {
        if (active) setResult({ hilfen, error: null });
      })
      .catch((error: unknown) => {
        if (active) {
          setResult({
            hilfen: null,
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

  if (!result) return { status: "loading", hilfen: null, error: null, retry };
  if (result.error || !result.hilfen) {
    return { status: "error", hilfen: null, error: result.error, retry };
  }
  return { status: "ready", hilfen: result.hilfen, error: null, retry };
}
