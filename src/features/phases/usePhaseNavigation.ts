import { PHASES, type PhaseDef } from "@/features/phases/phaseConfig";
import { useSessionStore } from "@/features/session/sessionStore";
import type { PhaseId, Progress } from "@/features/session/types";

const MAX_PHASE: PhaseId = 5;
const FALLBACK_PROGRESS: Progress = { phase: 0, step: 0, completedPhases: [] };

export interface PhaseNavigation {
  progress: Progress;
  phaseDef: PhaseDef;
  stepIndex: number;
  stepCount: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoBack: boolean;
  /** Advance one step, or — on the last step — complete the phase. */
  advance: () => void;
  /** Go back one step, or to the previous phase's last step. */
  goPrevStep: () => void;
  /** Jump to the start of a reachable phase (completed or current). */
  goToPhase: (phase: PhaseId) => void;
  /** Jump to a specific step of a reachable phase. */
  goTo: (phase: PhaseId, step: number) => void;
  /** A phase is reachable if completed or the current frontier. */
  isReachable: (phase: PhaseId) => boolean;
}

/**
 * Phase navigation engine. Reads/writes `session.progress` through the store
 * (autosaved). Encapsulates step/phase movement and the gating rules:
 * completed phases are freely navigable, the current frontier is reachable,
 * future phases are locked (no skipping ahead).
 */
export function usePhaseNavigation(): PhaseNavigation {
  const progress =
    useSessionStore((s) => s.session?.progress) ?? FALLBACK_PROGRESS;
  const patch = useSessionStore((s) => s.patch);

  const phaseDef = PHASES[progress.phase];
  const stepCount = phaseDef.steps.length;
  // Clamp the stored step into range — a session saved mid-phase before its step
  // count shrank (e.g. Phase 0: 4 → 2 steps) must not land on an empty screen.
  const stepIndex = Math.min(Math.max(progress.step, 0), stepCount - 1);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex >= stepCount - 1;
  const canGoBack = stepIndex > 0 || progress.phase > 0;

  function setProgress(updater: (p: Progress) => Progress) {
    patch((s) => ({ ...s, progress: updater(s.progress) }));
  }

  function isReachable(phase: PhaseId): boolean {
    if (progress.completedPhases.includes(phase)) return true;
    if (phase === progress.phase) return true;
    // The frontier = first not-yet-completed phase — reachable for review/return.
    let frontier = 0;
    while (progress.completedPhases.includes(frontier as PhaseId))
      frontier += 1;
    return phase === frontier;
  }

  function advance() {
    setProgress((p) => {
      const steps = PHASES[p.phase].steps.length;
      const cur = Math.min(Math.max(p.step, 0), steps - 1);
      if (cur < steps - 1) {
        return { ...p, step: cur + 1 };
      }
      // Last step → complete this phase and move to the next.
      const completedPhases = p.completedPhases.includes(p.phase)
        ? p.completedPhases
        : [...p.completedPhases, p.phase].sort((a, b) => a - b);
      const nextPhase = Math.min(p.phase + 1, MAX_PHASE) as PhaseId;
      return { phase: nextPhase, step: 0, completedPhases };
    });
  }

  function goPrevStep() {
    setProgress((p) => {
      const steps = PHASES[p.phase].steps.length;
      const cur = Math.min(Math.max(p.step, 0), steps - 1);
      if (cur > 0) return { ...p, step: cur - 1 };
      if (p.phase > 0) {
        const prevPhase = (p.phase - 1) as PhaseId;
        return {
          ...p,
          phase: prevPhase,
          step: PHASES[prevPhase].steps.length - 1,
        };
      }
      return p;
    });
  }

  function goToPhase(phase: PhaseId) {
    if (!isReachable(phase)) return;
    setProgress((p) => ({ ...p, phase, step: 0 }));
  }

  function goTo(phase: PhaseId, step: number) {
    if (!isReachable(phase)) return;
    setProgress((p) => ({ ...p, phase, step }));
  }

  return {
    progress,
    phaseDef,
    stepIndex,
    stepCount,
    isFirstStep,
    isLastStep,
    canGoBack,
    advance,
    goPrevStep,
    goToPhase,
    goTo,
    isReachable,
  };
}
