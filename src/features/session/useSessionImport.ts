import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router";

import { usePersona } from "@/app/theme-context";
import {
  importSessionFromFile,
  SessionImportError,
} from "@/features/session/importSession";
import { saveSession } from "@/features/session/sessionRepository";
import { useSessionStore } from "@/features/session/sessionStore";

/**
 * Import flow as a hook. Wires a hidden file input to the race-free activation
 * path required by the spec:
 *   parse + migrate → saveSession → store.resume(id) → setPersona → /session.
 *
 * Because resume() makes the session active before navigation, useSessionBootstrap
 * keeps it (no re-create, no redirect). Errors surface as a German message.
 */
export function useSessionImport() {
  const navigate = useNavigate();
  const { setPersona } = usePersona();
  const resume = useSessionStore((s) => s.resume);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function trigger() {
    setError(null);
    inputRef.current?.click();
  }

  async function onChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setBusy(true);
    try {
      const session = await importSessionFromFile(file);
      await saveSession(session);
      const ok = await resume(session.meta.id);
      if (!ok) {
        throw new SessionImportError(
          "Die Sitzung konnte nicht geladen werden.",
        );
      }
      setPersona(session.meta.persona);
      navigate("/session");
    } catch (err) {
      setError(
        err instanceof SessionImportError
          ? err.message
          : "Beim Import ist ein unerwarteter Fehler aufgetreten.",
      );
    } finally {
      setBusy(false);
    }
  }

  return {
    inputRef,
    trigger,
    onChange,
    error,
    clearError: () => setError(null),
    busy,
  };
}
