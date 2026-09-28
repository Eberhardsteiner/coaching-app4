/**
 * Central registry for all brand- and name-related strings.
 *
 * WORDING RULE (binding): no real names anywhere in the code or UI.
 * Components must ALWAYS read from `BRANDING.*` — never hard-code a brand,
 * organisation or person name. Replace the ‹PLACEHOLDER› values once the
 * brand is finalised.
 */
export const BRANDING = {
  /** Product / application name. */
  appName: "‹APP_NAME›", // TODO: Markennamen später einsetzen
  /** Operating organisation / company name. */
  orgName: "‹ORG_NAME›", // TODO: Unternehmensnamen später einsetzen
  /** Neutral method label, safe to show in UI. */
  methodLabel: "systemisches Coaching", // neutral; TODO: ggf. später anpassen
  /** Short claim / subtitle shown alongside the app name. */
  tagline: "‹TAGLINE›", // TODO: Claim / Untertitel später einsetzen
  /** Contact address for the footer / imprint. */
  contactEmail: "‹CONTACT_EMAIL›", // TODO: Kontaktadresse später einsetzen
  /**
   * G3: „Kontakt zum Coach-Team“ (Hilfe-Schublade, 5.3, Abschlussseite).
   * Solange ein Wert noch ein ‹…›-Platzhalter ist, zeigt die Karte ihn
   * sichtbar als Platzhalter an und bietet keinen E-Mail-Link an.
   */
  coachTeamName: "‹COACHTEAM_NAME›", // TODO: Name des Coach-Teams
  coachTeamEmail: "‹COACHTEAM_EMAIL›", // TODO: E-Mail-Adresse des Coach-Teams
  coachTeamText: "‹COACHTEAM_TEXT›", // TODO: kurzer Text, z. B. wer ihr seid und wann ihr antwortet
  /** Postal address shown in the Impressum. */
  address: "‹ANSCHRIFT›", // TODO: vor Launch eintragen
  /** Person responsible for the content (Impressum, i. S. d. P.). */
  responsiblePerson: "‹VERANTWORTLICH›", // TODO: vor Launch eintragen
} as const;

export type Branding = typeof BRANDING;
