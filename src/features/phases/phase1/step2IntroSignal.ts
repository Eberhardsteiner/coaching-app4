/**
 * Transientes Signal (pro Seiten-Laden) für die Überleitung Schritt 1 → 2.
 * Schritt 1 ruft beim Vorwärtswechsel armStep2Intro(); Schritt 2 verbraucht es
 * beim Mounten via consumeStep2Intro(). Bewusst modul-lokal/nicht persistiert.
 *
 * Eigener, eindeutiger Dateiname (nicht `step2Intro`) — sonst kollidiert er auf
 * case-insensitiven Dateisystemen mit der Komponente `Step2Intro.tsx`.
 */
let pending = false;

export function armStep2Intro(): void {
  pending = true;
}

export function consumeStep2Intro(): boolean {
  const value = pending;
  pending = false;
  return value;
}
