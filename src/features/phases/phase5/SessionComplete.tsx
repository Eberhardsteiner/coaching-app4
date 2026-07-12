import { Check, Download, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { ContactCard } from "@/components/ContactCard";
import { Button } from "@/components/ui/button";
import { METHOD_LABELS } from "@/config/method";
import { downloadSession } from "@/features/session/exportSession";
import { deleteSessionAndPointer } from "@/features/session/sessionRepository";
import { useSessionStore } from "@/features/session/sessionStore";
import { StrictDeleteDialog } from "@/features/session/StrictDeleteDialog";

/** Go-live-Wunsch (wortgetreu, SMC interpoliert, Zweig-Variante — Paket D). */
function goLive(coached: boolean): string {
  const label = coached
    ? `${METHOD_LABELS.standardShort}-Coaching`
    : `${METHOD_LABELS.standardShort}-Selbstcoaching`;
  return `Und nun viel Erfolg mit dem ‚Go live!‘ — und herzlichen Dank, dass du dich unserem ${label} anvertraut hast!`;
}

/**
 * The full completion page shown once Phase 5 is finished (MP5): a calm,
 * quietly celebratory hero band (the landing motif), the strengthening core
 * message + go-live wish (branch variant), and the action cards — summary/PDF,
 * JSON backup, contact, new session, and the STRICT delete (deliberately
 * placed last: export before delete). The session stays intact; "Phase 5 noch
 * einmal ansehen" reopens the steps.
 */
export function SessionComplete({ onReview }: { onReview: () => void }) {
  const navigate = useNavigate();
  const session = useSessionStore((s) => s.session);
  const clearActive = useSessionStore((s) => s.clearActive);
  const coached = session?.meta.branch === "coached";
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleExport() {
    if (session) downloadSession(session);
  }

  async function handleDelete() {
    if (!session) return;
    await deleteSessionAndPointer(session.meta.id);
    clearActive();
    setDeleteOpen(false);
    navigate("/");
  }

  return (
    <div className="mx-auto max-w-2xl pb-10">
      {/* Quietly celebratory hero band — the landing motif. */}
      <div className="relative overflow-hidden rounded-2xl bg-hero-gradient px-6 py-10 text-center text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span
            className="animate-pulse-calm absolute left-[8%] top-[16%] size-28 rounded-full bg-green-200/20 ring-1 ring-white/10"
            style={{ animationDelay: "0s" }}
          />
          <span
            className="animate-pulse-calm absolute right-[10%] top-[30%] size-36 rounded-full bg-blue-400/20 ring-1 ring-white/10"
            style={{ animationDelay: "-3s" }}
          />
          <span
            className="animate-pulse-calm absolute bottom-[-2rem] left-1/3 size-32 rounded-full bg-teal-200/15 ring-1 ring-white/10"
            style={{ animationDelay: "-6s" }}
          />
        </div>
        <div className="relative">
          <div
            className="mx-auto flex size-14 items-center justify-center rounded-full bg-white/15 text-white"
            aria-hidden
          >
            <Check className="size-7" />
          </div>
          <h2 className="mt-5 font-serif text-2xl sm:text-3xl">
            Geschafft — du hast den ganzen Prozess durchlaufen.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-blue-100">
            Dieser Weg gehört dir; er ist erlernbar und wiederholbar — du kannst
            ihn jederzeit selbst wieder gehen.
          </p>
          <p className="mx-auto mt-3 max-w-lg font-medium text-teal-100">
            {goLive(coached)}
          </p>
        </div>
      </div>

      {/* Action cards — export deliberately before delete. */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-subtle bg-surface p-4">
          <p className="text-sm font-medium text-foreground">
            Deine Zusammenfassung
          </p>
          <p className="mt-1 text-sm text-muted">
            Alle Ergebnisse auf einen Blick — druckfertig.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => navigate("/zusammenfassung")}
          >
            <FileText />
            Ansehen &amp; als PDF speichern
          </Button>
        </div>

        <div className="rounded-xl border border-subtle bg-surface p-4">
          <p className="text-sm font-medium text-foreground">
            Sicherungsdatei (JSON)
          </p>
          <p className="mt-1 text-sm text-muted">
            Damit kannst du deine Sitzung später wieder importieren.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={handleExport}
          >
            <Download />
            Sicherungsdatei herunterladen
          </Button>
        </div>

        <ContactCard />

        <div className="rounded-xl border border-subtle bg-surface p-4">
          <p className="text-sm font-medium text-foreground">
            Noch einmal von vorn?
          </p>
          <p className="mt-1 text-sm text-muted">
            Starte eine neue Sitzung — der Prozess bleibt dir erhalten.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => navigate("/start")}
          >
            <Plus />
            Neue Sitzung starten
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onReview}>
          Phase 5 noch einmal ansehen
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 />
          Diese Sitzung löschen
        </Button>
      </div>

      <StrictDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Diese Sitzung löschen?"
        description="Deine Sitzung wird endgültig gelöscht. Sie ist nur lokal auf diesem Gerät gespeichert — es gibt kein Backup durch uns."
        checkboxLabel="Ich habe verstanden, dass meine Sitzung unwiderruflich gelöscht wird."
        confirmLabel="Endgültig löschen"
        onExport={handleExport}
        onConfirm={() => {
          void handleDelete();
        }}
      />
    </div>
  );
}
