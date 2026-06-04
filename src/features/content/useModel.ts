import { useEffect, useState } from "react";

import {
  ContentError,
  listModels,
  loadModel,
} from "@/features/content/contentService";
import type {
  CoachingModel,
  ModelCategory,
  ModelSummary,
} from "@/features/content/contentTypes";

export type LoadStatus = "idle" | "loading" | "ready" | "error";

function toMessage(error: unknown): string {
  return error instanceof ContentError
    ? error.message
    : "Beim Laden ist ein unerwarteter Fehler aufgetreten.";
}

export interface ModelResult {
  status: LoadStatus;
  model: CoachingModel | null;
  error: string | null;
  retry: () => void;
}

/**
 * Lazily load a single model by id. Status is derived (no synchronous setState
 * in the effect): while the stored result doesn't match the requested id, it
 * reports "loading". retry() clears + re-runs (re-fetches a failed load).
 */
export function useModel(id: string | undefined): ModelResult {
  const [result, setResult] = useState<{
    id: string;
    model: CoachingModel | null;
    error: string | null;
  } | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!id) return;
    let active = true;
    loadModel(id)
      .then((model) => {
        if (active) setResult({ id, model, error: null });
      })
      .catch((error: unknown) => {
        if (active) setResult({ id, model: null, error: toMessage(error) });
      });
    return () => {
      active = false;
    };
  }, [id, nonce]);

  const retry = () => {
    setResult(null);
    setNonce((n) => n + 1);
  };

  if (!id) return { status: "idle", model: null, error: null, retry };
  if (!result || result.id !== id) {
    return { status: "loading", model: null, error: null, retry };
  }
  if (result.error) {
    return { status: "error", model: null, error: result.error, retry };
  }
  return { status: "ready", model: result.model, error: null, retry };
}

export interface ModelListResult {
  status: LoadStatus;
  models: ModelSummary[];
  error: string | null;
  retry: () => void;
}

/** Lazily load the model list (manifest), optionally filtered by category. */
export function useModelList(category?: ModelCategory): ModelListResult {
  const [result, setResult] = useState<{
    models: ModelSummary[];
    error: string | null;
  } | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    listModels(category)
      .then((models) => {
        if (active) setResult({ models, error: null });
      })
      .catch((error: unknown) => {
        if (active) setResult({ models: [], error: toMessage(error) });
      });
    return () => {
      active = false;
    };
  }, [category, nonce]);

  const retry = () => {
    setResult(null);
    setNonce((n) => n + 1);
  };

  if (!result) return { status: "loading", models: [], error: null, retry };
  if (result.error) {
    return { status: "error", models: [], error: result.error, retry };
  }
  return { status: "ready", models: result.models, error: null, retry };
}
