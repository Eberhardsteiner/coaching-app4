/**
 * App-wide, non-secret constants. Kept intentionally small for WP0 —
 * persistence keys, feature flags and route ids will accumulate here.
 */

/** Namespace prefix for any future persisted state (localStorage, Prompt 4+). */
export const STORAGE_PREFIX = "coaching-app";

/**
 * The two branches of the coaching process. Held in the URL (?branch=) for
 * now; full session-state logic arrives in WP1.
 *   - "coached": begleitet durch einen Remote-Coach
 *   - "self":    Selbstcoaching
 */
export const COACHING_BRANCHES = ["coached", "self"] as const;
export type CoachingBranch = (typeof COACHING_BRANCHES)[number];

/** Neutral, German display labels per branch (Wording-Regel: keine Eigennamen). */
export const BRANCH_LABELS: Record<CoachingBranch, string> = {
  coached: "Mit Coach (Remote)",
  self: "Selbstcoaching",
};

/** Short neutral descriptions shown on the branch-select cards. */
export const BRANCH_DESCRIPTIONS: Record<CoachingBranch, string> = {
  coached:
    "Begleitung durch einen Menschen per Videogespräch. Der Coach hält den Prozess — du entscheidest.",
  self: "Allein und in deinem Tempo — mit Erklärtexten, kurzen Videos und KI-Impulsen an passenden Stellen.",
};

/** Narrow an unknown string (e.g. a URL param) to a CoachingBranch. */
export function isCoachingBranch(
  value: string | null,
): value is CoachingBranch {
  return (
    value !== null && (COACHING_BRANCHES as readonly string[]).includes(value)
  );
}
