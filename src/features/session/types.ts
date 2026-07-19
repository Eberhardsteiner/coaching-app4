/**
 * Session data model for the full 5+1-phase coaching process.
 *
 * Field names are methodically chosen and must be kept stable — they are the
 * contract that persistence (Dexie) and every later phase UI build on.
 */

import type { CoachingBranch } from "@/config/constants";
import type { Persona } from "@/app/theme-context";

/** Bump when the persisted shape changes; enables future migrations. */
export const CURRENT_SCHEMA_VERSION = 2;

/** Coaching branch — re-used from config/constants (single source of truth). */
export type Branch = CoachingBranch;

/** Persona — re-used from the theme layer (ruhig | klar | frei). */
export type { Persona };

/** Card/cluster visibility (relevant once a coach shares the board). */
export type Visibility = "shared" | "coach_only";

/** Top-level metadata for one coaching session. */
export interface SessionMeta {
  id: string;
  schemaVersion: number;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  branch: Branch;
  persona: Persona;
  title?: string;
  locale: "de";
}

/** Four-part phase check: result / process / insight / transfer. */
export interface PhaseCheck {
  result: string;
  process: string;
  insight: string;
  transfer: string;
}

/* Phase 0 — Vereinbarung -------------------------------------------------- */

export type CoachabilityResult = "ok" | "caution" | "not_suitable";

export interface Phase0 {
  consentAck: boolean; // rechtliche Entlastung aktiv bestätigt
  valuesAck: boolean; // Werte / Coachingverständnis bestätigt
  dataPrivacyAck: boolean; // Datenschutz-Sensibilisierung bestätigt
  coachability: {
    addiction: boolean;
    othersMustChange: boolean;
    acuteDistress: boolean;
    result: CoachabilityResult;
  };
  topicSketch: string;
}

/* Phase 1 — IST ----------------------------------------------------------- */

export interface Card {
  id: string;
  text: string;
  meaning?: string;
  color?: string; // Farbe trägt Bedeutung (Cluster)
  x?: number;
  y?: number;
  w?: number;
  h?: number; // freie Positionierung
  clusterId?: string;
  modelTerm?: string;
  visibility: Visibility;
}

export interface Cluster {
  id: string;
  name: string;
  /** Unique weight 1..10 (10 = "drückt am meisten"). Undefined = not yet rated. */
  weight?: number;
  /**
   * Card-colour id (see cardColors) for the cluster zone + its cards.
   * Optional + additive: clusters were never persisted before, so no migration
   * is needed; new clusters always set it.
   */
  color?: string;
  cardIds: string[]; // derived from card.clusterId (card.clusterId is the truth)
  isCore?: boolean; // derived: the single highest-weight cluster
  /** Free-field position of the cluster's blue oval (additive; default placed). */
  x?: number;
  y?: number;
}

export interface Phase1 {
  istWord: string;
  /** Optional perceived burden 1..10 (Leidensdruck-Check). Undefined = unanswered. */
  istBurden?: number;
  selectedModel?: string;
  cards: Card[];
  clusters: Cluster[];
  check: PhaseCheck;
}

/* Phase 2 — SOLL / Ziel --------------------------------------------------- */

export interface GoalComponents {
  futurII: boolean;
  adressat: boolean;
  terminiert: boolean;
  kontextbezug: boolean;
  loesungsfrei: boolean;
  emotionalAttraktiv: number; // 1..10 (10/10-Stopper)
  selbstErreichbar: number; // 1..10 (10/10-Stopper)
}

export interface Consequence {
  id: string;
  clusterId?: string;
  perspective: string;
  recognition: string;
  valuation: string;
  tailwind?: boolean;
}

export interface Phase2 {
  vision: string;
  goalText: string;
  datum?: string;
  rolle?: string;
  gefuehl?: string;
  clusterRef?: string;
  components: GoalComponents;
  consequences: Consequence[];
  check: PhaseCheck;
}

/* Phase 3 — Ressourcen ---------------------------------------------------- */

