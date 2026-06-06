/**
 * Method-name labels used (verbatim) in the orientation pages.
 *
 * The source texts are quoted exactly today: KP 1.1 (Rubikon page) uses
 * "Neue Hamburger Schule", KP 1.2 (values page) uses "SMC". A *unified* label is
 * a separate decision — keeping both here makes that swap a single-file edit.
 * Components should read the short label from here rather than hard-coding it.
 */
export const METHOD_LABELS = {
  /** KP 1.1 — the school's name (declined inline in IntroView; see note there). */
  schoolName: "Neue Hamburger Schule",
  /** KP 1.2 — the short standard label (invariant; interpolated in the texts). */
  standardShort: "SMC",
} as const;
