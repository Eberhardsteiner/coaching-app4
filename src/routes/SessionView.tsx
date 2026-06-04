import { BRANCH_LABELS } from "@/config/constants";
import {
  useSessionStore,
  type SaveStatus,
} from "@/features/session/sessionStore";

const SAVE_LABELS: Record<SaveStatus, string> = {
  idle: "—",
  saving: "Speichern …",
  saved: "Gespeichert",
};

/**
 * Placeholder phase view, rendered inside the AppShell stage. The real phase
 * flow arrives later. It is now backed by a real, persisted session: it shows
 * the session id (shortened), the branch (from the store, not the URL) and the
 * autosave status. The DEV-only field exercises autosave + rehydration.
 */
export function SessionView() {
  const session = useSessionStore((s) => s.session);
  const saveStatus = useSessionStore((s) => s.saveStatus);
  const patch = useSessionStore((s) => s.patch);

  if (!session) {
    // SessionRoute only renders the shell once a session is ready; this is just
    // a defensive fallback.
    return null;
  }

  const shortId = session.meta.id.slice(0, 8);
  const branchLabel = BRANCH_LABELS[session.meta.branch];

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <p className="font-serif text-2xl text-foreground sm:text-3xl">
        Phasenfluss folgt
      </p>
      <p className="mt-3 max-w-md text-sm text-muted">
        Hier entsteht der geführte Ablauf durch die Phasen. Die Sitzung wird
        bereits lokal gespeichert.
      </p>

      <dl className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-faint">
        <div className="flex items-center gap-1.5">
          <dt>Sitzung</dt>
          <dd className="font-mono text-muted">{shortId}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt>Zweig</dt>
          <dd className="text-muted">{branchLabel}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt>Status</dt>
          <dd className="text-muted">{SAVE_LABELS[saveStatus]}</dd>
        </div>
      </dl>

      {import.meta.env.DEV ? (
        <label className="mt-8 flex w-full max-w-sm flex-col gap-1 text-left">
          <span className="text-xs font-medium text-faint">
            Dev: topicSketch (Persistenz-Test)
          </span>
          <input
            type="text"
            value={session.phase0.topicSketch}
            placeholder="Thema notieren …"
            onChange={(event) => {
              const value = event.target.value;
              patch((prev) => ({
                ...prev,
                phase0: { ...prev.phase0, topicSketch: value },
              }));
            }}
            className="rounded-md border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </label>
      ) : null}
    </div>
  );
}