export interface ResourceItem {
  id: string;
  text: string;
  note?: string;
  polarity?: "foerderlich" | "hinderlich";
  /**
   * Generic sub-category (additive, MP3): `values` uses the value column
   * ("mensch" | "funktion" | "ziel"); `othersValues` uses "wer" (the people/
   * groups of a cluster) and "skip" (cluster deliberately skipped);
   * `experiential` uses "erfahrung" | "erfahrung-aussen" | "ableitung"
   * (the three reflection anchors, MP3-REV) | "aussen" (outer resources).
   * Unused by other lists.
   */
  category?: string;
  /** Owning Phase-1 cluster (additive, MP3): used by othersValues. */
  clusterId?: string;
  /**
   * Mehrfach-Zuordnung eines Werts (P8c, additiv-optional): `values` markiert
   * hier, ob ein Wert wichtig ist als "mensch" | "funktion" | "ziel" —
   * Mehrfachauswahl. Alte Einträge haben nur `category` (Einzelwert); die UI
   * liest `categories ?? [category]`, kein Schema-Bump nötig.
   */
  categories?: string[];
  /**
   * Personen-Zuordnung (P9, additiv-optional): `othersValues`-WERTE verweisen
   * auf die Person (= id des zugehörigen "wer"-Eintrags im selben Cluster),
   * zu der sie erfasst wurden. Alte Werte ohne personRef bleiben gültig
   * (cluster-weit, ohne Personen-Zuordnung angezeigt).
   */
  personRef?: string;
}

/** One structured "Bisheriges Muster — Don't!" entry (MP3, Folie 14). */
export interface DontPatternEntry {
  id: string;
  /** Which resources fed the pattern. */
  resources: string;
  /** The behaviour shown on that basis. */
  behavior: string;
  /** What it caused / the insight gained. */
  effect: string;
}

export interface Phase3 {
  motives: ResourceItem[];
  values: ResourceItem[]; // je Eintrag category "mensch"|"funktion"|"ziel" (MP3)
  intelligences: ResourceItem[];
  innerResources: ResourceItem[]; // nach polarity sortierbar
  othersValues: ResourceItem[]; // je Eintrag clusterId (+ category "wer"/"skip")
  /**
   * MP3: repurposed (field name is the persistence contract and stays) — now
   * holds the "Ressourcen aus Modellen" (3.6): `note` = model name, `text` =
   * insight/resource. Old free hypothesis entries stay valid (no `note`).
   */
  hypotheses: ResourceItem[];
  experiential: ResourceItem[]; // 3.7 — category "erfahrung" | "aussen"
  /** Legacy (pre-MP3): free "so nicht mehr" notes. Superseded by dontPattern. */
  pastPatterns: ResourceItem[];
  somaticMarkers: ResourceItem[]; // 3.8
  /**
   * Persönlichkeitseigenschaften (MP3, additive-optional — no schema bump,
   * pattern preMortem/istBurden): previously wrongly mixed into motives.
   * Not initialised in createEmptySession; always read defensively (?? []).
   */
  personalityTraits?: ResourceItem[];
  /** MP3: insights from comparing own values with the others' (Folie 10). */
  othersValuesInsight?: string;
  /** MP3: structured "Bisheriges Muster — Don't!" (Folie 14). */
  dontPattern?: DontPatternEntry[];
  selectedModels?: string[];
  check: PhaseCheck;
}

/* Phase 4 — Handlungsplan ------------------------------------------------- */

/**
 * Quality check of one measure (MP4, 4.2): the four criteria for effective
 * measures. `undefined` = not yet checked, `false` = deliberately answered no.
 */
export interface MeasureQuality {
  zielbeitrag?: boolean;
  ressourcenbasiert?: boolean;
  ichSatz?: boolean;
  neu?: boolean;
}

export interface Measure {
  id: string;
  text: string; // Ich-Satz
  /** Legacy-Einzelwert (pre-P13) — von basedOnResources abgelöst; alte
   *  Sitzungen bleiben lesbar (UI/Summary lesen beide Felder). */
  basedOnResource?: string;
  /**
   * P13 (additiv-optional): MEHRERE Ressourcen je Maßnahme (Checkbox-Liste
   * der förderlichen Ressourcen). Beim ersten Ändern hebt die UI den alten
   * Einzelwert in dieses Array — kein Schema-Bump nötig.
   */
  basedOnResources?: string[];
  /** Legacy (pre-MP4): no longer collected — the Wirkindikator now comes from
   *  phase2.consequences. Existing values are tolerated read-only. */
  recognitionSignal?: string;
  /** MP4 (additive): „Bis wann" — ISO date (yyyy-mm-dd). */
  dueDate?: string;
  /** MP4 (additive): „Mögliche Hindernisse". */
  obstacles?: string;
  /** MP4 (additive): „Ressourcen & Alternativen" (Plan B). */
  alternatives?: string;
  /** MP4 (additive): the four-criteria quality check. */
  quality?: MeasureQuality;
}

