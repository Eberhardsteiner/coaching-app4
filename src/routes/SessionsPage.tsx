import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { usePersona } from "@/app/theme-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { BRANCH_LABELS } from "@/config/constants";
import { ImportButton } from "@/features/session/ImportButton";
import {
  clearLastActiveId,
  deleteSession,
  getLastActiveId,
  listSessions,
  setSessionBranch,
} from "@/features/session/sessionRepository";
import { useSessionStore } from "@/features/session/sessionStore";
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
    await deleteSession(target.meta.id);
    // Clear the in-memory active session if it was the deleted one...
    if (activeId === target.meta.id) {
      clearActive();
    }
    // ...and the persisted pointer too (even when no session is active in this
    // tab), so a deleted session is never resumed — no orphan state.
    if ((await getLastActiveId()) === target.meta.id) {
      await clearLastActiveId();
    }
    setPendingDelete(null);
    await reload();
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
      </main>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sitzung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `„${sessionTitle(pendingDelete)}“ wird unwiderruflich von diesem Gerät gelöscht.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Abbrechen</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() => {
                  void handleConfirmDelete();
                }}
              >
                Löschen
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
