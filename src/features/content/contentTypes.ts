/**
 * Content layer schema for coaching models. Content is loaded lazily at runtime
 * from the app's own origin (public/content/…) — no backend, no static imports —
 * so the files can be replaced/extended without touching the UI, and the data
 * source behind the service can later be swapped for a remote/CMS.
 */

export const CONTENT_SCHEMA_VERSION = 1;

export type ModelCategory = "ist" | "resource"; // 'resource' = later Phase-3 models

export interface ModelTerm {
  id: string;
  label: string;
  hint?: string;
}

export interface CoachingModel {
  id: string;
  name: string;
  category: ModelCategory;
  intro: string; // short, neutral anmoderation
  terms: ModelTerm[]; // terms to go through
  coachRecommended?: boolean; // e.g. 3K
  coachNote?: string; // calm "benefits from a coach" note
  diagram?: string; // optional lazy asset path
  longText?: string; // optional deep-dive (self-coaching), filled later
  bookRef?: string; // optional book reference — NO person names; empty/TODO for now
}

/* Manifest (public/content/models/index.json) ----------------------------- */

export interface ModelManifestEntry {
  id: string;
  name: string;
  category: ModelCategory;
  file: string;
}

export interface ModelManifest {
  contentSchemaVersion: number;
  models: ModelManifestEntry[];
}

/** Lightweight entry returned by listModels(). */
export type ModelSummary = Pick<CoachingModel, "id" | "name" | "category">;
