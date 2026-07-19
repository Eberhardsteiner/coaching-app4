import { Check, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ModelTerm } from "@/features/content/contentTypes";
import type { ResourceItem } from "@/features/session/types";
import { cn } from "@/lib/utils";

type Polarity = "foerderlich" | "hinderlich";

/**
 * Two-button polarity rating (sets `polarity` on a ResourceItem). The UI
 * labels vary by step (hilfreich/hinderlich vs. zielförderlich/zielhinderlich)
 * while the persisted value stays "foerderlich" | "hinderlich" (contract).
 * Clicking the active rating again clears it (offen).
 */
export function PolarityToggle({
  value,
  onChange,
  helpLabel = "hilfreich",
  hinderLabel = "hinderlich",
  ariaContext,
}: {
  value?: Polarity;
  onChange: (next: Polarity | undefined) => void;
  helpLabel?: string;
  hinderLabel?: string;
  ariaContext: string;
}) {
  return (
    <div
      role="group"
      aria-label={`Wertung für ${ariaContext}`}
      className="inline-flex shrink-0 overflow-hidden rounded-lg border border-subtle"
    >
      <button
        type="button"
        aria-pressed={value === "foerderlich"}
        onClick={() =>
          onChange(value === "foerderlich" ? undefined : "foerderlich")
        }
        className={cn(
          "px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
          value === "foerderlich"
            ? "bg-green-600 text-white"
            : "bg-surface text-muted hover:text-foreground",
        )}
      >
        {helpLabel}
      </button>
      <button
        type="button"
        aria-pressed={value === "hinderlich"}
        onClick={() =>
          onChange(value === "hinderlich" ? undefined : "hinderlich")
        }
        className={cn(
          "border-l border-subtle px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
          value === "hinderlich"
            ? "bg-amber-600 text-white"
            : "bg-surface text-muted hover:text-foreground",
        )}
      >
        {hinderLabel}
      </button>
    </div>
  );
}

/**
 * Harvest pattern for the term-based steps (3.2 Intelligenzen, 3.3 Motive/PE):
 * model terms as cards with a collapsible description and a take-button; every
 * taken entry is rated in place (hilft/hindert — in Bezug auf das Ziel, direkt
 * im Schritt, kein nachgelagertes Sortieren). "Trifft beides zu": take once,
 * then add the term a second time via the own-entry input (documented
 * pragmatic choice — the hint below says so). Own additions count like terms.
 */
export function ResourceHarvest({
  terms,
  items,
  onItemsChange,
  polarityQuestion,
  helpLabel = "hilfreich",
  hinderLabel = "hinderlich",
  ownLabel,
  ownPlaceholder,
  takenLabel = "Übernommen",
  bulletHints = false,
}: {
  terms: ModelTerm[];
  items: ResourceItem[];
  onItemsChange: (next: ResourceItem[]) => void;
  /** Question shown above the rated list (method wording per step). */
  polarityQuestion: string;
  helpLabel?: string;
  hinderLabel?: string;
  /** Label for the own-entry input, e.g. "Eigene Ergänzung". */
  ownLabel: string;
  ownPlaceholder?: string;
  takenLabel?: string;
  /**
   * Render the term description as a bullet list (split at ";") instead of a
   * paragraph — the template shows the Intelligenz descriptions as a compact
   * feature list (MP3-REV).
   */
  bulletHints?: boolean;
}) {
  const [own, setOwn] = useState("");

  const isTaken = (term: ModelTerm) =>
    items.some((item) => item.text === term.label);

  function take(term: ModelTerm) {
    if (isTaken(term)) return;
    onItemsChange([...items, { id: crypto.randomUUID(), text: term.label }]);
  }

  function addOwn() {
    const text = own.trim();
    if (!text) return;
    onItemsChange([...items, { id: crypto.randomUUID(), text }]);
    setOwn("");
  }

  function setPolarity(id: string, polarity: Polarity | undefined) {
    onItemsChange(
      items.map((item) => (item.id === id ? { ...item, polarity } : item)),
    );
  }

  function remove(id: string) {
    onItemsChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-5">
      {/* Terms with collapsible descriptions */}
      <ul className="grid gap-2 sm:grid-cols-2">
        {terms.map((term) => {
          const taken = isTaken(term);
          return (
            <li
              key={term.id}
              className="rounded-lg border border-subtle bg-surface p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 text-sm font-medium text-foreground">
                  {term.label}
                </p>
                <Button
                  variant={taken ? "ghost" : "outline"}
                  size="sm"
                  className="shrink-0"
                  disabled={taken}
                  onClick={() => take(term)}
                >
                  {taken ? <Check /> : <Plus />}
                  {taken ? takenLabel : "Übernehmen"}
                </Button>
              </div>
              {term.hint ? (
                <details className="group mt-1.5">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-accent">
                    <ChevronDown
                      className="size-3.5 motion-safe:transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                    Beschreibung
                  </summary>
                  {bulletHints ? (
                    <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-sm text-muted">
                      {term.hint
                        .split(/;\s*/)
                        .map((part) => part.trim().replace(/\.$/, ""))
                        .filter(Boolean)
                        .map((part) => (
                          <li key={part}>{part}</li>
                        ))}
                    </ul>
                  ) : (
                    <p className="mt-1.5 text-sm text-muted">{term.hint}</p>
                  )}
                </details>
              ) : null}
            </li>
          );
        })}
      </ul>

      {/* Own addition */}
      <div className="flex max-w-md items-end gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <label
            htmlFor={`own-${ownLabel}`}
            className="block text-sm font-medium text-foreground"
          >
            {ownLabel}
          </label>
          <Input
            id={`own-${ownLabel}`}
            value={own}
            onChange={(event) => setOwn(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addOwn();
              }
            }}
            placeholder={ownPlaceholder}
          />
        </div>
        <Button variant="outline" size="sm" onClick={addOwn}>
          <Plus />
          Hinzufügen
        </Button>
      </div>

      {/* Taken entries with in-place rating */}
      {items.length > 0 ? (
        <div className="space-y-2 border-t border-subtle pt-4">
          <p className="text-sm font-medium text-foreground">
            {polarityQuestion}
          </p>
          <ul className="space-y-1.5">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 rounded-lg border border-subtle bg-surface px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="min-w-0 text-sm text-foreground">
                  {item.text || "—"}
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <PolarityToggle
                    value={item.polarity}
                    onChange={(next) => setPolarity(item.id, next)}
                    helpLabel={helpLabel}
                    hinderLabel={hinderLabel}
                    ariaContext={`„${item.text || "Eintrag"}“`}
                  />
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label={`„${item.text || "Eintrag"}“ entfernen`}
                    title="Entfernen"
                    className="flex size-7 shrink-0 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-faint">
            Trifft je nach Betrachtungsweise beides zu? Dann nimm den Begriff
            über „{ownLabel}“ ein zweites Mal auf und werte ihn gegenteilig.
          </p>
        </div>
      ) : null}
    </div>
  );
}
