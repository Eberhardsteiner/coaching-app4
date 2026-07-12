import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

import { useSessionStore } from "@/features/session/sessionStore";
import type { DontPatternEntry, ResourceItem } from "@/features/session/types";
import { cn } from "@/lib/utils";

/** Stable empty defaults — optional fields must not loop useSyncExternalStore. */
const NO_ITEMS: ResourceItem[] = [];
const NO_DONTS: DontPatternEntry[] = [];

/** Split a list into hilfreich / hinderlich / offen. */
function splitByPolarity(items: ResourceItem[]) {
  return {
    hilfreich: items.filter((i) => i.polarity === "foerderlich"),
    hinderlich: items.filter((i) => i.polarity === "hinderlich"),
    offen: items.filter((i) => !i.polarity),
  };
}

/** One cockpit area card. `tone: "ist"` marks the Don't box (IST pattern). */
function Area({
  title,
  filled,
  emptyHint,
  tone = "default",
  wide = false,
  children,
}: {
  title: string;
  filled: boolean;
  emptyHint: string;
  tone?: "default" | "ist";
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className={cn(
        "rounded-xl border p-4",
        tone === "ist" ? "border-ist/40 bg-ist/5" : "border-subtle bg-surface",
        wide && "sm:col-span-2",
      )}
    >
      <h3
        className={cn(
          "text-sm font-semibold",
          tone === "ist" ? "text-ist" : "text-foreground",
        )}
      >
        {title}
      </h3>
      {filled ? (
        <div className="mt-3">{children}</div>
      ) : (
        <p className="mt-3 text-xs text-faint">{emptyHint}</p>
      )}
    </section>
  );
}

/** Two-column hilfreich | hinderlich split with open entries greyed below. */
function PolaritySplit({ items }: { items: ResourceItem[] }) {
  const { hilfreich, hinderlich, offen } = splitByPolarity(items);
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-green-600">
            Hilfreich
          </p>
          <ul className="mt-1 space-y-0.5 text-sm text-foreground">
            {hilfreich.map((i) => (
              <li key={i.id}>{i.text || "—"}</li>
            ))}
            {hilfreich.length === 0 ? (
              <li className="text-xs text-faint">—</li>
            ) : null}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
            Hinderlich
          </p>
          <ul className="mt-1 space-y-0.5 text-sm text-foreground">
            {hinderlich.map((i) => (
              <li key={i.id}>{i.text || "—"}</li>
            ))}
            {hinderlich.length === 0 ? (
              <li className="text-xs text-faint">—</li>
            ) : null}
          </ul>
        </div>
      </div>
      {offen.length > 0 ? (
        <p className="text-xs text-faint">
          Noch offen: {offen.map((i) => i.text || "—").join(" · ")}
        </p>
      ) : null}
    </div>
  );
}

/** Small polarity dot in front of a value entry. */
function PolarityDot({ polarity }: { polarity?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "mt-1.5 size-2 shrink-0 rounded-full",
        polarity === "foerderlich" && "bg-green-600",
        polarity === "hinderlich" && "bg-amber-600",
        !polarity && "border border-faint",
      )}
    />
  );
}

const VALUE_COLUMNS: { category: string; label: string }[] = [
  { category: "mensch", label: "Als Mensch" },
  { category: "funktion", label: "In meiner Funktion" },
  { category: "ziel", label: "Für mein Ziel" },
];

/**
 * Ressourcen-Cockpit (MP3, Folie 3) — the central board of Phase 3: a
 * read-only mirror of the phase3 data across eight areas that fill up step by
 * step (the steps are the single place of input; no double entry here). The
 * "Bisheriges Muster — Don't!" area is the one deliberate `ist`-token use in
 * Phase 3: it shows the IST pattern, rosa like the method template.
 */
