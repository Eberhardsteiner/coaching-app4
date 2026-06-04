import type { CoachabilityResult } from "@/features/session/types";

export type CoachabilityField =
  | "addiction"
  | "othersMustChange"
  | "acuteDistress";

export interface CoachabilityQuestion {
  field: CoachabilityField;
  text: string;
}

/** The three calm yes/no questions of the coachability self-check. */
export const COACHABILITY_QUESTIONS: CoachabilityQuestion[] = [
  {
    field: "addiction",
    text: "Geht es in deinem Thema im Kern um eine Sucht (z. B. Alkohol, Substanzen, ein Verhalten, das du nicht steuern kannst)?",
  },
  {
    field: "othersMustChange",
    text: "Wünschst du dir vor allem, dass sich andere ändern — weniger du selbst?",
  },
  {
    field: "acuteDistress",
    text: "Fühlst du dich gerade anhaltend stark psychisch belastet (z. B. Niedergeschlagenheit, Angst, eine Krise)?",
  },
];

/**
 * Derive the coachability result from the three answers (no diagnostics — a
 * calm self-assessment with a supportive pointer):
 *   - addiction or acuteDistress → not_suitable
 *   - else othersMustChange      → caution
 *   - else                       → ok
 */
export function computeCoachabilityResult(answers: {
  addiction: boolean;
  othersMustChange: boolean;
  acuteDistress: boolean;
}): CoachabilityResult {
  if (answers.addiction || answers.acuteDistress) return "not_suitable";
  if (answers.othersMustChange) return "caution";
  return "ok";
}
