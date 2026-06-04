import { create } from "zustand";

import * as repo from "@/features/session/sessionRepository";
import type { Branch, Session } from "@/features/session/types";

/** Lifecycle status of the active session. */
export type SessionStatus = "idle" | "loading" | "ready";

/** Autosave status, surfaced in the UI. */
export type SaveStatus = "idle" | "saving" | "saved";

const SAVE_DEBOUNCE_MS = 400;

interface SessionState {
  session: Session | null;
  status: SessionStatus;
  saveStatus: SaveStatus;
  /** Create a new session for a branch, persist it and make it active. */
  createForBranch: (branch: Branch) => Promise<void>;
  /** Load an existing session by id. Returns false if none exists. */
  resume: (id: string) => Promise<boolean>;
  /** Immutable partial update of the active session (debounced autosave). */
  patch: (updater: (session: Session) => Session) => void;
  /** Drop the active session from memory (does not delete it from storage). */
  clearActive: () => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const useSessionStore = create<SessionState>()((set, get) => {
  function cancelPendingSave() {
    if (saveTimer !== null) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
  }

  async function flushSave() {
    saveTimer = null;
    const current = get().session;
    if (!current) return;
    await repo.saveSession(current);
    await repo.setLastActiveId(current.meta.id);
    // Don't override the status if a newer save was scheduled meanwhile, or if
    // the active session changed during the await.
    if (saveTimer === null && get().session?.meta.id === current.meta.id) {
      set({ saveStatus: "saved" });
    }
  }

  function scheduleSave() {
    cancelPendingSave();
    set({ saveStatus: "saving" });
    saveTimer = setTimeout(() => {
      void flushSave();
    }, SAVE_DEBOUNCE_MS);
  }

  return {
    session: null,
    status: "idle",
    saveStatus: "idle",

    async createForBranch(branch) {
      cancelPendingSave();
      set({ status: "loading" });
      const session = await repo.createSession(branch);
      await repo.setLastActiveId(session.meta.id);
      set({ session, status: "ready", saveStatus: "saved" });
    },

    async resume(id) {
      cancelPendingSave();
      set({ status: "loading" });
      const session = await repo.getSession(id);
      if (!session) {
        set({ status: "idle" });
        return false;
      }
      await repo.setLastActiveId(session.meta.id);
      set({ session, status: "ready", saveStatus: "saved" });
      return true;
    },

    patch(updater) {
      const current = get().session;
      if (!current) return;
      set({ session: updater(current) });
      scheduleSave();
    },

    clearActive() {
      cancelPendingSave();
      set({ session: null, status: "idle", saveStatus: "idle" });
    },
  };
});
