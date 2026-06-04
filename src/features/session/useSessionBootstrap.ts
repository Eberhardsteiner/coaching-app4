import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import { usePersona } from "@/app/theme-context";
import { isCoachingBranch } from "@/config/constants";
import * as repo from "@/features/session/sessionRepository";
import { useSessionStore } from "@/features/session/sessionStore";

/** Result of bootstrapping the /session route. */
export type BootPhase = "booting" | "ready" | "redirect";

/**
 * Bootstraps the /session route:
 *
 *  - `?branch=…`  → create a new session for that branch, then strip the param.
 *  - no param, session already active → keep it (client-side nav back in).
 *  - no param, none active → resume the last active session, else "redirect".
 *
 * Also couples persona ↔ session.meta.persona: the session's persona is applied
 * on load, and later persona changes (e.g. via the dev switcher) are written
 * back into the session (which autosaves). Guarded against feedback loops.
 */
export function useSessionBootstrap(): BootPhase {
  const [params, setParams] = useSearchParams();
  const { persona, setPersona } = usePersona();
  const createForBranch = useSessionStore((s) => s.createForBranch);
  const resume = useSessionStore((s) => s.resume);
  const patch = useSessionStore((s) => s.patch);

  const [phase, setPhase] = useState<BootPhase>("booting");
  const bootedRef = useRef(false);

  // Run exactly once when entering /session. The ref guard keeps this
  // single-shot (also under React StrictMode's double-invoke in dev).
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    async function boot() {
      const branchParam = params.get("branch");

      // A branch param always starts a new session for that branch.
      if (isCoachingBranch(branchParam)) {
        await createForBranch(branchParam);
        const created = useSessionStore.getState().session;
        if (created) setPersona(created.meta.persona);
        setParams({}, { replace: true }); // drop ?branch=…
        setPhase("ready");
        return;
      }

      // No param but a session is already active → keep it.
      const active = useSessionStore.getState().session;
      if (active) {
        setPersona(active.meta.persona);
        setPhase("ready");
        return;
      }

      // Otherwise resume the most recently active session, else redirect.
      const lastId = await repo.getLastActiveId();
      if (lastId && (await resume(lastId))) {
        const resumed = useSessionStore.getState().session;
        if (resumed) setPersona(resumed.meta.persona);
        setPhase("ready");
      } else {
        setPhase("redirect");
      }
    }

    void boot();
    // Single-shot bootstrap; inputs are read imperatively on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Write persona changes back into the active session (autosaved). Reads the
  // session imperatively so this only fires on persona changes — no loop.
  useEffect(() => {
    const current = useSessionStore.getState().session;
    if (current && current.meta.persona !== persona) {
      patch((prev) => ({ ...prev, meta: { ...prev.meta, persona } }));
    }
  }, [persona, patch]);

  return phase;
}
