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
  /** Postal address shown in the Impressum. */
  address: "‹ANSCHRIFT›", // TODO: vor Launch eintragen
  /** Person responsible for the content (Impressum, i. S. d. P.). */
  responsiblePerson: "‹VERANTWORTLICH›", // TODO: vor Launch eintragen
} as const;

export type Branding = typeof BRANDING;
