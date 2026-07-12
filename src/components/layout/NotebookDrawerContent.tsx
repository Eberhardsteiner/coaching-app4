import { useSessionStore } from "@/features/session/sessionStore";

/**
 * Content of the "Erkenntnisboard" drawer (Notizbuch): one persistent free-text
 * area for the coachee's insights across ALL phases, bound to the additive
 * `session.notebook` field (autosaved via the normal patch/debounce path, like
 * coachNotes). Coachee content — it travels in export/import and the handoff.
 */
export function NotebookDrawerContent() {
  const notebook = useSessionStore((s) => s.session?.notebook ?? "");
  const patch = useSessionStore((s) => s.patch);

  function setNotebook(value: string) {
    patch((s) => ({ ...s, notebook: value }));
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <p className="text-sm text-muted">
        Deine Notizen und Erkenntnisse — über alle Phasen hinweg.
      </p>
      <textarea
        aria-label="Erkenntnisboard"
        value={notebook}
        onChange={(event) => setNotebook(event.target.value)}
        placeholder="Was nimmst du mit? Was ist dir aufgefallen?"
        className="min-h-64 w-full flex-1 resize-none rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
      <p className="text-xs text-faint">
        Wird automatisch mit deiner Sitzung gespeichert.
      </p>
    </div>
  );
}
