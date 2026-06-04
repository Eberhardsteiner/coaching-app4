/**
 * App-wide, non-secret constants. Kept intentionally small for WP0 —
 * persistence keys, feature flags and route ids will accumulate here.
 */

/** Namespace prefix for any future persisted state (localStorage, Prompt 4+). */
export const STORAGE_PREFIX = "coaching-app";

/**
 * The two branches of the coaching process. Wired into routing in Prompt 2.
 *   - "guided": geführtes Coaching
 *   - "self":   Selbstcoaching
 */
export const COACHING_BRANCHES = ["guided", "self"] as const;
export type CoachingBranch = (typeof COACHING_BRANCHES)[number];
