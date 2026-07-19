/**
 * K2 — winziger Event-Bus zum programmatischen Öffnen einer Schublade aus
 * dem Bühnen-Inhalt heraus (z. B. „Erkenntnisboard öffnen" in 2.5/3.7).
 * Bewusst ein CustomEvent statt eines Stores: die Schubladen sind lokaler
 * UI-Zustand des AppShell und sollen es bleiben.
 */

export type RequestableDrawerId = "tools" | "notebook" | "models" | "help";

const EVENT = "nhs:open-drawer";

/** Öffnet die Schublade mit der gegebenen Id (no-op ohne AppShell). */
export function requestDrawer(id: RequestableDrawerId) {
  window.dispatchEvent(
    new CustomEvent<RequestableDrawerId>(EVENT, { detail: id }),
  );
}

/** AppShell-Seite: auf Öffnen-Anfragen hören. Gibt die Abmeldung zurück. */
export function onDrawerRequest(
  listener: (id: RequestableDrawerId) => void,
): () => void {
  const handler = (event: Event) => {
    listener((event as CustomEvent<RequestableDrawerId>).detail);
  };
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
