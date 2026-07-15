import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Visual-Baukasten (VIS-2): Karte mit Icon + Titelzeile + kurzem Text und
 * optional aufklappbarem Detail — ersetzt erklärende Fließtext-Absätze.
 * `icon` ist ein fertiges Element (Lucide-Icon oder PhaseSymbol), damit beide
 * Symbolwelten passen. Töne: accent (Standard), ist (nur IST-Bezüge!),
 * neutral. Volltexte, die nicht sichtbar verdichtet werden können, gehören in
 * `detail` — nichts geht verloren, es wandert nur hinter die Überschrift.
 */
export function InfoCallout({
  icon,
  title,
  children,
  detail,
  detailLabel = "Mehr dazu",
  tone = "accent",
}: {
  icon: ReactNode;
  title: string;
  /** The short, always-visible text (keep it to 1–2 sentences). */
  children?: ReactNode;
  /** Collapsible full text / background (nothing lost, off the surface). */
  detail?: ReactNode;
  detailLabel?: string;
  tone?: "accent" | "ist" | "neutral";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        tone === "ist"
          ? "border-ist/30 bg-ist/5"
          : tone === "accent"
            ? "border-accent/25 bg-accent/5"
            : "border-subtle bg-surface-2",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            tone === "ist"
              ? "bg-ist/10 text-ist"
              : tone === "accent"
                ? "bg-accent/10 text-accent"
                : "bg-surface text-muted",
          )}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {children ? (
            <div className="mt-1 text-sm leading-relaxed text-muted">
              {children}
            </div>
          ) : null}
          {detail ? (
            <details className="group mt-1.5">
              <summary
                className={cn(
                  "flex cursor-pointer list-none items-center gap-1 text-xs font-medium",
                  tone === "ist" ? "text-ist" : "text-accent",
                )}
              >
                <ChevronDown
                  className="size-3.5 motion-safe:transition-transform group-open:rotate-180"
                  aria-hidden
                />
                {detailLabel}
              </summary>
              <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-muted">
                {detail}
              </div>
            </details>
          ) : null}
        </div>
      </div>
    </div>
  );
}
