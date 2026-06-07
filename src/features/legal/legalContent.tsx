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
    <div className="space-y-3">
      <p className={PROSE}>
        Dieses Angebot dient der{" "}
        <strong className="font-medium text-foreground">
          Selbsthilfe und Weiterbildung
        </strong>
        . Es ist{" "}
        <strong className="font-medium text-foreground">
          keine Heilbehandlung, Psychotherapie oder medizinische bzw.
          psychologische Beratung
        </strong>{" "}
        und ersetzt keine fachliche Hilfe.
      </p>
      <p className={PROSE}>
        Ein bestimmtes Ergebnis wird{" "}
        <strong className="font-medium text-foreground">
          nicht zugesichert
        </strong>
        ; Entscheidungen und Handlungen liegen in deiner{" "}
        <strong className="font-medium text-foreground">
          Eigenverantwortung
        </strong>
        . Die App stellt{" "}
        <strong className="font-medium text-foreground">Struktur</strong>{" "}
        bereit,{" "}
        <strong className="font-medium text-foreground">
          keine Ratschläge
        </strong>
        .
      </p>
      <p className={PROSE}>
        Deine Eingaben werden{" "}
        <strong className="font-medium text-foreground">
          ausschließlich lokal in deinem Browser
        </strong>{" "}
        gespeichert und verlassen dein Gerät nur, wenn du selbst exportierst
        oder Inhalte kopierst.
      </p>
    </div>
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
    <div className="space-y-3">
      <p className={PROSE}>
        Coaching ist{" "}
        <strong className="font-medium text-foreground">
          kein Ersatz für ärztliche oder psychotherapeutische Hilfe
        </strong>
        . Wenn dein Thema mit einer{" "}
        <strong className="font-medium text-foreground">Sucht</strong>, einer{" "}
        <strong className="font-medium text-foreground">
          akuten psychischen Belastung
        </strong>{" "}
        (z. B. anhaltende Niedergeschlagenheit, Angst, Krisen) oder dem Wunsch
        zu tun hat, dass sich andere ändern, ist Selbstcoaching nicht das
        richtige Werkzeug.
      </p>
      <p className={PROSE}>
        Bitte hole dir in{" "}
        <strong className="font-medium text-foreground">akuten Krisen</strong>{" "}
        ärztliche oder psychotherapeutische Hilfe.
      </p>
    </div>
  );
}

/** Kurzer Datenschutz-Hinweis für das Consent-Gate. */
export function PrivacyNoticeText() {
  return (
    <p className={PROSE}>
      <strong className="font-medium text-foreground">
        Datenschutz-Hinweis:
      </strong>{" "}
      Alle Eingaben bleiben{" "}
      <strong className="font-medium text-foreground">
        lokal in deinem Browser
      </strong>{" "}
      gespeichert. Es gibt{" "}
      <strong className="font-medium text-foreground">
        keinen Server und kein Tracking
      </strong>{" "}
      und es findet{" "}
      <strong className="font-medium text-foreground">
        keine automatisierte Datenübertragung
      </strong>{" "}
      statt. Daten verlassen dein Gerät nur, wenn du selbst exportierst oder
      Inhalte kopierst. Sitzungen kannst du jederzeit löschen.
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
