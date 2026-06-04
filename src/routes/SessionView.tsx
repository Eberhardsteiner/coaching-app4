import { PhaseContainer } from "@/features/phases/PhaseContainer";

/**
 * The session's stage content: the phase flow. Backed by the active, persisted
 * session via the store; the phase engine reads/writes session.progress.
 */
export function SessionView() {
  return <PhaseContainer />;
}
