import { useRef, useState } from "react";
import { Check, Copy, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { ResourceListEditor } from "@/features/phases/phase3/ResourceListEditor";
import type { ResourceItem } from "@/features/session/types";

type KiImpulsProps = {
  /** The socratic prompt, assembled by the parent from session data. */
  promptText: string;
  /** Optional lead-in shown above the prompt. */
  note?: string;
  /** The list the brought-back impulses are captured into. */
  items: ResourceItem[];
  onItemsChange: (next: ResourceItem[]) => void;
  /** Label for the capture add-button / rows. */
  captureLabel?: string;
  /** Optional second capture field per row (→ item.note), e.g. "Modell". */
  captureNoteLabel?: string;
  captureNotePlaceholder?: string;
  /** Rate each captured entry förderlich/hinderlich in place (MP3). */
  captureWithPolarity?: boolean;
};

/**
 * Reusable AI building block — *no backend, no API call* (escalation level E2).
 * The app only assembles a socratic prompt for the user to copy into an AI tool
 * of their choice; the brought-back impulses are captured into `items`. In WP8
 * the direct Claude API will be added *behind* this same component (the API is
 * deliberately not wired here yet).
 */
export function KiImpuls({
  promptText,
  note,
  items,
  onItemsChange,
  captureLabel = "Impuls",
  captureNoteLabel,
  captureNotePlaceholder,
  captureWithPolarity = false,
}: KiImpulsProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — select for manual copy.
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.select();
      }
    }
  }

  return (
    <div className="space-y-4">
      {note ? <p className="text-muted">{note}</p> : null}

      {/* Prominent privacy / §9.0 notice */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
        <Info className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden />
        <p className="text-sm text-amber-900">
          Du kopierst diesen Text selbst in ein KI-Tool deiner Wahl — die App
          sendet nichts. Bitte prüfe vorher, dass keine personenbezogenen Daten
          enthalten sind.
        </p>
      </div>

      {/* Generated socratic prompt (read-only) */}
      <div className="space-y-2">
        <label
          htmlFor="ki-prompt"
          className="block text-sm font-medium text-foreground"
        >
          Dein Impuls-Prompt
        </label>
        <textarea
          id="ki-prompt"
          ref={textareaRef}
          readOnly
          value={promptText}
          rows={6}
          className="w-full resize-y rounded-lg border border-subtle bg-surface-2 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={copyPrompt}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Kopiert" : "Prompt kopieren"}
          </Button>
          <span aria-live="polite" className="text-xs text-muted">
            {copied ? "In die Zwischenablage kopiert." : ""}
          </span>
        </div>
      </div>

      {/* Capture brought-back impulses */}
      <div className="space-y-2 border-t border-subtle pt-4">
        <p className="text-sm font-medium text-foreground">
          Bringe die Impulse, die du dort bekommst, hier zurück.
        </p>
        <ResourceListEditor
          items={items}
          onItemsChange={onItemsChange}
          addLabel={captureLabel}
          placeholder="ein Impuls, eine Frage, eine Ressource …"
          itemLabel={captureLabel}
          emptyHint="Noch nichts erfasst."
          noteLabel={captureNoteLabel}
          notePlaceholder={captureNotePlaceholder}
          withPolarity={captureWithPolarity}
        />
        <NoPersonalDataHint />
      </div>
    </div>
  );
}
