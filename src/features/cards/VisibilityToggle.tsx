import { Eye, EyeOff } from "lucide-react";

import type { Visibility } from "@/features/session/types";
import { cn } from "@/lib/utils";

type VisibilityToggleProps = {
  visibility: Visibility;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Small, keyboard-operable per-card visibility switch (shared ↔ coach_only).
 * Eye = shared (on the stage); EyeOff = coach_only (the coach's private view).
 * `aria-pressed` reflects the coach_only ("private") state.
 */
export function VisibilityToggle({
  visibility,
  onToggle,
  disabled,
  className,
}: VisibilityToggleProps) {
  const coachOnly = visibility === "coach_only";
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={coachOnly}
      aria-label={
        coachOnly
          ? "Nur für Coach sichtbar — auf geteilt umschalten"
          : "Geteilt sichtbar — auf nur für Coach umschalten"
      }
      title={coachOnly ? "Nur für Coach" : "Geteilt"}
      className={cn(
        "flex size-6 items-center justify-center rounded hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        coachOnly ? "text-accent" : "text-current/60 hover:text-current",
        className,
      )}
    >
      {coachOnly ? (
        <EyeOff className="size-3.5" />
      ) : (
        <Eye className="size-3.5" />
      )}
    </button>
  );
}
