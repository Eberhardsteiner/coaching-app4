import { BRANDING } from "@/config/branding";

/**
 * Central legal & safety content module.
 *
 * These are DRAFT texts (own wording). // TODO: vor Launch juristisch prüfen.
 * Reused by the footer routes (/rechtliches, /datenschutz, /impressum), the
 * SafetyNotice, and — in Prompt 2 — the consent gate and the help drawer.
 * Organisation name and contact come from BRANDING.* (Wording-Regel: keine
 * echten Namen im Code/UI).
 */

const PROSE = "text-sm leading-relaxed text-muted";
const LINK =
  "rounded-sm text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

/** Rechtliche Entlastung (Disclaimer). */
export function DisclaimerText() {
  return (
    <p className={PROSE}>
      Dieses Angebot dient der Selbsthilfe und Weiterbildung. Es ist keine
      Heilbehandlung, Psychotherapie oder medizinische bzw. psychologische
      Beratung und ersetzt keine fachliche Hilfe. Ein bestimmtes Ergebnis wird
      nicht zugesichert; Entscheidungen und Handlungen liegen in deiner
      Eigenverantwortung. Die App stellt Struktur bereit, keine Ratschläge.
      Deine Eingaben werden ausschließlich lokal in deinem Browser gespeichert
      und verlassen dein Gerät nur, wenn du selbst exportierst oder Inhalte
      kopierst.
    </p>
  );
}

/** Datenschutz. */
export function PrivacyText() {
  return (
    <div className="space-y-4">
      <p className={PROSE}>
        Alle Eingaben bleiben lokal in deinem Browser (IndexedDB). Es gibt
        keinen Server und kein Tracking. Daten verlassen dein Gerät nur, wenn du
        eine Sitzung exportierst oder Text in die Zwischenablage kopierst. Du
        kannst Sitzungen jederzeit löschen.
      </p>
      <p className={PROSE}>
        Verantwortlich: {BRANDING.orgName}. Kontakt:{" "}
        <a className={LINK} href={`mailto:${BRANDING.contactEmail}`}>
          {BRANDING.contactEmail}
        </a>
        .
      </p>
    </div>
  );
}

/** Fachärztlicher / psychotherapeutischer Hinweis (v. a. Selbstcoaching). */
export function MedicalNoticeText() {
  return (
    <p className={PROSE}>
      Coaching ist kein Ersatz für ärztliche oder psychotherapeutische Hilfe.
      Wenn dein Thema mit einer Sucht, einer akuten psychischen Belastung (z. B.
      anhaltende Niedergeschlagenheit, Angst, Krisen) oder dem Wunsch zu tun
      hat, dass sich andere ändern, ist Selbstcoaching nicht das richtige
      Werkzeug. Bitte wende dich an deine Hausärztin/deinen Hausarzt, eine
      psychotherapeutische Praxis — oder an ein begleitetes Coaching.
    </p>
  );
}

/** Impressum — placeholder, fully driven by BRANDING.* + TODO fields. */
export function ImpressumContent() {
  return (
    <div className="space-y-4">
      <p className={PROSE}>Angaben gemäß den gesetzlichen Vorgaben.</p>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="font-medium text-foreground">Anbieter</dt>
          <dd className="text-muted">{BRANDING.orgName}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Anschrift</dt>
          <dd className="text-muted">{BRANDING.address}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Kontakt</dt>
          <dd>
            <a className={LINK} href={`mailto:${BRANDING.contactEmail}`}>
              {BRANDING.contactEmail}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">
            Verantwortlich für den Inhalt
          </dt>
          <dd className="text-muted">{BRANDING.responsiblePerson}</dd>
        </div>
      </dl>
      {/* TODO: vor Launch ergänzen/prüfen — Registereintrag, USt-IdNr.,
          Aufsichtsbehörde, ggf. weitere Pflichtangaben je Rechtsform/Region. */}
    </div>
  );
}
