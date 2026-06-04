import { StepNav } from "@/features/phases/StepNav";
import {
  collectSortableResources,
  countPolarities,
  SORTABLE_RESOURCE_LABEL,
  type SortableResourceField,
} from "@/features/phases/phase3/resourceFields";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import { cn } from "@/lib/utils";

type Polarity = "foerderlich" | "hinderlich";

/**
 * Phase 3, Step 3.6 — Sortieren. Every own resource (from the eight sortable
 * fields, *not* othersValues) gets a keyboard-operable förderlich/hinderlich
 * rating that sets `polarity` directly on the item in its source field — no
 * duplication, no drag. Clicking the active rating again clears it ("offen").
 * Soft step: forward is always possible.
 */
export function Step6Sortieren({ nav }: { nav: PhaseNavigation }) {
  const phase3 = useSessionStore((s) => s.session?.phase3);
  const patch = useSessionStore((s) => s.patch);

  function setPolarity(
    field: SortableResourceField,
    id: string,
    polarity: Polarity,
  ) {
    patch((s) => {
      const next = { ...s.phase3 };
      next[field] = next[field].map((item) =>
        item.id === id
          ? {
              ...item,
              polarity: item.polarity === polarity ? undefined : polarity,
            }
          : item,
      );
      return { ...s, phase3: next };
    });
  }

  if (!phase3) return null;

  const entries = collectSortableResources(phase3);
  const counts = countPolarities(phase3);

  return (
    <div className="space-y-5">
      <p className="text-muted">
        Sortiere deine Ressourcen: Was bringt dich deinem Ziel näher
        (förderlich), was hält dich eher zurück (hinderlich)?
      </p>

      {/* Counters */}
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-green-50 px-3 py-1 text-green-800">
          förderlich: {counts.foerderlich}
        </span>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">
          hinderlich: {counts.hinderlich}
        </span>
        <span className="rounded-full bg-surface-2 px-3 py-1 text-muted">
          offen: {counts.offen}
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-lg border border-dashed border-subtle bg-surface p-6 text-center text-sm text-faint">
          Noch keine Ressourcen gesammelt. Geh zurück und sammle in den vorigen
          Schritten.
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map(({ field, item }) => (
            <li
              key={item.id}
              className="flex flex-col gap-2 rounded-lg border border-subtle bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm text-foreground">{item.text || "—"}</p>
                <p className="text-xs text-faint">
                  {SORTABLE_RESOURCE_LABEL[field]}
                </p>
              </div>
              <div
                role="group"
                aria-label={`Einstufung für „${item.text || "Ressource"}“`}
                className="inline-flex shrink-0 overflow-hidden rounded-lg border border-subtle"
              >
                <button
                  type="button"
                  aria-pressed={item.polarity === "foerderlich"}
                  onClick={() => setPolarity(field, item.id, "foerderlich")}
                  className={cn(
                    "px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
                    item.polarity === "foerderlich"
                      ? "bg-green-600 text-white"
                      : "bg-surface text-muted hover:text-foreground",
                  )}
                >
                  Förderlich
                </button>
                <button
                  type="button"
                  aria-pressed={item.polarity === "hinderlich"}
                  onClick={() => setPolarity(field, item.id, "hinderlich")}
                  className={cn(
                    "border-l border-subtle px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
                    item.polarity === "hinderlich"
                      ? "bg-amber-600 text-white"
                      : "bg-surface text-muted hover:text-foreground",
                  )}
                >
                  Hinderlich
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext
      />
    </div>
  );
}
