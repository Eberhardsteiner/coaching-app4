import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { ContentLoadState } from "@/features/content/ContentLoadState";
import {
  sucheModelle,
  useSmcKatalog,
  type SmcModell,
} from "@/features/content/smcModelle";

/** Höchstens so viele Elementtreffer stehen in der Zeile unter dem Namen. */
const TREFFER_MAX = 3;

/** Ein Modell, beim Antippen aufklappbar (nur Anzeige). */
function ModellEintrag({
  modell,
  elementTreffer,
}: {
  modell: SmcModell;
  elementTreffer: string[];
}) {
  return (
    <details className="group rounded-lg border border-subtle bg-surface">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 break-words">
          {modell.name}
          {elementTreffer.length > 0 ? (
            <span className="mt-0.5 block text-xs font-normal text-muted">
              Treffer: {elementTreffer.slice(0, TREFFER_MAX).join(", ")}
              {elementTreffer.length > TREFFER_MAX
                ? ` und ${elementTreffer.length - TREFFER_MAX} weitere`
                : ""}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className="mt-0.5 size-4 shrink-0 text-muted motion-safe:transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="space-y-2 border-t border-subtle px-3 py-2 text-sm text-muted">
        {modell.elemente.length > 0 ? (
          <ul className="list-disc space-y-0.5 pl-5">
            {modell.elemente.map((element, index) => (
              <li key={`${index}-${element}`} className="break-words">
                {element}
              </li>
            ))}
          </ul>
        ) : null}
        {modell.beschreibung ? (
          <p className="break-words">{modell.beschreibung}</p>
        ) : null}
        {modell.quelle ? (
          <p className="break-words text-xs">Quelle: {modell.quelle}</p>
        ) : null}
        {modell.hinweis ? (
          <p className="break-words text-xs text-faint">
            Hinweis: {modell.hinweis}
          </p>
        ) : null}
      </div>
    </details>
  );
}

/**
 * Schublade „Modelle“: der Modellkatalog aus public/content/smc-modelle.json,
 * gruppiert nach Bereich (1, 2, 3, 3.3), je Modell aufklappbar mit Elementen,
 * Beschreibung, Quelle und Hinweis. Das Suchfeld durchsucht Name, Aliases
 * und Elemente. Nur Anzeige, keine Bearbeitung.
 */
export function ModelleDrawerContent() {
  const loaded = useSmcKatalog();
  const [suche, setSuche] = useState("");

  if (loaded.status === "loading" || loaded.status === "error") {
    return (
      <ContentLoadState
        status={loaded.status}
        error={loaded.error}
        onRetry={loaded.retry}
        loadingLabel="Modelle werden geladen …"
      />
    );
  }
  const katalog = loaded.katalog;
  if (!katalog) return null;

  // Elementtreffer erst ab zwei Zeichen, sonst trifft fast jedes Element.
  const treffer = sucheModelle(katalog.modelle, suche).map((t) =>
    suche.trim().length < 2 ? { ...t, elementTreffer: [] } : t,
  );
  const gruppen = katalog.bereiche
    .map((bereich) => ({
      bereich,
      treffer: treffer.filter((t) => t.modell.bereich === bereich.id),
    }))
    .filter((g) => g.treffer.length > 0);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <Input
          type="search"
          value={suche}
          onChange={(event) => setSuche(event.target.value)}
          placeholder="Modell oder Begriff suchen"
          aria-label="Modelle durchsuchen (Name, andere Namen, Elemente)"
          className="pl-8"
        />
      </div>
      <p className="text-xs text-faint" aria-live="polite">
        {suche.trim()
          ? `${treffer.length} von ${katalog.modelle.length} Modellen`
          : `${katalog.modelle.length} Modelle`}
      </p>

      {gruppen.length === 0 ? (
        <p className="text-sm text-muted">Kein Modell gefunden.</p>
      ) : null}

      {gruppen.map(({ bereich, treffer: liste }) => (
        <section
          key={bereich.id}
          aria-label={bereich.label}
          className="space-y-2"
        >
          <h3 className="text-xs font-medium uppercase tracking-wide text-faint">
            {bereich.label}
            {katalog.promptBereiche.includes(bereich.id) ? (
              <span className="ml-1.5 inline-block rounded-full bg-accent/10 px-1.5 py-0.5 normal-case tracking-normal text-accent">
                im Prompt
              </span>
            ) : null}
          </h3>
          <ul className="space-y-1.5">
            {liste.map(({ modell, elementTreffer }) => (
              <li key={modell.id}>
                <ModellEintrag
                  modell={modell}
                  elementTreffer={elementTreffer}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
