import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PolarityToggle } from "@/features/phases/phase3/ResourceHarvest";
import type { ResourceItem } from "@/features/session/types";

type ResourceListEditorProps = {
  items: ResourceItem[];
  onItemsChange: (next: ResourceItem[]) => void;
  /** Label for the add button. */
  addLabel?: string;
  /** Placeholder for each item input. */
  placeholder?: string;
  /** Accessible label prefix for each row (numbered). */
  itemLabel?: string;
  /** Message shown when the list is empty. */
  emptyHint?: string;
  /**
   * When set, each row gets a second (narrower) input bound to `item.note` —
   * e.g. the model name for "Ressourcen aus Modellen" (MP3). Existing
   * usages without this prop are unchanged (text-only rows).
   */
  noteLabel?: string;
  notePlaceholder?: string;
  /**
   * When true, each row gets a förderlich/hinderlich toggle bound to
   * `item.polarity` — MP3 rates directly in each step (3.6/3.8), so these
   * entries stay reachable for the counters and the Phase-4/5 pickers.
   */
  withPolarity?: boolean;
  /**
   * Hide the add button — edit/delete only. Used for legacy blocks whose
   * field must not be actively refilled (e.g. phase4.preMortem, MP4).
   */
  hideAdd?: boolean;
};

/**
 * Small reusable list editor for ResourceItem[]: add / edit / delete on
 * `item.text`, plus an optional prop-driven `item.note` field per row. Used
 * for the various Phase-3 resource lists and inside KiImpuls.
 */
export function ResourceListEditor({
  items,
  onItemsChange,
  addLabel = "Hinzufügen",
  placeholder = "…",
  itemLabel = "Eintrag",
  emptyHint,
  noteLabel,
  notePlaceholder,
  withPolarity = false,
  hideAdd = false,
}: ResourceListEditorProps) {
  const [focusId, setFocusId] = useState<string | null>(null);

  function add() {
    const item: ResourceItem = { id: crypto.randomUUID(), text: "" };
    setFocusId(item.id);
    onItemsChange([...items, item]);
  }

  function update(id: string, partial: Partial<ResourceItem>) {
    onItemsChange(
      items.map((item) => (item.id === id ? { ...item, ...partial } : item)),
    );
  }

  function remove(id: string) {
    onItemsChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-2">
      {items.length === 0 && emptyHint ? (
        <p className="text-xs text-faint">{emptyHint}</p>
      ) : null}

      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          {noteLabel ? (
            <Input
              value={item.note ?? ""}
              aria-label={`${noteLabel} für ${itemLabel} ${index + 1}`}
              onChange={(event) =>
                update(item.id, { note: event.target.value })
              }
              placeholder={notePlaceholder ?? noteLabel}
              className="w-32 shrink-0 sm:w-44"
            />
          ) : null}
          <Input
            value={item.text}
            autoFocus={item.id === focusId}
            aria-label={`${itemLabel} ${index + 1}`}
            onChange={(event) => update(item.id, { text: event.target.value })}
            placeholder={placeholder}
            className="min-w-0 flex-1"
          />
          {withPolarity ? (
            <PolarityToggle
              value={item.polarity}
              onChange={(next) => update(item.id, { polarity: next })}
              helpLabel="förderlich"
              hinderLabel="hinderlich"
              ariaContext={`${itemLabel} ${index + 1}`}
            />
          ) : null}
          <button
            type="button"
            onClick={() => remove(item.id)}
            aria-label={`${itemLabel} ${index + 1} löschen`}
            title="Löschen"
            className="flex size-8 shrink-0 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}

      {!hideAdd ? (
        <Button variant="outline" size="sm" onClick={add}>
          <Plus />
          {addLabel}
        </Button>
      ) : null}
    </div>
  );
}