export function RessourcenCockpit({ compact = false }: { compact?: boolean }) {
  const phase3 = useSessionStore((s) => s.session?.phase3);
  const clusters = useSessionStore((s) => s.session?.phase1.clusters ?? []);
  const personalityTraits = useSessionStore(
    (s) => s.session?.phase3.personalityTraits ?? NO_ITEMS,
  );
  const dontPattern = useSessionStore(
    (s) => s.session?.phase3.dontPattern ?? NO_DONTS,
  );
  if (!phase3) return null;

  const values = phase3.values;
  const othersValues = phase3.othersValues;
  const insight = (phase3.othersValuesInsight ?? "").trim();

  // Werte der Anderen, grouped per cluster (core first, then by weight).
  const clustersSorted = [...clusters].sort(
    (a, b) =>
      Number(b.isCore ?? false) - Number(a.isCore ?? false) ||
      (b.weight ?? 0) - (a.weight ?? 0),
  );
  const otherGroups = clustersSorted
    .map((cluster, index) => {
      const entries = othersValues.filter((i) => i.clusterId === cluster.id);
      return {
        id: cluster.id,
        name: cluster.name.trim() || `Cluster ${index + 1}`,
        wer: entries
          .filter((i) => i.category === "wer")
          .map((i) => i.text.trim())
          .filter(Boolean)
          .join(", "),
        skipped: entries.some((i) => i.category === "skip"),
        werte: entries.filter((i) => !i.category && i.text.trim()),
      };
    })
    .filter((g) => g.wer || g.werte.length > 0 || g.skipped);
  // Legacy entries without a (matching) cluster reference.
  const otherLegacy = othersValues.filter(
    (i) =>
      !i.category &&
      i.text.trim() &&
      (!i.clusterId || !clusters.some((c) => c.id === i.clusterId)),
  );

  const modelResources = phase3.hypotheses.filter((i) => i.text.trim());
  const erfahrungen = phase3.experiential.filter(
    (i) => i.category !== "aussen" && i.text.trim(),
  );
  const aussen = phase3.experiential.filter(
    (i) => i.category === "aussen" && i.text.trim(),
  );
  const innerLegacy = phase3.innerResources.filter((i) => i.text.trim());
  const marker = phase3.somaticMarkers.filter((i) => i.text.trim());
  const donts = dontPattern.filter(
    (d) => d.resources.trim() || d.behavior.trim() || d.effect.trim(),
  );

  return (
    <div
      className={cn(
        "grid gap-4",
        compact ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3",
      )}
    >
      <Area
        title="Meine Intelligenzen"
        filled={phase3.intelligences.length > 0}
        emptyHint="Füllt sich in Schritt 3.2."
      >
        <PolaritySplit items={phase3.intelligences} />
      </Area>

      <Area
        title="Meine Motive"
        filled={phase3.motives.length > 0}
        emptyHint="Füllt sich in Schritt 3.3."
      >
        <PolaritySplit items={phase3.motives} />
      </Area>

      <Area
        title="Meine Persönlichkeitseigenschaften"
        filled={personalityTraits.length > 0}
        emptyHint="Füllt sich in Schritt 3.3."
      >
        <PolaritySplit items={personalityTraits} />
      </Area>

      <Area
        title="Meine Werte"
        filled={values.length > 0}
        emptyHint="Füllt sich in Schritt 3.4."
      >
        <div className="space-y-3">
          {VALUE_COLUMNS.map((column) => {
            const entries = values.filter(
              (i) => i.category === column.category && i.text.trim(),
            );
            if (entries.length === 0) return null;
            return (
              <div key={column.category}>
                <p className="text-xs font-medium uppercase tracking-wide text-faint">
                  {column.label}
                </p>
                <ul className="mt-1 space-y-1">
                  {entries.map((i) => (
                    <li key={i.id} className="flex items-start gap-2 text-sm">
                      <PolarityDot polarity={i.polarity} />
                      <span className="text-foreground">{i.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {values.some((i) => !i.category && i.text.trim()) ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-faint">
                Weitere
              </p>
              <ul className="mt-1 space-y-1">
                {values
                  .filter((i) => !i.category && i.text.trim())
                  .map((i) => (
                    <li key={i.id} className="flex items-start gap-2 text-sm">
                      <PolarityDot polarity={i.polarity} />
                      <span className="text-foreground">{i.text}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Area>

      <Area
        title="Werte der Anderen"
        filled={otherGroups.length > 0 || otherLegacy.length > 0 || !!insight}
        emptyHint="Füllt sich in Schritt 3.5."
      >
        <div className="space-y-3">
          {otherGroups.map((group) => (
            <div key={group.id}>
              <p className="text-xs font-medium uppercase tracking-wide text-faint">
                {group.name}
                {group.skipped ? " · übersprungen" : ""}
              </p>
              {group.wer ? (
                <p className="mt-0.5 text-xs text-muted">Wer: {group.wer}</p>
              ) : null}
              {group.werte.length > 0 ? (
                <ul className="mt-1 space-y-0.5 text-sm text-foreground">
                  {group.werte.map((i) => (
                    <li key={i.id}>{i.text}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
          {otherLegacy.length > 0 ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-faint">
                Weitere
              </p>
              <ul className="mt-1 space-y-0.5 text-sm text-foreground">
                {otherLegacy.map((i) => (
                  <li key={i.id}>{i.text}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {insight ? (
            <p className="border-t border-subtle pt-2 text-sm text-muted">
              <span className="font-medium text-foreground">Erkenntnisse:</span>{" "}
              {insight}
            </p>
          ) : null}
        </div>
      </Area>

      <Area
        title="Ressourcen aus Modellen"
        filled={modelResources.length > 0}
        emptyHint="Füllt sich in Schritt 3.6."
      >
        <ul className="space-y-1.5">
          {modelResources.map((i) => (
            <li key={i.id} className="text-sm text-foreground">
              {i.note?.trim() ? (
                <span className="mr-1.5 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
                  {i.note.trim()}
                </span>
              ) : null}
              {i.text}
            </li>
          ))}
        </ul>
      </Area>

      <Area
        title="Weitere Ressourcen"
        filled={
          erfahrungen.length > 0 ||
          aussen.length > 0 ||
          innerLegacy.length > 0 ||
          marker.length > 0
        }
        emptyHint="Füllt sich in den Schritten 3.7 und 3.8."
      >
        <div className="space-y-3">
          {erfahrungen.length > 0 ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-faint">
                Biografie
              </p>
              <ul className="mt-1 space-y-0.5 text-sm text-foreground">
                {erfahrungen.map((i) => (
                  <li key={i.id}>{i.text}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {aussen.length > 0 ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-faint">
                Fakten des Kontexts / Andere
              </p>
              <ul className="mt-1 space-y-0.5 text-sm text-foreground">
                {aussen.map((i) => (
                  <li key={i.id}>{i.text}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {innerLegacy.length > 0 ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-faint">
                Innere Ressourcen
              </p>
              <ul className="mt-1 space-y-0.5 text-sm text-foreground">
                {innerLegacy.map((i) => (
                  <li key={i.id}>{i.text}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {marker.length > 0 ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-faint">
                Körpersignale
              </p>
              <p className="mt-1 text-sm text-foreground">
                {marker.map((i) => i.text).join(" · ")}
              </p>
            </div>
          ) : null}
        </div>
      </Area>

      <Area
        title="Bisheriges Muster — Don’t!"
        filled={donts.length > 0}
        emptyHint="Füllt sich in Schritt 3.9."
        tone="ist"
        wide
      >
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs font-medium uppercase tracking-wide text-ist">
            <span>Ressourcen</span>
            <span>Verhalten</span>
            <span>Folgen</span>
          </div>
          {donts.map((d) => (
            <div
              key={d.id}
              className="grid grid-cols-3 gap-2 rounded-lg border border-ist/30 bg-background/60 p-2 text-sm text-foreground"
            >
              <span>{d.resources.trim() || "—"}</span>
              <span>{d.behavior.trim() || "—"}</span>
              <span>{d.effect.trim() || "—"}</span>
            </div>
          ))}
        </div>
      </Area>
    </div>
  );
}

/**
 * Full-screen overlay presenting the cockpit (opened from the Werkzeuge
 * drawer and from step 3.1). Accessible dialog: focus moves to the close
 * button and is trapped inside (Tab cycles); Esc closes ONLY this layer —
 * the handler runs in the capture phase and stops propagation so the
 * AppShell drawer's own Esc handler doesn't also close the drawer beneath.
 */
export function RessourcenCockpitOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key === "Tab") {
        // Simple focus trap: keep Tab cycling inside the dialog.
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusables = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute("disabled"));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (!dialog.contains(active)) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    // Capture phase: runs before the AppShell drawer's bubble-phase handler.
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Mein Ressourcen-Cockpit"
      className="fixed inset-0 z-[60] overflow-y-auto bg-background"
    >
      <div className="mx-auto w-full max-w-5xl p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl text-foreground">
              Mein Ressourcen-Cockpit
            </h2>
            <p className="mt-1 text-sm text-muted">
              Dein Überblick — er füllt sich mit jedem Schritt der Phase 3.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Cockpit schließen"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="size-5" />
          </button>
        </div>
        <RessourcenCockpit />
      </div>
    </div>
  );
}
