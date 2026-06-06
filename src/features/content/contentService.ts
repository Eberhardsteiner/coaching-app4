/**
 * Content service. Loads coaching models lazily from the app's own origin
 * (public/content/models). The manifest and each model are cached in memory on
 * success only (a failed load is not cached, so a retry re-fetches). Loading is
 * tolerant: unknown fields are ignored, missing optional fields are allowed.
 *
 * The data source is intentionally hidden behind this service — it can later be
 * swapped for a remote endpoint/CMS without changing the UI.
 */

import {
  CONTENT_SCHEMA_VERSION,
  type CoachingModel,
  type ModelCategory,
  type ModelManifest,
  type ModelManifestEntry,
  type ModelSummary,
  type ModelTerm,
} from "@/features/content/contentTypes";

const BASE_PATH = "/content/models/";

/** A user-facing content load error (its message is safe to show in the UI). */
export class ContentError extends Error {}

let manifestCache: ModelManifest | null = null;
const modelCache = new Map<string, CoachingModel>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function fetchJson(url: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new ContentError("Die Inhalte konnten nicht geladen werden.");
  }
  if (!response.ok) {
    throw new ContentError(`Inhalt nicht gefunden (HTTP ${response.status}).`);
  }
  try {
    return (await response.json()) as unknown;
  } catch {
    throw new ContentError("Die Inhalte sind beschädigt (kein gültiges JSON).");
  }
}

async function getManifest(): Promise<ModelManifest> {
  if (manifestCache) return manifestCache;

  const data = await fetchJson(`${BASE_PATH}index.json`);
  if (!isRecord(data)) throw new ContentError("Ungültiges Inhalts-Manifest.");

  const version =
    typeof data.contentSchemaVersion === "number"
      ? data.contentSchemaVersion
      : 0;
  if (version > CONTENT_SCHEMA_VERSION) {
    throw new ContentError(
      "Die Inhalte wurden für eine neuere App-Version erstellt. Bitte aktualisiere die Anwendung.",
    );
  }

  const models: ModelManifestEntry[] = Array.isArray(data.models)
    ? data.models.filter(
        (entry): entry is ModelManifestEntry =>
          isRecord(entry) &&
          typeof entry.id === "string" &&
          typeof entry.name === "string" &&
          typeof entry.file === "string" &&
          (entry.category === "ist" || entry.category === "resource"),
      )
    : [];

  manifestCache = { contentSchemaVersion: version, models };
  return manifestCache;
}

/** List available models, optionally filtered by category. Manifest is cached. */
export async function listModels(
  category?: ModelCategory,
): Promise<ModelSummary[]> {
  const manifest = await getManifest();
  return manifest.models
    .filter((model) => (category ? model.category === category : true))
    .map(({ id, name, category: cat }) => ({ id, name, category: cat }));
}

/** Load a full model by id (lazy fetch, cached on success). */
export async function loadModel(id: string): Promise<CoachingModel> {
  const cached = modelCache.get(id);
  if (cached) return cached;

  const manifest = await getManifest();
  const entry = manifest.models.find((model) => model.id === id);
  if (!entry) throw new ContentError("Dieses Modell ist nicht verfügbar.");

  const data = await fetchJson(`${BASE_PATH}${entry.file}`);
  if (!isRecord(data)) throw new ContentError("Ungültige Modelldaten.");

  const terms: ModelTerm[] = Array.isArray(data.terms)
    ? data.terms
        .filter(
          (term): term is ModelTerm =>
            isRecord(term) &&
            typeof term.id === "string" &&
            typeof term.label === "string",
        )
        .map((term) => ({
          id: term.id,
          label: term.label,
          hint: typeof term.hint === "string" ? term.hint : undefined,
          subterms: Array.isArray(term.subterms)
            ? term.subterms.filter(
                (sub): sub is string => typeof sub === "string",
              )
            : undefined,
        }))
    : [];

  const model: CoachingModel = {
    id: typeof data.id === "string" ? data.id : id,
    name: typeof data.name === "string" ? data.name : entry.name,
    category: entry.category,
    intro: typeof data.intro === "string" ? data.intro : "",
    terms,
    coachRecommended: data.coachRecommended === true,
    coachNote: typeof data.coachNote === "string" ? data.coachNote : undefined,
    diagram: typeof data.diagram === "string" ? data.diagram : undefined,
    longText: typeof data.longText === "string" ? data.longText : undefined,
    bookRef: typeof data.bookRef === "string" ? data.bookRef : undefined,
  };

  modelCache.set(id, model);
  return model;
}
