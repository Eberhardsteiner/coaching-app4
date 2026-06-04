import { PERSONAS, PERSONA_LABELS, usePersona } from "@/app/theme-context";
import { cn } from "@/lib/utils";

/**
 * DEV-only persona switcher. Rendered by App.tsx behind `import.meta.env.DEV`,
 * so it never ships to production. Lets us flip Ruhig/Klar/Frei without a
 * settings screen. The active pill uses bg-accent, so it also visualises the
 * current accent colour.
 */
export function PersonaSwitcher() {
  const { persona, setPersona } = usePersona();

  return (
    <div
      role="group"
      aria-label="Persona wechseln (nur Entwicklung)"
      className="fixed bottom-4 left-4 z-[60] flex items-center gap-1 rounded-full border border-subtle bg-surface/95 p-1 shadow-lg backdrop-blur"
    >
      {PERSONAS.map((p) => {
        const active = p === persona;
        return (
          <button
            key={p}
            type="button"
            onClick={() => setPersona(p)}
            aria-pressed={active}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-accent text-white"
                : "text-muted hover:bg-surface-2 hover:text-foreground",
            )}
          >
            {PERSONA_LABELS[p]}
          </button>
        );
      })}
    </div>
  );
}
