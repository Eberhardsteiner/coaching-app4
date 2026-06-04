import { Info } from "lucide-react";

type NoPersonalDataHintProps = {
  /** Example wording shown to the user. */
  example?: string;
};

/**
 * Reusable §9.0 hint shown next to free-text fields: please don't enter
 * personal data. Reused across the phases wherever free text is collected.
 */
export function NoPersonalDataHint({
  example = "meine Kollegin",
}: NoPersonalDataHintProps) {
  return (
    <p className="flex items-start gap-1.5 text-xs text-faint">
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>
        Bitte keine Klarnamen oder identifizierenden Details — schreib z. B. „
        {example}“.
      </span>
    </p>
  );
}
