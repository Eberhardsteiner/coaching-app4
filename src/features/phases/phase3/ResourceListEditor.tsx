import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
};

/**
 * Small reusable list editor for ResourceItem[] (text only): add / edit /
 * delete. Used for the various Phase-3 resource lists and inside KiImpuls.
 * `card.text` is the single field edited here; notes/polarity come later.
 */
export function ResourceListEditor({
  items,
  onItemsChange,
  addLabel = "Hinzufügen",
  placeholder = "…",
  itemLabel = "Eintrag",
  emptyHint,
}: ResourceListEditorProps) {
  const [focusId, setFocusId] = useState<string | null>(null);

  function add() {
    const item: ResourceItem = { id: crypto.randomUUID(), text: "" };
    setFocusId(item.id);
    onItemsChange([...items, item]);
  }

  function update(id: string, text: string) {
    onItemsChange(
      items.map((item) => (item.id === id ? { ...item, text } : item)),
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
          <input
            type="text"
            value={item.text}
            autoFocus={item.id === focusId}
            aria-label={`${itemLabel} ${index + 1}`}
            onChange={(event) => update(item.id, event.target.value)}
            placeholder={placeholder}
            className="min-w-0 flex-1 rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
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

      <Button variant="outline" size="sm" onClick={add}>
        <Plus />
        {addLabel}
      </Button>
    </div>
  );
}
