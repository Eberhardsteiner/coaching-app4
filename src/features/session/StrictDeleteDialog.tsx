import { Download } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

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

type StrictDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Clear consequence description (endgültig, nur lokal, kein Backup). */
  description: ReactNode;
  /** Confirmation checkbox wording ("Ich habe verstanden, dass …"). */
  checkboxLabel: string;
  /** Label of the destructive action button. */
  confirmLabel: string;
  /** Optional export reminder: renders the inline backup-download button. */
  onExport?: () => void;
  exportLabel?: string;
  /** Runs the actual deletion (only reachable with the checkbox ticked). */
  onConfirm: () => void;
};

/**
 * The app-wide STRICT delete confirmation (MP5): a consequence description,
 * an inline export reminder ("erst sichern, dann löschen") and a mandatory
 * understanding checkbox — the destructive button only arms once it is
 * ticked. Used for single-session deletion (completion page + SessionsPage)
 * and for "Alle lokalen Daten löschen". The checkbox resets on every open.
 */
export function StrictDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  checkboxLabel,
  confirmLabel,
  onExport,
  exportLabel = "Vorher Sicherungsdatei herunterladen",
  onConfirm,
}: StrictDeleteDialogProps) {
  const [understood, setUnderstood] = useState(false);

  // Re-arm the safety on every open/close — never remember the tick. The
  // reset of this transient gate is not derivable in render, hence the effect.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUnderstood(false);
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {onExport ? (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-subtle bg-surface-2 p-3">
            <p className="min-w-0 flex-1 text-sm text-muted">
              Sichere deine Daten, bevor du löschst:
            </p>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download />
              {exportLabel}
            </Button>
          </div>
        ) : null}

        <label
          htmlFor="strict-delete-understood"
          className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-subtle bg-surface p-3"
        >
          <input
            id="strict-delete-understood"
            type="checkbox"
            checked={understood}
            onChange={(event) => setUnderstood(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-accent"
          />
          <span className="text-sm text-foreground">{checkboxLabel}</span>
        </label>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Abbrechen</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              disabled={!understood}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