export interface ClusterPlan {
  clusterId: string;
  resourcesUsed: string[];
  measures: Measure[];
}

export interface Phase4 {
  plans: ClusterPlan[];
  /**
   * Optional pre-mortem reflection (possible obstacles + early countermeasures).
   * Additive-optional, default-safe — no schema bump needed (analogous to
   * `istBurden`): existing sessions simply have it undefined.
   */
  preMortem?: ResourceItem[];
  check: PhaseCheck;
}

/* Phase 5 — Controlling --------------------------------------------------- */

export interface Strategy {
  id: string;
  resource: string;
  concreteStrategy: string;
}

export interface Phase5 {
  strategies: Strategy[];
  insights: string;
  check: PhaseCheck;
}

/* Progress / navigation --------------------------------------------------- */

/** Phase ids of the 5+1 process (0 = Vereinbarung … 5 = Nachhaltigkeit). */
export type PhaseId = 0 | 1 | 2 | 3 | 4 | 5;

/** Where the user currently is in the process. */
export interface Progress {
  /** The phase currently in view. */
  phase: PhaseId;
  /** Zero-based step index within that phase. */
  step: number;
  /** Phases that are fully completed (and thus freely navigable). */
  completedPhases: PhaseId[];
}

/* Aggregate --------------------------------------------------------------- */

export interface Session {
  meta: SessionMeta;
  progress: Progress;
  phase0: Phase0;
  phase1: Phase1;
  phase2: Phase2;
  phase3: Phase3;
  phase4: Phase4;
  phase5: Phase5;
  /**
   * Coach-only private notes / hypotheses (shown only in the coached-branch
   * console, never on the coachee stage). Additive-optional, default-safe — no
   * schema bump (analogous to istBurden / preMortem).
   */
  coachNotes?: string;
  /**
   * Erkenntnisboard — the coachee's persistent cross-phase notes (Notizbuch
   * drawer). Coachee content: travels in export, import AND the coachee
   * handoff (unlike coachNotes). Additive-optional, default-safe — no schema
   * bump (analogous to istBurden / preMortem / coachNotes).
   */
  notebook?: string;
}

/** An empty four-part phase check. */
function emptyCheck(): PhaseCheck {
  return { result: "", process: "", insight: "", transfer: "" };
}

/**
 * Create a fresh, empty session for the given branch.
 * Generates an id + timestamps, stamps the current schema version and locale,
 * and initialises every phase to its empty shape. Default persona: "ruhig".
 */
export function createEmptySession(
  branch: Branch,
  persona: Persona = "ruhig",
): Session {
  const now = new Date().toISOString();
  return {
    meta: {
      id: crypto.randomUUID(),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
      branch,
      persona,
      locale: "de",
    },
    progress: { phase: 0, step: 0, completedPhases: [] },
    phase0: {
      consentAck: false,
      valuesAck: false,
      dataPrivacyAck: false,
      coachability: {
        addiction: false,
        othersMustChange: false,
        acuteDistress: false,
        result: "ok",
      },
      topicSketch: "",
    },
    phase1: {
      istWord: "",
      cards: [],
      clusters: [],
      check: emptyCheck(),
    },
    phase2: {
      vision: "",
      goalText: "",
      components: {
        futurII: false,
        adressat: false,
        terminiert: false,
        kontextbezug: false,
        loesungsfrei: false,
        emotionalAttraktiv: 0,
        selbstErreichbar: 0,
      },
      consequences: [],
      check: emptyCheck(),
    },
    phase3: {
      motives: [],
      values: [],
      intelligences: [],
      innerResources: [],
      othersValues: [],
      hypotheses: [],
      experiential: [],
      pastPatterns: [],
      somaticMarkers: [],
      check: emptyCheck(),
    },
    phase4: {
      plans: [],
      check: emptyCheck(),
    },
    phase5: {
      strategies: [],
      insights: "",
      check: emptyCheck(),
    },
  };
}
