import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BRANDING } from "@/config/branding";

/** True while branding.contactEmail is still the ‹…›-placeholder. */
function isPlaceholder(email: string): boolean {
  return email.includes("‹") || email.includes("›");
}

/**
 * Reusable contact card for the coach team (used in step 5.3, the completion
 * page and the Hilfe drawer). Reads `BRANDING.contactEmail`; while that is
 * still a ‹PLACEHOLDER›, a calm note replaces the mailto button — no dead
 * link. The real address later goes into branding.ts only.
 */
export function ContactCard() {
  const email = BRANDING.contactEmail;
  const placeholder = isPlaceholder(email);

  return (
    <div className="rounded-xl border border-subtle bg-surface p-4">
      <p className="text-sm font-medium text-foreground">
        Kontakt zum Coach-Team
      </p>
      <p className="mt-1 text-sm text-muted">
        Fragen, Zweifel oder Wunsch nach Begleitung? Melde dich gern.
      </p>
      {placeholder ? (
        <p className="mt-2 text-xs text-faint">
          Kontaktadresse wird in Kürze ergänzt.
        </p>
      ) : (
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
