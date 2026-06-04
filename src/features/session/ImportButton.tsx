import { Upload } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useSessionImport } from "@/features/session/useSessionImport";
import { cn } from "@/lib/utils";

type ImportButtonProps = {
  /** Render as a compact icon-only button (e.g. in the TopBar). */
  iconOnly?: boolean;
  /** Accessible label / visible text. */
  label?: string;
  variant?: ButtonProps["variant"];
  className?: string;
};

/**
 * Self-contained "import a session" control: a trigger, a hidden file input and
 * an accessible error dialog. Drop it anywhere import should be offered.
 */
export function ImportButton({
  iconOnly = false,
  label = "Sitzung importieren",
  variant = "outline",
  className,
}: ImportButtonProps) {
  const { inputRef, trigger, onChange, error, clearError, busy } =
    useSessionImport();

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onChange}
      />

      {iconOnly ? (
        <button
          type="button"
          onClick={trigger}
          disabled={busy}
          aria-label={label}
          title={label}
          className={cn(
            "flex size-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-50",
            className,
          )}
        >
          <Upload className="size-5" />
        </button>
      ) : (
        <Button
          type="button"
          variant={variant}
          onClick={trigger}
          disabled={busy}
          className={className}
        >
          <Upload />
          {label}
        </Button>
      )}

      <AlertDialog
        open={error !== null}
        onOpenChange={(open) => {
          if (!open) clearError();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import nicht möglich</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button>Verstanden</Button>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
