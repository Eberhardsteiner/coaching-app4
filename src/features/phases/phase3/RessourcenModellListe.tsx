import { ChevronDown } from "lucide-react";

import { ContentLoadState } from "@/features/content/ContentLoadState";
import type { RessourcenModelleResult } from "@/features/content/ressourcenModelle";

/**
 * E3: Übersicht der Modelle aus public/content/ressourcen-modelle.json, je
 * Modell aufklappbar mit Kurzbeschreibung und den Ressourcen, die es liefert.
 * Genutzt in 3.6 und in der Schublade „Modelle“. Platzhalter sind sichtbar
 * gekennzeichnet.
 */
export function RessourcenModellListe({
  loaded,
}: {
  loaded: RessourcenModelleResult;
}) {
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
  if (loaded.modelle.length === 0) {
    return <p className="text-sm text-faint">Die Modellliste ist noch leer.</p>;
  }
  return (
    <ul className="space-y-2">
      {loaded.modelle.map((modell) => (
        <li key={modell.name}>
          <details className="group rounded-xl border border-subtle bg-surface p-3">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-2 text-sm font-medium text-foreground">
              <span className="min-w-0 break-words">
                {modell.name}
                {modell.platzhalter ? (
                  <span className="ml-2 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xs font-normal text-amber-900">
                    Platzhalter
                  </span>
                ) : null}
              </span>
              <ChevronDown
                className="mt-0.5 size-4 shrink-0 text-muted motion-safe:transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <div className="mt-2 space-y-2 text-sm text-muted">
              {modell.kurzbeschreibung ? (
                <p className="break-words">{modell.kurzbeschreibung}</p>
              ) : null}
              {modell.ressourcen.length > 0 ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-faint">
                    Ressourcen aus diesem Modell
                  </p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5">
                    {modell.ressourcen.map((ressource) => (
                      <li key={ressource} className="break-words">
                        {ressource}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
