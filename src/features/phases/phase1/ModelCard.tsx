import { HelpCircle, type LucideIcon } from "lucide-react";
import { type PointerEvent, type ReactNode, useId, useState } from "react";

import { useModel } from "@/features/content/useModel";
import { cn } from "@/lib/utils";

/** Presentation metadata for a model button (icon + Anliegen + short description). */
export interface ModelMeta {
  icon: LucideIcon;
  anliegen: string;
  summary: string;
  /** Optionaler Untertitel/Thema des Modells (z. B. „Change in Unternehmen"). */
  subtitle?: string;
  /** Optionale ausführliche Beschreibung, gezeigt sobald das Modell gewählt ist. */
  description?: ReactNode;
}

/** Per-model identity accent (Tailwind classes backed by the --color-model-* tokens). */
type ModelAccent = {
  /** Icon-chip fill (soft tint). */
  chipBg: string;
  /** Icon colour (base). */
  chipIcon: string;
  /** Anliegen-pill fill (soft tint) + text (ink, readable on the tint). */
  pillBg: string;
  pillText: string;
  /** Selected: base-colour border + a very soft tinted card background. */
  selBorder: string;
  selBg: string;
};

/**
 * Model id → identity accent. Deliberately away from IST-rosa and the stage
 * colours (Amber/Grün): Indigo · Teal · Terrakotta · Pflaume. Colours come only
 * from the --color-model-* tokens (no hardcoded hex here).
 */
const MODEL_ACCENTS: Record<string, ModelAccent> = {
  "st-galler": {
    chipBg: "bg-model-stgaller-soft",
    chipIcon: "text-model-stgaller",
    pillBg: "bg-model-stgaller-soft",
    pillText: "text-model-stgaller-ink",
    selBorder: "border-model-stgaller",
    selBg: "bg-model-stgaller-soft/40",
  },
  "gesundheit-konstruktivistisch": {
    chipBg: "bg-model-gesundheit-soft",
    chipIcon: "text-model-gesundheit",
    pillBg: "bg-model-gesundheit-soft",
    pillText: "text-model-gesundheit-ink",
    selBorder: "border-model-gesundheit",
    selBg: "bg-model-gesundheit-soft/40",
  },
  "drei-k": {
    chipBg: "bg-model-dreik-soft",
    chipIcon: "text-model-dreik",
    pillBg: "bg-model-dreik-soft",
    pillText: "text-model-dreik-ink",
    selBorder: "border-model-dreik",
    selBg: "bg-model-dreik-soft/40",
  },
  "zehn-felder": {
    chipBg: "bg-model-zehnfelder-soft",
    chipIcon: "text-model-zehnfelder",
    pillBg: "bg-model-zehnfelder-soft",
    pillText: "text-model-zehnfelder-ink",
    selBorder: "border-model-zehnfelder",
    selBg: "bg-model-zehnfelder-soft/40",
  },
};

/** Neutral fallback (persona accent) for any model without a mapped accent. */
const DEFAULT_ACCENT: ModelAccent = {
  chipBg: "bg-surface-2",
  chipIcon: "text-accent",
  pillBg: "bg-surface-2",
  pillText: "text-muted",
  selBorder: "border-accent",
  selBg: "bg-accent/5",
};

/**
 * A selectable model card with an accessible explain-flyover. Layout: a tinted
 * icon-chip (top-left) + the explain trigger (top-right), the title full width
 * below, then a coloured Anliegen pill and the short description. Each model has
 * its own calm identity accent (icon-chip, pill, selected state). The flyover
 * (model description + term preview) opens on mouse hover, on keyboard focus of
 * the info trigger AND on tap/click — never hover-only; Escape closes it. The
 * term preview is loaded lazily (useModel). No rosa here (rosa stays IST-only).
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
  const accent = MODEL_ACCENTS[id] ?? DEFAULT_ACCENT;

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
      className="relative h-full"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className={cn(
          "flex h-full w-full flex-col gap-2.5 rounded-2xl p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          selected
            ? cn("border-[1.5px]", accent.selBorder, accent.selBg)
            : "border-[0.5px] border-subtle bg-surface hover:bg-surface-2",
        )}
      >
        {/* Tinted icon chip (top-left). The explain trigger sits top-right. */}
        <span
          className={cn(
            "flex size-[46px] items-center justify-center rounded-[13px]",
            accent.chipBg,
          )}
        >
          <Icon className={cn("size-[22px]", accent.chipIcon)} aria-hidden />
        </span>

        {/* Title — full width, wraps cleanly below the chip. */}
        <span className="text-[16.5px] font-medium leading-snug text-foreground">
          {name}
        </span>

        {/* Anliegen as a coloured pill. */}
        {meta.anliegen ? (
          <span
            className={cn(
              "inline-flex self-start rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
              accent.pillBg,
              accent.pillText,
            )}
          >
            {meta.anliegen}
          </span>
        ) : null}

        {/* Short description. */}
        <span className="text-[13.5px] leading-[1.55] text-muted">
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
        className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
