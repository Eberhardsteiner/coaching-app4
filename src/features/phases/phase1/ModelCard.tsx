import { HelpCircle, type LucideIcon } from "lucide-react";
import { type PointerEvent, useId, useState } from "react";

import { useModel } from "@/features/content/useModel";
import { cn } from "@/lib/utils";

/** Presentation metadata for a model button (icon + Anliegen + short description). */
export interface ModelMeta {
  icon: LucideIcon;
  anliegen: string;
  summary: string;
}

/**
 * A selectable model card with an accessible explain-flyover. The flyover (model
 * description + term preview) opens on mouse hover, on keyboard focus of the info
 * trigger AND on tap/click — it is never hover-only. Escape closes it. The term
 * preview is loaded lazily (useModel) from the content layer. Selection markers
 * and the icon use the persona accent (never rosa).
 */
export function ModelCard({
  id,
  name,
  meta,
  selected,
  onSelect,
}: {
  id: string;
  name: string;
  meta: ModelMeta;
  selected: boolean;
  onSelect: () => void;
}) {
  const [open, setOpen] = useState(false);
  const flyoverId = useId();
  const loaded = useModel(id);
  const Icon = meta.icon;

  // Hover opens it for mouse only (so a tap doesn't immediately re-close it).
  function onPointerEnter(event: PointerEvent) {
    if (event.pointerType === "mouse") setOpen(true);
  }
  function onPointerLeave(event: PointerEvent) {
    if (event.pointerType === "mouse") setOpen(false);
  }

  const terms = loaded.model?.terms ?? [];

  return (
    <div
      className="relative"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className={cn(
          "flex w-full flex-col gap-1.5 rounded-xl border p-4 pr-11 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          selected
            ? "border-accent bg-accent/5"
            : "border-subtle bg-surface hover:bg-surface-2",
        )}
      >
        <span className="flex items-center gap-2">
          <Icon className="size-5 shrink-0 text-accent" aria-hidden />
          <span className="font-medium text-foreground">{name}</span>
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-accent">
          {meta.anliegen}
        </span>
        <span className="text-sm leading-relaxed text-muted">
          {meta.summary}
        </span>
      </button>

      {/* Explain-flyover trigger: focusable, tappable; hover handled on the card. */}
      <button
        type="button"
        aria-label={`Mehr zum Modell „${name}“`}
        aria-expanded={open}
        aria-describedby={flyoverId}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <HelpCircle className="size-4" aria-hidden />
      </button>

      {/* Flyover panel — flush under the card (no hover gap), floats over siblings. */}
      {open ? (
        <div
          id={flyoverId}
          role="tooltip"
          className="absolute inset-x-0 top-full z-20 rounded-xl border border-subtle bg-background p-4 shadow-lg motion-safe:animate-[fade-in_120ms_ease-out]"
        >
          <p className="text-sm leading-relaxed text-foreground">
            {meta.summary}
          </p>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-faint">
            Begriffe (Vorschau)
          </p>
          {loaded.status === "ready" && terms.length > 0 ? (
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {terms.map((term) => term.label).join(" · ")}
            </p>
          ) : (
            <p className="mt-1 text-sm text-faint">
              {loaded.status === "error"
                ? "Begriffe konnten nicht geladen werden."
                : "wird geladen …"}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
