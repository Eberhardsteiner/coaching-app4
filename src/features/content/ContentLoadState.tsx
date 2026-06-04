import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

type ContentLoadStateProps = {
  status: "loading" | "error";
  error?: string | null;
  onRetry: () => void;
  loadingLabel?: string;
};

/**
 * Accessible loading / error state for lazily-loaded content. The error state
 * offers "Erneut versuchen"; the rest of the app stays usable on failure.
 */
export function ContentLoadState({
  status,
  error,
  onRetry,
  loadingLabel = "Wird geladen …",
}: ContentLoadStateProps) {
  if (status === "loading") {
    return (
      <p role="status" className="text-sm text-muted">
        {loadingLabel}
      </p>
    );
  }

  return (
    <div
      role="alert"
      className="rounded-lg border border-subtle bg-surface-2 p-4"
    >
      <p className="text-sm text-foreground">
        {error ?? "Inhalt konnte nicht geladen werden."}
      </p>
      <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
        <RotateCcw />
        Erneut versuchen
      </Button>
    </div>
  );
}
