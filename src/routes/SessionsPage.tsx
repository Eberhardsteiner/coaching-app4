import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { usePersona } from "@/app/theme-context";
import { Button } from "@/components/ui/button";
import { BRANCH_LABELS } from "@/config/constants";
import { downloadSession } from "@/features/session/exportSession";
import { ImportButton } from "@/features/session/ImportButton";
import {
  deleteAllData,
  deleteSessionAndPointer,
  listSessions,
  peekSession,
  setSessionBranch,
} from "@/features/session/sessionRepository";
import { useSessionStore } from "@/features/session/sessionStore";
import { StrictDeleteDialog } from "@/features/session/StrictDeleteDialog";
import type { Session } from "@/features/session/types";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Title, or a neutral fallback of "branch label · start date". */
function sessionTitle(session: Session): string {
  const title = session.meta.title?.trim();
  if (title) return title;
  const date = new Date(session.meta.createdAt).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `${BRANCH_LABELS[session.meta.branch]} · ${date}`;
}

/**
 * Minimal session management (route /sessions, no shell): list saved sessions,
 * resume one (race-free: store.resume → setPersona → /session) or delete one
 * (with confirmation). Deleting the active session also clears it cleanly.
 */
export function SessionsPage() {
  const navigate = useNavigate();
  const { setPersona } = usePersona();
  const resume = useSessionStore((s) => s.resume);
  const clearActive = useSessionStore((s) => s.clearActive);
  const activeId = useSessionStore((s) => s.session?.meta.id);

  const [sessions, setSessions] = useState<Session[] | null>(null); // null = loading
  const [pendingDelete, setPendingDelete] = useState<Session | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  async function reload() {
    setSessions(await listSessions());
  }

  // Load saved sessions on mount; setState lives in the async callback.
  useEffect(() => {
    let active = true;
    void listSessions().then((result) => {
      if (active) setSessions(result);
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleResume(session: Session) {
    await resume(session.meta.id);
    setPersona(session.meta.persona);
    navigate("/session");
  }

  /** Switch a session's role/view (coach ↔ coachee). View-only, no migration. */
  async function handleSwitchBranch(session: Session) {
    const next = session.meta.branch === "coached" ? "self" : "coached";
    await setSessionBranch(session.meta.id, next);
    await reload();
  }

  async function handleConfirmDelete() {
    const target = pendingDelete;
    if (!target) return;
    // Deletes the session AND the persisted last-active pointer when it
    // referenced it (repository helper) — a deleted session is never resumed.
    await deleteSessionAndPointer(target.meta.id);
    // Clear the in-memory active session if it was the deleted one.
    if (activeId === target.meta.id) {
      clearActive();
    }
    setPendingDelete(null);
    await reload();
  }

  /** F3 — wipe ALL local data (sessions + kv flags); app back to first run. */
  async function handleConfirmDeleteAll() {
    await deleteAllData();
    clearActive();
    setDeleteAllOpen(false);
    await reload();
  }

  /**
   * Export for the delete dialogs — always a FRESH read from Dexie (not the
   * list snapshot from mount): a pending 400 ms autosave flush or a second
   * tab may have written since; the pre-delete backup must be current.
   */
  async function exportFresh(id: string) {
    const fresh = await peekSession(id);
    if (fresh) downloadSession(fresh);
  }

  /** F3 export reminder: back up EVERY session before the full wipe. */
  async function exportAllFresh() {
    const all = await listSessions();
    for (const session of all) downloadSession(session);
  }

  const isEmpty = sessions !== null && sessions.length === 0;

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Start
        </Link>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-foreground">
              Gespeicherte Sitzungen
            </h1>
            <p className="mt-2 text-sm text-muted">
              Lokal auf diesem Gerät gespeichert.
            </p>
            <p className="mt-1 text-xs text-faint">
              „Als Coach fortsetzen“ / „Als Coachee öffnen“ wechselt nur die
              Sicht/Rolle — ohne Datenänderung.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ImportButton variant="outline" label="Importieren" />
            <Button asChild>
              <Link to="/start">
                <Plus />
                Neue Sitzung
              </Link>
            </Button>
          </div>
        </div>

        {sessions === null ? (
          <p className="mt-10 text-sm text-muted">Lädt …</p>
        ) : isEmpty ? (
          <div className="mt-10 rounded-xl border border-subtle bg-surface p-8 text-center">
            <p className="text-foreground">
              Noch keine gespeicherten Sitzungen.
            </p>
            <p className="mt-2 text-sm text-muted">
              Starte ein Coaching oder importiere eine Datei.
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {sessions.map((session) => (
              <li
                key={session.meta.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-subtle bg-surface p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {sessionTitle(session)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    Zuletzt geändert: {formatDateTime(session.meta.updatedAt)} ·{" "}
                    {BRANCH_LABELS[session.meta.branch]}
                    {session.meta.id === activeId ? " · aktiv" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      void handleResume(session);
                    }}
                  >
                    Fortsetzen
                    <ArrowRight />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      void handleSwitchBranch(session);
                    }}
                    title="Wechselt nur die Sicht/Rolle — ohne Datenänderung"
                  >
                    {session.meta.branch === "coached"
                      ? "Als Coachee öffnen"
                      : "Als Coach fortsetzen"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPendingDelete(session)}
                    aria-label={`Sitzung „${sessionTitle(session)}“ löschen`}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* F3 — Gefahrenbereich: alle lokalen Daten löschen. */}
        {sessions !== null && sessions.length > 0 ? (
          <div className="mt-12 rounded-xl border border-subtle bg-surface-2 p-4">
            <p className="text-sm font-medium text-foreground">
              Alle lokalen Daten löschen
            </p>
            <p className="mt-1 text-sm text-muted">
              Entfernt alle Sitzungen ({sessions.length}{" "}
              {sessions.length === 1 ? "Sitzung" : "Sitzungen"}) und
              Einstellungen auf diesem Gerät — die App startet danach wie beim
              ersten Besuch.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-muted"
              onClick={() => setDeleteAllOpen(true)}
            >
              <Trash2 />
              Alle Daten löschen
            </Button>
          </div>
        ) : null}
      </main>

      {/* F4 — Einzel-Löschung im strengen Standard. */}
      <StrictDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Sitzung löschen?"
        description={
          pendingDelete
            ? `„${sessionTitle(pendingDelete)}“ wird endgültig gelöscht. Die Sitzung ist nur lokal auf diesem Gerät gespeichert — es gibt kein Backup durch uns.`
            : ""
        }
        checkboxLabel="Ich habe verstanden, dass meine Sitzung unwiderruflich gelöscht wird."
        confirmLabel="Endgültig löschen"
        onExport={() => {
          if (pendingDelete) void exportFresh(pendingDelete.meta.id);
        }}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      />

      {/* F3 — Alle Daten löschen, gleicher strenger Standard. */}
      <StrictDeleteDialog
        open={deleteAllOpen}
        onOpenChange={setDeleteAllOpen}
        title="Alle lokalen Daten löschen?"
        description={`Alle Sitzungen (${sessions?.length ?? 0}) und Einstellungen auf diesem Gerät werden endgültig gelöscht — es gibt kein Backup durch uns.`}
        checkboxLabel="Ich habe verstanden, dass alle Sitzungen und Einstellungen unwiderruflich gelöscht werden."
        confirmLabel="Alles endgültig löschen"
        onExport={() => {
          void exportAllFresh();
        }}
        exportLabel="Alle Sitzungen als Sicherungsdateien herunterladen"
        onConfirm={() => {
          void handleConfirmDeleteAll();
        }}
      />
    </div>
  );
}
