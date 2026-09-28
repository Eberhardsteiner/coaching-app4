import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BRANDING } from "@/config/branding";

/** True while a branding value is still a ‹…›-placeholder. */
function isPlaceholder(value: string): boolean {
  return value.includes("‹") || value.includes("›");
}

/** One contact field; a placeholder is shown visibly marked (G3). */
function ContactField({ label, value }: { label: string; value: string }) {
  const placeholder = isPlaceholder(value);
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-faint">
        {label}
      </dt>
      <dd className="mt-0.5 break-words">
        {placeholder ? (
          <span className="inline-block rounded border border-dashed border-amber-600/40 bg-amber-50 px-1.5 py-0.5 text-xs text-amber-900">
            Platzhalter {value}
          </span>
        ) : (
          <span className="text-foreground">{value}</span>
        )}
      </dd>
    </div>
  );
}

/**
 * Reusable contact card for the coach team (used in step 5.3, the completion
 * page and the Hilfe drawer). G3: reads name, e-mail and a short text from
 * `BRANDING.coachTeam*`. While a value is still a ‹PLACEHOLDER›, it is shown
 * as a marked placeholder and no mailto button is offered (no dead link). The
 * real values later go into branding.ts only.
 */
export function ContactCard() {
  const email = BRANDING.coachTeamEmail;
  const emailPlaceholder = isPlaceholder(email);

  return (
    <div className="rounded-xl border border-subtle bg-surface p-4">
      <p className="text-sm font-medium text-foreground">
        Kontakt zum Coach-Team
      </p>
      <p className="mt-1 text-sm text-muted">
        Fragen, Zweifel oder Wunsch nach Begleitung? Melde dich gern.
      </p>
      <dl className="mt-3 space-y-2 text-sm">
        <ContactField label="Name" value={BRANDING.coachTeamName} />
        <ContactField label="Über uns" value={BRANDING.coachTeamText} />
        <ContactField label="E-Mail" value={email} />
      </dl>
      {emailPlaceholder ? null : (
        <Button asChild variant="outline" size="sm" className="mt-3">
          <a href={`mailto:${email}`}>
            <Mail />
            E-Mail schreiben
          </a>
        </Button>
      )}
    </div>
  );
}
